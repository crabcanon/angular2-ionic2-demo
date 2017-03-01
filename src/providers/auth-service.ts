import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';

import { Storage } from '@ionic/storage';
import { Events, Platform } from 'ionic-angular';

import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { GLOBALS } from '../global';

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

  header: Headers = new Headers({ 'Content-Type': 'application/json' });
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
    this.expirationInterval = 60000;
  }

  public signup(signupObj: any) {
    let body = {
      'username': signupObj.username,
      'email': signupObj.email,
      'password': signupObj.password,
      'client_id': GLOBALS['AUTH0_CLIENT_ID'],
      'connection': GLOBALS['AUTH0_CONNECTION']
    };
    return this.http.post(GLOBALS['AUTH0_SIGNUP_URL'], JSON.stringify(body), {headers: this.header})
      .map((res: Response) => {
        return res.json();
      });
  }

  public authenticated() {
    return tokenNotExpired('id_token', this.idToken);
  }

  public login(username: string, password: string) {
    let body = JSON.stringify({
      'username': username,
      'password': password,
      'client_id': GLOBALS['AUTH0_CLIENT_ID'],
      'connection': GLOBALS['AUTH0_CONNECTION'],
      'scope': GLOBALS['AUTH0_SCOPE']
    });

    return this.http.post(GLOBALS['AUTH0_OAUTH_URL'], body, {headers: this.header})
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

        let bodyOne = JSON.stringify({
          'client_id': GLOBALS['AUTH0_CLIENT_ID'],
          'grant_type': GLOBALS['FIREBASE_GRANT_TYPE'],
          'scope': GLOBALS['FIREBASE_SCOPE'],
          'id_token': obj['id_token']
        });
        let bodyTwo = JSON.stringify({'id_token': obj['id_token']});

        let httpPostOne = this.http.post(GLOBALS['AUTH0_DELEGATION_URL'], bodyOne, {headers: this.header}).map((res: Response) => res.json());
        let httpPostTwo = this.http.post(GLOBALS['AUTH0_TOKENINFO_URL'], bodyTwo, {headers: this.header}).map((res: Response) => res.json());

        return Observable.forkJoin(httpPostOne, httpPostTwo); 
      });
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
        role: info['roles'][0] ? info['roles'][0] : this.userRole,
        createAt: info['created_at'].split('T')[0]
      };
      this.events.publish('auth:getUserInfo', this.userInfo);
    }, error => {
      console.log('getUserInfo Error: ', error);
    });
  }

  /* Customize the expiration timer */
  public startupCustomizedExpiration() {
    if (this.authenticated()) {
      this.startTime = Date.now();
      console.log('startupCustomizedExpiration: ', this.startTime, this.expirationInterval);
      this.source = Observable.timer(this.expirationInterval);
      let pausable = this.pauser.switchMap(paused => paused ? Observable.never() : this.source);
      pausable.subscribe(() => this.events.publish('auth:customizedExpiration', Date.now()));
      this.pauser.next(false);
    }
  }

  public pauseCustomizedExpiration(pauseTime) {
    if (this.authenticated()) {
      let usedExpirationInterval = pauseTime - this.startTime;
      console.log('usedExpirationInterval: ', usedExpirationInterval);
      this.expirationInterval = this.expirationInterval - usedExpirationInterval; 
      this.pauser.next(true);
    }
  }

  public resumeCustomizedExpiration(resumeTime) {
    if (this.authenticated()) {
      this.startTime = resumeTime;
      console.log('resumeTime: ', resumeTime, this.expirationInterval);
      this.source = Observable.timer(this.expirationInterval);
      this.pauser.next(false);
    }
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
    this.idToken = '';
    this.userRole = '';
    this.tokenInfo = null;
    return Observable.forkJoin(
      Observable.fromPromise(this.storage.remove('id_token')),
      Observable.fromPromise(this.storage.remove('token_info'))
    );
  }

}
