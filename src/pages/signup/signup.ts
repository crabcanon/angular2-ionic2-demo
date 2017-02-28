import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';

/*
  Generated class for the Signup page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  signup: { username?: string, email?: string, password?: string } = {};

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public authService: AuthService
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  presentLoader(text: string) {
    return this.loadingCtrl.create({ content: text });
  }

  presentAlert(title: string, subTitle: any, button: string) {
    return this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: [button]
    });
  }

  onSignup(form: NgForm) {
    let loader = this.presentLoader('Signup...');
    loader.present();

    if (form.valid) {
      this.authService.signup(this.signup).subscribe(data => {
        loader.dismiss();
        let alert = this.presentAlert('Signup Done', 'New user created!', 'Dismiss');
        alert.present();
        this.navCtrl.pop();
      }, error => {
        console.log('Signup Error: ', error);
        loader.dismiss();
        let alert = this.presentAlert('Signup Error', error, 'Dismiss');
        alert.present();
      });
    }
  }
}
