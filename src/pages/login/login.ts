import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../providers/auth-service';
import { SignupPage } from '../signup/signup';
import { TabsPage } from '../tabs/tabs';

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
  login: { username?: string, password?: string } = {};
  submitted = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public authService: AuthService
  ) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  presentLoader(text) {
    return this.loadingCtrl.create({ content: text });
  }

  presentAlert(title, subTitle, button) {
    return this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: [button]
    });
  }

  onLogin(form: NgForm) {
    this.submitted = true;
    let loader = this.presentLoader('Login...');
    loader.present();

    if (form.valid) {
      this.authService.login(this.login.username, this.login.password).subscribe(data => {
        console.log('Login Data: ', data, data.roles[0]);
        let role = data.roles[0] ? data.roles[0] : 'user_admin';
        this.authService.setUserRole(role);
        this.authService.setTokenInfo(data);
        if (role === 'user_admin') {
          this.navCtrl.push(TabsPage, { tabId: 1 });
        } else {
          this.navCtrl.push(TabsPage, { tabId: 0 });
        }
        loader.dismiss();
        this.authService.startupCustomizedExpiration();
      }, error => {
        console.log('Login Error: ', error);
        loader.dismiss();
        let alert = this.presentAlert('Login Error', error, 'Dismiss');
        alert.present();
      });
    }
  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }
}
