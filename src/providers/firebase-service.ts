import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { 
  AngularFire,
  FirebaseListObservable, 
  AuthProviders, 
  AngularFireAuth, 
  FirebaseAuthState, 
  AuthMethods 
} from 'angularfire2';

/*
  Generated class for the FirebaseService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FirebaseService {
  private authState: FirebaseAuthState;
  private users: FirebaseListObservable<any>;
  private user: any;

  constructor(
    public auth$: AngularFireAuth,
    public af: AngularFire
  ) {
    console.log('Hello FirebaseService Provider');
    this.authState = auth$.getAuth();
    auth$.subscribe((state: FirebaseAuthState) => this.authState = state);
  }

  get firebaseAuthenticated(): boolean {
    return this.authState !== null;
  }

  firebaseLoginWithCustomToken(token: string) {
    return this.auth$.login(token, {
      provider: AuthProviders.Custom,
      method: AuthMethods.CustomToken
    });
  }

  firebaseLogout(): void {
    this.auth$.logout();
  }

  createUser(userInfo: any) {
    this.user = this.af.database.object(`/users/${userInfo.uid}/profile`);
    this.user.set(userInfo);
  }

  updateUser(key: string, userInfo: any) {
    this.user = this.af.database.object(`/users/${key}/profile`);
    this.user.update(userInfo);
  }

  deleteUser(key: string) {
    this.user = this.af.database.object(`/users/${key}`); 
    this.user.remove();
  }

  deleteAllUsers() {
    this.users = this.af.database.list('/users');
    this.users.remove();
  }

}
