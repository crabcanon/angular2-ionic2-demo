import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular'; 
import { BatteryStatus, Device, Network } from 'ionic-native';
// import { Http } from '@angular/http';
// import 'rxjs/add/operator/map';

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
  Generated class for the Native provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Native {
  public deviceInfo: DeviceInfoInterface;
  public batteryOnChangeSubscription: any;
  public batteryOnLowSubscription: any;
  public batteryOnCriticalSubscription: any;
  public networkConnectSubscription: any;
  public networkDisconnectSubscription: any;


  constructor(public events: Events) {
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
    // this.batteryOnChangeSubscription.unsubscribe();
    // this.batteryOnLowSubscription.unsubscribe();
    // this.batteryOnCriticalSubscription.unsubscribe();
    // this.networkConnectSubscription.unsubscribe();
    // this.networkDisconnectSubscription.unsubscribe();
  }

}
