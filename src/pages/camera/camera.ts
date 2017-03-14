import { Component } from '@angular/core';
import { ActionSheetController, ToastController, LoadingController } from 'ionic-angular';
import { Camera } from 'ionic-native';

import { NativeService } from '../../providers/native-service';
import { SqliteService } from '../../providers/sqlite-service';
import { FirebaseService } from '../../providers/firebase-service';

export interface ImageInterface {
  content: string;
  createTime: number;
  uploadTime?: number;
  status: number;
}

export interface ConditionInterface {
  type: string;
  startTime: number;
  endTime: number; 
}

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
  public galleryMode: string;
  public condition: ConditionInterface;
  public startNum: number = 0;
  public image: ImageInterface;
  public sqliteImages: any = [];
  public firebaseImages: any = [];

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public nativeService: NativeService,
    public sqliteService: SqliteService,
    public fbService: FirebaseService
  ) {
    this.galleryMode = 'sqlite';
    this.condition = {
      type: 'all',
      startTime: null,
      endTime: null
    };
    this.openDB();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CameraPage');
  }

  public openDB() {
    this.sqliteService.openDatabase('data.db', 'default').then(() => {
      this.loadSqliteImages();
    }, error => {
      console.log(error);
    });
  }

  public presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from gallery',
          handler: () => this.storeImageToDB(Camera.PictureSourceType.PHOTOLIBRARY)
        },
        {
          text: 'Use Camera',
          handler: () => this.storeImageToDB(Camera.PictureSourceType.CAMERA)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  private storeImageToDB(sourceType) {
    let observablesChain = this.nativeService.parseImageAsString(sourceType).flatMap(imageString => {
      this.image = {
        content: imageString,
        createTime: Date.now(),
        uploadTime: 0,
        status: 0 
      };
      let items: Array<any> = [];
      items.push(this.image);
      console.log('parseImageAsString Done! ', imageString, this.image, items);
      
      return this.sqliteService.insertItemsToGalleryTable(items);
    }).map(message => {
      return message;
    });

    this.sqliteService.openDatabase('data.db', 'default').then(() => {
      observablesChain.subscribe(message => {
        console.log('insertItemsToGalleryTable Done! ', message);
        this.startNum = 0;
        this.sqliteImages = [];
        this.loadSqliteImages();
      }, error => {
        console.log('insertItemsToGalleryTable Failed! ', error);
      }, () => {
        console.log('insertItemsToGalleryTable and show done!');
      });
    }, error => {
      console.log('OpenDB Error!');
    });
  }

  public loadSqliteImages() {
    return new Promise((resolve, reject) => {
      this.sqliteService.selectItemsFromGalleryTable(this.condition, this.startNum).subscribe(items => {
        console.log(items);
        this.sqliteImages = this.sqliteImages.concat(items);
      }, (error) => {
        console.log('Loading SQLite Images Error: ', JSON.stringify(error));
        reject(error);
      }, () => {
        console.log('Loading SQLite Images Finished!');
        resolve(true);
      });
    });
  }

  public loadMoreSqliteImages(infiniteScroll: any) {
    console.log('Loading More SqliteImages: startNum is currently ' + this.startNum);
    this.startNum += 50;

    this.loadSqliteImages().then(() => infiniteScroll.complete());
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
