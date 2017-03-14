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
  private images: FirebaseListObservable<any>;
  private user: any;
  private image: any;

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
    return this.user.set(userInfo);
  }

  updateUser(key: string, userInfo: any) {
    this.user = this.af.database.object(`/users/${key}/profile`);
    return this.user.update(userInfo);
  }

  deleteUser(key: string) {
    this.user = this.af.database.object(`/users/${key}`); 
    return this.user.remove();
  }

  deleteAllUsers() {
    this.users = this.af.database.list('/users');
    return this.users.remove();
  }

  createImage(userKey: string, imageObj: any) {
    this.image = this.af.database.object(`/users/${userKey}/images/${imageObj.id}`);
    return this.image.set(imageObj);
  }

  updateImage(userKey: string, imageKey: string, imageObj: any) {
    this.image = this.af.database.object(`/users/${userKey}/images/${imageKey}`);
    return this.image.update(imageObj);
  }

  readImages(userKey: string, startNumber: number, limitNumber: number) {
    return this.af.database.list(`/users/${userKey}/images`, {
      query: {
        orderByKey: true,
        startAt: startNumber,
        limitToFirst: limitNumber
      }
    });
  }

  deleteImage(userKey: string, imageKey: string) {
    this.image = this.af.database.object(`/users/${userKey}/images/${imageKey}`);
    return this.image.remove();
  }

  deleteAllImages(userKey: string) {
    this.images = this.af.database.list(`/users/${userKey}/images`);
    return this.images.remove();
  }

}
