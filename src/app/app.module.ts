import { NgModule, ErrorHandler } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { AboutPage } from '../pages/about/about';
import { ReposPage } from '../pages/repos/repos';
import { UploadPage } from '../pages/upload/upload';
import { CameraPage } from '../pages/camera/camera';
import { TabsPage } from '../pages/tabs/tabs';
import { Auth } from '../providers/auth';
import { Native } from '../providers/native';

// export function provideStorage() {
//   return new Storage(['sqlite', 'websql', 'indexeddb'], {name: 'upmdb'});
// }

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    AboutPage,
    ReposPage,
    UploadPage,
    CameraPage,
    TabsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp, {}, {
      links: [
        { component: LoginPage, name: 'Login', segment: 'login' },
        { component: TabsPage, name: 'Tabs', segment: 'tabs/:tabId' }
      ]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    AboutPage,
    ReposPage,
    UploadPage,
    CameraPage,
    TabsPage
  ],
  providers: [Auth, Native, Storage, {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
