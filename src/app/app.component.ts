import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, Events, AlertController } from 'ionic-angular';
import { StatusBar, Splashscreen, BackgroundMode } from 'ionic-native';

import { LoginPage } from '../pages/login/login';
import { AuthService } from '../providers/auth-service';

export interface AlertInterface {
  title: string;
  content: string;
  buttonText: string;
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('nav') navCtrl: NavController;
  
  public rootPage = LoginPage;
  public sessionAlert: AlertInterface = {
    title: 'Will logout soon...',
    content: 'Sorry, you have to re-login to continue becuase of our security protection.',
    buttonText: 'Re-login' 
  };
  public databseAlert: AlertInterface = {
    title: 'Cannot preload database...',
    content: 'Sorry, this platform is not supported for preloading database.',
    buttonText: 'OK'
  };
  
  constructor(
    public platform: Platform,
    public events: Events,
    public alertCtrl: AlertController,
    public authService: AuthService
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      BackgroundMode.disable();


      if (platform.is('ios')) {
        window['plugins'].sqlDB.remove('data.db', 2, this.removeDBSucceeded, this.removeDBFailed);
        window['plugins'].sqlDB.copy('data.db', 2, this.copyDBSucceeded, this.copyDBFailed);
      } else if (platform.is('android')) {
        window['plugins'].sqlDB.remove('data.db', 0, this.removeDBSucceeded, this.removeDBFailed);
        window['plugins'].sqlDB.copy('data.db', 0, this.copyDBSucceeded, this.copyDBFailed);
      } else {
        this.presentAlert(this.databseAlert);
      }
      
      this.events.subscribe('auth:customizedExpiration', (time) => {
        console.log('User is automatically logged out at ' + time);
        this.presentAlert(this.sessionAlert);
        this.authService.logout().subscribe(data => {
          console.log('id_token and token_info removed!');
        }, error => {
          console.log('Logout Error: ', JSON.stringify(error));
        }, () => {
          this.navCtrl.popToRoot();
        });
      });

      // this.events.subscribe('auth:tokenExpiration', () => {
      //   this.presentAlert();
      // });

      this.platform.pause.subscribe(() => {
        console.log('App paused: ', Date.now());
        let pauseTime = Date.now();
        this.authService.pauseCustomizedExpiration(pauseTime);
      });
      this.platform.resume.subscribe(() => {
        console.log('App resumed: ', Date.now());
        let resumeTime = Date.now();
        this.authService.resumeCustomizedExpiration(resumeTime);
      });
    });
  }

  presentAlert(alert) {
    let newAlert = this.alertCtrl.create({
      title: alert['title'],
      message: alert['content'],
      buttons: [
        {
          text: alert['buttonText'],
          handler: () => { newAlert.dismiss() }
        }
      ]
    });
    newAlert.present();
  }

  removeDBSucceeded() {
    console.log('Remove Database Succeeded!');
  }

  removeDBFailed(e) {
    console.log('Remove Database Failed: ', JSON.stringify(e));
  }

  copyDBSucceeded() {
    console.log('Database has been copied to the target location!');
  }

  copyDBFailed(e) {
    switch (e.code) {
      case 516:
        console.log('Database has existed in the target location!');
        break;
      default:
        console.log('Copy Database Error: ', JSON.stringify(e));
        break;
    }
  }
}
