import { Component } from '@angular/core';
import { ActionSheetController, ToastController, LoadingController } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { Observable, Subject } from 'rxjs/Rx';
import { FirebaseListObservable } from 'angularfire2';

import { AuthService } from '../../providers/auth-service';
import { NativeService } from '../../providers/native-service';
import { SqliteService } from '../../providers/sqlite-service';
import { FirebaseService } from '../../providers/firebase-service';

export interface ImageInterface {
  content: string;
  createtime: number;
  uploadtime?: number;
  status: number;
  id?: number;
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
  public userKey: string = '';
  public galleryMode: string;
  public condition: ConditionInterface;
  public startSqliteNum: number = 0;
  public startFirebaseNum: number = 0;
  public image: ImageInterface = null;
  public sqliteImages: ImageInterface[] = [];
  public selectedSqliteImages: Array<any> = [];
  public firebaseImages: FirebaseListObservable<any[]>;
  public selectedFirebaseImages: FirebaseListObservable<any[]>;
  public uploadEventSubject: Subject<any> = new Subject();
  public firebaseQuerySubject: Subject<any> = new Subject();

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public authService: AuthService,
    public nativeService: NativeService,
    public sqliteService: SqliteService,
    public firebaseService: FirebaseService
  ) {
    this.galleryMode = 'sqlite';
    this.condition = {
      type: 'all',
      startTime: null,
      endTime: null
    };
    this.getFirebaseUserId();
    this.openDB();
    // this.firebaseQuerySubject.next(this.startFirebaseNum);
    this.uploadEventSubject
      .concatAll()
      .flatMap(item => this.processEvent(item))
      .map(msg => msg)
      .subscribe(msg => {
        console.log('Upload and delete messages: ', JSON.stringify(msg));
      }, error => {
        console.log('Upload and delete error: ', error);
        this.presentToast(error);
      }, () => {
        this.presentToast('All the images have been successfully uploaded to Firebase and deleted from SQLite');
      });
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

  public getFirebaseUserId() {
    this.authService.getUserInfoPromise().then(data => {
      let info = JSON.parse(data);
      this.userKey = info['user_id'];
      this.loadFirebaseImages();
    })
  }

  public createSqliteImages() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from gallery',
          handler: () => this.storeImageToSqlite(Camera.PictureSourceType.PHOTOLIBRARY)
        },
        {
          text: 'Use Camera',
          handler: () => this.storeImageToSqlite(Camera.PictureSourceType.CAMERA)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  private storeImageToSqlite(sourceType) {
    let observablesChain = this.nativeService.parseImageAsString(sourceType).flatMap(imageString => {
      this.image = {
        content: imageString,
        createtime: Date.now(),
        uploadtime: 0,
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
        this.startSqliteNum = 0;
        this.sqliteImages = [];
        this.loadSqliteImages();
      }, error => {
        console.log('insertItemsToGalleryTable Failed! ', error);
      }, () => {
        this.presentToast('New image has been successfully stored in your local SQLite database.');
      });
    }, error => {
      console.log('OpenDB Error!');
    });
  }

  public loadSqliteImages() {
    return new Promise((resolve, reject) => {
      this.sqliteService.selectItemsFromGalleryTable(this.condition, this.startSqliteNum).subscribe(items => {
        console.log(items);
        this.sqliteImages = this.sqliteImages.concat(items);
      }, error => {
        console.log('Loading SQLite Images Error: ', JSON.stringify(error));
        reject(error);
      }, () => {
        console.log('Loading SQLite Images Finished!');
        resolve(true);
      });
    });
  }

  public loadMoreSqliteImages(infiniteScroll: any) {
    console.log('Loading More SqliteImages: startSqliteNum is currently ' + this.startSqliteNum);
    this.startSqliteNum += 50;

    this.loadSqliteImages().then(() => infiniteScroll.complete());
  }

  public uploadSqliteImages() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Upload Images To Firebase',
      buttons: [
        {
          text: 'Upload selected images',
          handler: () => this.uploadSelectedSqliteImages()
        },
        {
          text: 'Upload all images',
          handler: () => this.uploadAllSqliteImages()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  private uploadSelectedSqliteImages() {
    this.selectedSqliteImages = this.sqliteImages.filter(item => item.status !== 0);
    console.log('this.selectedSqliteImages: ', this.selectedSqliteImages);
    this.onUploadEvent(this.selectedSqliteImages);
  }

  private uploadAllSqliteImages() {
    this.onUploadEvent(this.sqliteImages);
  }

  private onUploadEvent(itemsArray: ImageInterface[]) {
    let uploadEventSource = Observable.from(itemsArray);
    this.uploadEventSubject.next(uploadEventSource);
  }

  private processEvent(item: any) {
    item.uploadtime = Date.now();
    item.status = 0;
    let condition = {type: 'ids', ids: `${item.id}`};
    console.log('selectedSqliteImage, condition, userKey: ', item, condition, this.userKey);

    // let observable1 = Observable.fromPromise(this.firebaseService.createImage(this.userKey, item));
    // let observable2 = Observable.fromPromise(this.sqliteService.deleteItemsFromGalleryTable(condition, true));
    // let observable3 = Observable.fromPromise(this.loadSqliteImages());
    // let observable4 = Observable.fromPromise(this.loadFirebaseImages());
    // return Observable.concat(observable1, observable2, observable3, observable4);
    return Observable.create(observer => {
      this.firebaseService.createImage(this.userKey, item).then(() => {
        return this.sqliteService.deleteItemsFromGalleryTable(condition, true);
      }).catch(error => {
        observer.error(`Upload image (id: ${item.id}) to Firebase failed.`);
      }).then(() => {
        this.sqliteImages = [];
        this.startSqliteNum = 0;
        return this.loadSqliteImages();
      }).then(() => {
        // this.startFirebaseNum = 0;
        // this.firebaseQuerySubject.next(this.startFirebaseNum);
        this.loadFirebaseImages();
        observer.next(`Image (id: ${item.id}) uploaded to Firebase and deleted from SQLite.`);
        observer.complete();
      }).catch(error => {
        observer.error(`Delete image (id: ${item.id}) from SQLite failed.`);
      });
    });
  }

  public deleteSqliteImages() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Delete SQLite Images',
      buttons: [
        {
          text: 'Delete selected images',
          handler: () => this.deleteSelectedSqliteImages()
        },
        {
          text: 'Delete all images',
          handler: () => this.deleteAllSqliteImages()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  private deleteSelectedSqliteImages() {
    this.selectedSqliteImages = this.sqliteImages.filter(item => item.status !== 0).map(item => item.id);
    let condition = {type: 'ids', ids: this.selectedSqliteImages.toString()};
    this.sqliteService.deleteItemsFromGalleryTable(condition).subscribe(message => {
      this.presentToast(message);
    }, error => {
      this.presentToast(JSON.stringify(error));
    }, () => {
      this.startSqliteNum = 0;
      this.sqliteImages = [];
      this.loadSqliteImages();
    });
  }

  private deleteAllSqliteImages() {
    let condition = {type: 'all', ids: ''};
    this.sqliteService.deleteItemsFromGalleryTable(condition).subscribe(message => {
      this.presentToast(message);
    }, error => {
      this.presentToast(JSON.stringify(error));
    }, () => {
      this.startSqliteNum = 0;
      this.sqliteImages = [];
    });
  }

  public loadFirebaseImages() {
    this.firebaseImages = this.firebaseService.readImages(this.userKey, this.firebaseQuerySubject, 50);
  }

  // public loadMoreFirebaseImages(infiniteScroll: any) {
  //   console.log('Loading More FirebaseImages: startFirebaseNum is currently ' + this.startFirebaseNum);
  //   this.startFirebaseNum += 50;
  //   this.firebaseQuerySubject.next(this.startFirebaseNum);
  // }

  public downloadFirebaseImages() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Download Images To SQLite',
      buttons: [
        {
          text: 'Download selected images',
          handler: () => this.downloadSelectedFirebaseImages()
        },
        {
          text: 'Download all images',
          handler: () => this.downloadAllFirebaseImages()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  private downloadSelectedFirebaseImages() {

  }

  private downloadAllFirebaseImages() {

  }

  public deleteFirebaseImages() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Delete Firebase Images',
      buttons: [
        {
          text: 'Delete selected images',
          handler: () => this.deleteSelectedFirebaseImages()
        },
        {
          text: 'Delete all images',
          handler: () => this.deleteAllFirebaseImages()
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  private deleteSelectedFirebaseImages() {

  }

  private deleteAllFirebaseImages() {
    this.firebaseService.deleteAllImages(this.userKey).then(() => {
      this.presentToast('All the Firebase images have been successfully deleted.');
    }).catch(error => {
      this.presentToast(JSON.stringify(error));
    });
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
