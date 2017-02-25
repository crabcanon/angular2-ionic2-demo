import { NgModule, ErrorHandler } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

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

// export function provideStorage() {
//   return new Storage(['sqlite', 'websql', 'indexeddb'], {name: 'upmdb'});
// }

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
    })
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
    Storage, 
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
