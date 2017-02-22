import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
// import { SecureStorage } from 'ionic-native';
import { Storage } from '@ionic/storage';
import { Events, Platform } from 'ionic-angular';
import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

export interface UserInfoInterface {
  username: string,
  email: string,
  emailVerified: boolean,
  role: string,
  createAt: string
}

/*
  Generated class for the AuthService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AuthService {

  jwtHelper: JwtHelper = new JwtHelper();
  startTime: number;
  expirationInterval: number;
  source: any;
  pauser = new Subject();
  idToken: string;
  userRole: string;
  tokenInfo: any;
  userInfo: UserInfoInterface;

  constructor(
    public http: Http, 
    public events: Events,
    public platform: Platform,
    public storage: Storage
  ) {
    // platform.ready().then(() => {
    //   this.storage.create('secure_storage').then(() => {
    //     console.log('SecureStorage is ready!');
    //   }, error => {
    //     console.log(error);
    //   });
    // }, error => {
    //   console.log(error);
    // })
    this.expirationInterval = 60000;
  }

  public authenticated() {
    return tokenNotExpired('id_token', this.idToken);
  }

  public login(username: string, password: string) {
    let firstUrl = 'https://tieto-upm.eu.auth0.com/oauth/ro';
    let secondUrl = 'https://tieto-upm.eu.auth0.com/tokeninfo';
    let thirdUrl = 'https://tieto-upm.eu.auth0.com/delegation';
    let header = new Headers({ 'Content-Type': 'application/json' });
    let body = {
      'client_id': '8wP6CKrG7YAC1ggU1syVlrJOGyjPU4VE',
      'username': username,
      'password': password,
      'connection': 'Username-Password-Authentication',
      'scope': 'openid'
    };
    return this.http.post(firstUrl, JSON.stringify(body), {headers: header})
      .map((res: Response) => {
        return res.json();
      })
      .flatMap(obj => {
        this.idToken = obj['id_token'];
        this.storage.set('id_token', obj['id_token']).then(() => {
          console.log('id_token saved!')
        }, (error) => {
          console.log(error);
        });
        return this.http.post(secondUrl, JSON.stringify({'id_token': obj['id_token']}), {headers: header})
      })
      .map((res: Response) => res.json());
  }

  public setUserRole(role) {
    this.userRole = role;
  }

  public getUserRole() {
    return this.userRole;
  }

  public setTokenInfo(tokenInfo) {
    this.storage.set('token_info', JSON.stringify(tokenInfo)).then(() => {
      console.log('token_info saved!')
    }, error => {
      console.log(error);
    });
  }

  public getUserInfo() {
    this.storage.get('token_info').then(data => {
      let info = JSON.parse(data);
      this.userInfo = {
        username: info['nickname'],
        email: info['email'],
        emailVerified: info['email_verified'],
        role: info['roles'][0],
        createAt: info['created_at'].split('T')[0]
      };
      this.events.publish('auth:getUserInfo', this.userInfo);
    }, error => {
      console.log('getUserInfo Error: ', error);
    });
  }

  /* Customize the expiration timer */
  public startupCustomizedExpiration() {
    this.startTime = Date.now();
    console.log('startupCustomizedExpiration: ', this.startTime, this.expirationInterval);
    this.source = Observable.timer(this.expirationInterval);
    let pausable = this.pauser.switchMap(paused => paused ? Observable.never() : this.source);
    pausable.subscribe(() => this.events.publish('auth:customizedExpiration', Date.now()));
    this.pauser.next(false);
  }

  public pauseCustomizedExpiration(pauseTime) {
    let usedExpirationInterval = pauseTime - this.startTime;
    console.log('usedExpirationInterval: ', usedExpirationInterval);
    this.expirationInterval = this.expirationInterval - usedExpirationInterval; 
    this.pauser.next(true);
  }

  public resumeCustomizedExpiration(resumeTime) {
    this.startTime = resumeTime;
    console.log('resumeTime: ', resumeTime, this.expirationInterval);
    this.source = Observable.timer(this.expirationInterval);
    this.pauser.next(false);
  }

  /* angular-jwt implementation to check the expiration metadata */
  public startupTokenExpiration() {
    if (this.authenticated()) {
      let source = Observable.of(this.idToken).flatMap(token => {
        let now: number = new Date().valueOf();
        let jwtExp: number = this.jwtHelper.decodeToken(token).exp;
        let exp: Date = new Date(0);
        exp.setUTCSeconds(jwtExp);
        let delay: number = exp.valueOf() - now;

        return Observable.timer(delay);
      });

      source.subscribe(() => this.events.publish('auth:tokenExpiration'));
    }
  }

  public logout() {
    this.expirationInterval = 60000;
    return Observable.forkJoin(
      Observable.fromPromise(this.storage.remove('id_token')),
      Observable.fromPromise(this.storage.remove('token_info'))
    );
  }

}
