import { Injectable } from '@angular/core';
import { Events, Platform } from 'ionic-angular'; 
import { BatteryStatus, Device, Network, Camera, File, Transfer, FilePath } from 'ionic-native';
import { Observable } from 'rxjs/Rx';

declare var cordova: any;

export interface DeviceInfoInterface {
  uuid?: string,
  cordova?: string,
  model?: string,
  platform?: string,
  version?: string,
  manufacturer?: string,
  isVirtual?: boolean,
  serial?: string
}

/*
  Generated class for the NativeService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class NativeService {

  public deviceInfo: DeviceInfoInterface;
  public batteryOnChangeSubscription: any;
  public batteryOnLowSubscription: any;
  public batteryOnCriticalSubscription: any;
  public networkConnectSubscription: any;
  public networkDisconnectSubscription: any;


  constructor(public events: Events, public platform: Platform) {
    console.log('Hello Native Provider');
  }

  getDeviceInfo() {
    this.deviceInfo = {
      uuid: Device.uuid,
      cordova: Device.cordova,
      model: Device.model,
      platform: Device.platform,
      version: Device.version,
      manufacturer: Device.manufacturer,
      isVirtual: Device.isVirtual,
      serial: Device.serial
    };
    return this.deviceInfo;
  }

  checkBatteryOnChange() {
    this.batteryOnChangeSubscription = BatteryStatus.onChange().subscribe(statusObj => {
      this.events.publish('native:batteryOnChange', statusObj.level, statusObj.isPlugged);
    }, error => {
      console.log('checkBatteryOnChange Error: ', error);
    });
  }

  checkBatteryOnLow() {
    this.batteryOnLowSubscription = BatteryStatus.onLow().subscribe(() => {
      this.events.publish('native:batteryOnLow', {batteryLow: true});
    }, error => {
      console.log('checkBatteryOnLow Error: ', error);
    })
  }

  checkBatteryOnCritical() {
    this.batteryOnCriticalSubscription = BatteryStatus.onCritical().subscribe(() => {
      this.events.publish('native:batteryOnCritical', {batteryCritical: true});
    }, error => {
      console.log('checkBatteryOnCritical Error: ', error);
    })
  }

  checkNetworkConnection() {
    this.networkConnectSubscription = Network.onConnect().subscribe(() => {
      this.events.publish('native:networkConnect', Network.type);
    }, error => {
      console.log('checkNetworkConnection Error: ', error);
    })
  }

  checkNetworkDisconnection() {
    this.networkDisconnectSubscription = Network.onDisconnect().subscribe(() => {
      this.events.publish('native:networkDisconnect', {networkDisconnect: true});
    }, error => {
      console.log('checkNetworkDisconnection Error: ', error);
    })
  }

  unsubscribeAll() {
    this.batteryOnChangeSubscription.unsubscribe();
    this.batteryOnLowSubscription.unsubscribe();
    this.batteryOnCriticalSubscription.unsubscribe();
    this.networkConnectSubscription.unsubscribe();
    this.networkDisconnectSubscription.unsubscribe();
  }


  parseImageAsString(sourceType) {
    let options = this.setOptions(sourceType);
    let currentName: string = null;
    let currentPath: string = null;

    return Observable.create((observer) => {
      if (this.platform.is('android') && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
        Camera.getPicture(options).then(imagePath => {
          return imagePath; 
        }).catch(error => {
          console.log('Camera GetPicture Error: ', JSON.stringify(error));
          observer.error(error);
        }).then(value => {
          currentName = value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('?'));
          return FilePath.resolveNativePath(value);
        }).then(filePath => {
          currentPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
          console.log('CurrentName, CurrentPath: ', currentName, currentPath);
          return this.convertImageAsBase64(currentPath, currentName);
        }).catch(error => {
          console.log('FilePath Resolve Android Native Path Error: ', JSON.stringify(error));
          observer.error(error);
        }).then(imageString => {
          observer.next(imageString);
          observer.complete();
        });
      } else {
        Camera.getPicture(options).then(imagePath => {
          return imagePath; 
        }).catch(error => {
          console.log('Camera GetPicture Error: ', JSON.stringify(error));
          observer.error(error);
        }).then(value => {
          currentName = value.substr(value.lastIndexOf('/') + 1);
          currentPath = value.substr(0, value.lastIndexOf('/') + 1);
          console.log('CurrentName, CurrentPath: ', currentName, currentPath);
          return this.convertImageAsBase64(currentPath, currentName);
        }).then(imageString => {
          observer.next(imageString);
          observer.complete();
        });
      }
    });
  }

  setOptions(srcType: number) {
    let options = {
      quality: 50,
      targetWidth: 300,
      targetHeight: 300,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: srcType,
      encondingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true
    }
    return options;
  }

  // Create a new name for the image
  createFileName() {
    let d = new Date();
    return `${d.getTime()}.jpg`;
  }

  // Copy the image to a local folder
  copyFileToLocalDir(filePath, fileName, newFileName) {
    return File.copyFile(filePath, fileName, cordova.file.dataDirectory, newFileName);
  }

  // Convert the image as a base64 format string
  convertImageAsBase64(filePath, fileName) {
    console.log('File path and name: ', filePath, fileName);
    return File.readAsDataURL(filePath, fileName);
  }

  // Always get the accurate path to your apps folder
  pathForImage(img) {
    return img ? cordova.file.dataDirectory + img : '';
  }

}
