import { Component } from '@angular/core';
import { ActionSheetController, ToastController, LoadingController } from 'ionic-angular';
import { Camera, File, Transfer, FilePath } from 'ionic-native';

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
  public galleryMode: string;

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ) {
    this.galleryMode = 'sqlite';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CameraPage');
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from gallery',
          handler: () => this.getPhoto(Camera.PictureSourceType.PHOTOLIBRARY)
        },
        {
          text: 'Use Camera',
          handler: () => this.getPhoto(Camera.PictureSourceType.CAMERA)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  getPhoto(sourceType) {
    let options = this.setOptions(sourceType);

    Camera.getPicture(options).then(imageData => {
      this.base64Image = 'data:image/jpeg;base64,' + imageData
    }, error => {
      console.log('Taking Photo Error: ', JSON.stringify(error));
    });
  }

  setOptions(srcType: number) {
    let options = {
      quality: 50,
      targetWidth: 150,
      targetHeight: 150,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: srcType,
      encondingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true
    }
    return options;
  }

}
