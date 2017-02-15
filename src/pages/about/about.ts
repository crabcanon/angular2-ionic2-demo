import { Component } from '@angular/core';
import { NavController, Platform, App, Events } from 'ionic-angular';

import { Auth } from '../../providers/auth';
import { Native } from '../../providers/native';

declare var navigator: any;
declare var Connection: any;

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  public userInfo: any = {};
  public deviceInfo: any = {};
  public networkType: string;
  public batteryPlugged: string;
  public batteryLevel: number;
  public batteryStatus: number;

  constructor(
    public platform: Platform,
    public app: App, 
    public navCtrl: NavController,
    public events: Events, 
    public auth: Auth,
    public native: Native
  ) { 
    this.platform.ready().then(() => {
      this.auth.getUserInfo();
      // this.native.checkNetworkConnection();
      this.native.checkBatteryOnChange();

      this.loadUserInfo();
      this.loadDeviceInfo();
      this.loadNetworkInfo();
      this.loadBatteryInfo();
    }, error => {
      console.log('AboutView Error: ', error);
    }); 
  }

  ionViewCanEnter(): boolean{
    console.log('AboutView Can Enter.');
    return true;
  }

  ionViewDidLoad(): void{
    console.log('AboutView Did Load.');
  }

  ionViewWillEnter(): void{
    console.log('AboutView Will Enter.');
  }

  ionViewDidEnter(): void{
    console.log('AboutView Did Enter.');
  }

  ionViewCanLeave(): boolean{
    console.log('AboutView Can Leave.');
    return true;
  }

  ionViewWillUnload(): void{
    console.log('AboutView Will Unload.');
  }

  ionViewWillLeave(): void{
    console.log('AboutView Will Leave.');
  }

  ionViewDidLeave(): void{
    console.log('AboutView Did Leave.');
    this.native.unsubscribeAll();
  }

  loadUserInfo() {
    this.events.subscribe('auth:getUserInfo', data => {
      this.userInfo = data;
    }, error => {
      console.log(error);
    });
  }  

  loadDeviceInfo() {
    this.deviceInfo = this.native.getDeviceInfo();
  }

  loadNetworkInfo() {
    let networkState = navigator.connection.type;
    let states = {};
    states[Connection.UNKNOWN]  = 'Unknown';
    states[Connection.ETHERNET] = 'Ethernet';
    states[Connection.WIFI]     = 'WiFi';
    states[Connection.CELL_2G]  = 'Cell 2G';
    states[Connection.CELL_3G]  = 'Cell 3G';
    states[Connection.CELL_4G]  = 'Cell 4G';
    states[Connection.CELL]     = 'Cell generic';
    states[Connection.NONE]     = 'No network';

    this.networkType = states[networkState];
    // this.events.subscribe('native:networkConnect', type => {
    //   this.networkType = type;
    // }, error => {
    //   console.log(error);
    // });
  }

  loadBatteryInfo() {
    this.events.subscribe('native:batteryOnChange', (level, isPlugged) => {
      this.batteryLevel = level;
      this.batteryPlugged = isPlugged ? 'Yes' : 'No'; 
    }, error => {
      console.log(error);
    });
  }

  logout() {
    this.auth.logout();
    const root = this.app.getRootNav();
    root.popToRoot();
  }

}
