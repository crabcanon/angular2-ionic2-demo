import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, Events, AlertController } from 'ionic-angular';
import { StatusBar, Splashscreen, BackgroundMode } from 'ionic-native';

import { LoginPage } from '../pages/login/login';
import { Auth } from '../providers/auth';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('nav') navCtrl: NavController;
  public rootPage = LoginPage;

  constructor(
    public platform: Platform,
    public events: Events,
    public alertCtrl: AlertController,
    public auth: Auth
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      BackgroundMode.disable();

      window['plugins'].sqlDB.copy('data.db', 2, this.copySucceeded, this.copyFailed);
      
      this.events.subscribe('auth:customizedExpiration', (time) => {
        console.log('User is automatically logged out at ' + time);
        this.presentAlert();
      });

      // this.events.subscribe('auth:tokenExpiration', () => {
      //   this.presentAlert();
      // });

      this.platform.pause.subscribe(() => {
        console.log('App paused!');
        this.auth.pauseCustomizedExpiration();
      });
      this.platform.resume.subscribe(() => {
        console.log('App resumed!');
        this.auth.resumeCustomizedExpiration();
      });
    });
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Will logout soon...',
      message: 'Sorry, you have to re-login to continue becuase of our security protection.',
      buttons: [
        {
          text: 'Re-Login',
          handler: () => {
            this.auth.logout();
            this.navCtrl.popToRoot();
          }
        }
      ]
    });
    alert.present();
  }

  copySucceeded() {
    console.log('Database has been copied to the target location!');
  }

  copyFailed(e) {
    console.log('Copy Database Error: ', JSON.stringify(e));
  }
}
