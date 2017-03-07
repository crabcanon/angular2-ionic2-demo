import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { SignupPage } from '../signup/signup';
import { TabsPage } from '../tabs/tabs';

import { AuthService } from '../../providers/auth-service';
import { FirebaseService } from '../../providers/firebase-service';

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private login: { username?: string, password?: string } = {};
  private submitted: boolean = false;
  private loader: any;
  private alert: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public authService: AuthService,
    public fbService: FirebaseService
  ) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  presentLoader(text: string) {
    this.loader = this.loadingCtrl.create({ content: text });
    this.loader.present();
  }

  dismissLoader() {
    if (this.loader) this.loader.dismiss();
  }

  presentAlert(title: string, subTitle: any, button: string) {
    this.alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: [button]
    });
    this.alert.present();
  }

  dismissAlert() {
    if (this.alert) this.alert.dismiss();
  }

  onLogin(form: NgForm) {
    this.submitted = true;
    this.presentLoader('Login...');

    if (form.valid) {
      this.authService.login(this.login.username, this.login.password).subscribe(data => {
        console.log('Login Data: ', data[0], data[1], data[1].roles[0]);
        // Proceed the first resolved dataset(token for Firebase auth)
        let role = data[1].roles[0] ? data[1].roles[0] : 'super_admin';
        this.fbService.firebaseLoginWithCustomToken(data[0]['id_token']).then((user) => {
          console.log('Successfully signin Firebase: ', JSON.stringify(user));
          let userInfo = {
            uid: user['uid'],
            email: data[1]['email'],
            name: data[1]['nickname'],
            role: role,
            emailVerified: data[1]['email_verified'],
            avatar: data[1]['picture']
          };
          return userInfo;
        }).catch(error => {
          console.log('Signin Firebase Error: ', error);
          this.dismissLoader();
          this.presentAlert('Signin Firebase Error', JSON.stringify(error), 'Dismiss');
        }).then((value) => {
          console.log('Start creating Firebase user node: ', JSON.stringify(value));
          return this.fbService.createUser(value);
        }).then(() => {
          console.log('Successfully create Firebase user node.');
          // Proceed the second resolved dataset which is returned by forJoin Observable.
          this.authService.setUserRole(role);
          this.authService.setTokenInfo(data[1]);
          if (role === 'user_admin') {
            this.navCtrl.push(TabsPage, { tabId: 1 });
          } else {
            this.navCtrl.push(TabsPage, { tabId: 0 });
          }
          this.dismissLoader();
          this.authService.startupCustomizedExpiration();
        }).catch(error => {
          console.log('Create Firebase User Node Error: ', error);
          this.dismissLoader();
          this.presentAlert('Create Firebase User Node Error', JSON.stringify(error), 'Dismiss');
        });
      }, error => {
        console.log('Login Error: ', error);
        this.dismissLoader();
        this.presentAlert('Login Error', JSON.stringify(error), 'Dismiss');
      });
    }
  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }
}
