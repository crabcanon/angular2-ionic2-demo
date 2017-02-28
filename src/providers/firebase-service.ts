import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AuthProviders, AngularFireAuth, FirebaseAuthState, AuthMethods } from 'angularfire2';

/*
  Generated class for the FirebaseService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FirebaseService {
  private authState: FirebaseAuthState;

  constructor(public auth$: AngularFireAuth) {
    console.log('Hello FirebaseService Provider');
    this.authState = auth$.getAuth();
    auth$.subscribe((state: FirebaseAuthState) => this.authState = state);
  }

  get firebaseAuthenticated(): boolean {
    return this.authState !== null;
  }

  firebaseLogout(): void {
    this.auth$.logout();
  }

  firebaseLoginWithCustomToken(token: string) {
    return this.auth$.login(token, {
      provider: AuthProviders.Custom,
      method: AuthMethods.CustomToken
    });
  }

}
