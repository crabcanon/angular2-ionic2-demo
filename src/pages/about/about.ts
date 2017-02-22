import { Component } from '@angular/core';
import { NavController, Platform, App, Events } from 'ionic-angular';

import { AuthService } from '../../providers/auth-service';
import { NativeService } from '../../providers/native-service';

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
    public authService: AuthService,
    public nativeService: NativeService
  ) { 
    this.platform.ready().then(() => {
      this.authService.getUserInfo();
      // this.nativeService.checkNetworkConnection();
      this.nativeService.checkBatteryOnChange();

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
    this.nativeService.unsubscribeAll();
  }

  loadUserInfo() {
    this.events.subscribe('auth:getUserInfo', data => {
      this.userInfo = data;
    }, error => {
      console.log(error);
    });
  }  

  loadDeviceInfo() {
    this.deviceInfo = this.nativeService.getDeviceInfo();
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
    this.authService.logout().subscribe(data => {
      console.log('id_token removed!', data[0]);
      console.log('token_info removed!', data[1]);
    }, error => {
      console.log('Logout Error: ', JSON.stringify(error));
    }, () => {
      const root = this.app.getRootNav();
      root.popToRoot();
    });
  }

}
