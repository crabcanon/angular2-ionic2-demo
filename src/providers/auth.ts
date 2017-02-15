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
  Generated class for the Auth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Auth {
  // secureStorage: SecureStorage = new SecureStorage();
  jwtHelper: JwtHelper = new JwtHelper();
  pauser = new Subject();
  idToken: string;
  accessToken: string;
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
  }

  public authenticated() {
    return tokenNotExpired('id_token', this.idToken);
  }

  public login(username: string, password: string) {
    let firstUrl = 'https://tieto-upm.eu.auth0.com/oauth/ro';
    let secondUrl = 'https://tieto-upm.eu.auth0.com/tokeninfo';
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
        this.accessToken = obj['access_token'];
        this.storage.set('id_token', obj['id_token']).then(() => {
          console.log('id_token saved!')
        }, (error) => {
          console.log(error);
        });
        this.storage.set('access_token', obj['access_token']).then(() => {
          console.log('access_token saved!')
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
    let source = Observable.timer(600000);
    let pausable = this.pauser.switchMap(paused => paused ? Observable.never() : source);
    pausable.subscribe(() => this.events.publish('auth:customizedExpiration', Date.now()));
    this.pauser.next(false);
  }

  public pauseCustomizedExpiration() {
    this.pauser.next(true);
  }

  public resumeCustomizedExpiration() {
    this.pauser.next(false);
  }

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
    this.storage.remove('id_token')
      .then(() => console.log('id_token removed!'), error => console.log(error));
    this.storage.remove('access_token')
      .then(() => console.log('access_token removed!'), error => console.log(error));
    this.storage.remove('token_info')
      .then(() => console.log('token_info removed!'), error => console.log(error));
  }

}
