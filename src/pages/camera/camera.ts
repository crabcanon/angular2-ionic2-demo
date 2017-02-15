import { Component } from '@angular/core';
import { Camera } from 'ionic-native';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the Camera page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html'
})
export class CameraPage {
  public base64Image: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad CameraPage');
  }

  takePhoto() {
    Camera.getPicture({
      destinationType: Camera.DestinationType.DATA_URL,
      targetHeight: 1000,
      targetWidth: 1000
    }).then(imageData => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData
    }, error => {
      console.log(error);
    });
  }

}
