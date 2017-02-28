import { NgModule, ErrorHandler } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AngularFireModule } from 'angularfire2';

import { GLOBALS } from '../global';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { AboutPage } from '../pages/about/about';
import { ReposPage } from '../pages/repos/repos';
import { UploadPage } from '../pages/upload/upload';
import { CameraPage } from '../pages/camera/camera';

import { AuthService } from '../providers/auth-service';
import { NativeService } from '../providers/native-service';
import { SqliteService } from '../providers/sqlite-service';
import { FirebaseService } from '../providers/firebase-service';

export const firebaseConfig = {
  apiKey: GLOBALS['FIREBASE_API_KEY'],
  authDomain: GLOBALS['FIREBASE_AUTH_DOMAIN'],
  databaseURL: GLOBALS['FIREBASE_DATABASE_URL'],
  storageBucket: GLOBALS['FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: GLOBALS['FIREBASE_MESSAGE_SENDER_ID']
}

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignupPage,
    TabsPage,
    AboutPage,
    ReposPage,
    CameraPage,
    UploadPage
  ],
  imports: [
    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: SignupPage, name: 'Signup', segment: 'signup' },
        { component: LoginPage, name: 'Login', segment: 'login' },
        { component: TabsPage, name: 'Tabs', segment: 'tabs/:tabId' }
      ]
    }),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignupPage,
    TabsPage,
    AboutPage,
    ReposPage,
    CameraPage,
    UploadPage
  ],
  providers: [
    AuthService, 
    NativeService, 
    SqliteService,
    FirebaseService,
    Storage, 
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
