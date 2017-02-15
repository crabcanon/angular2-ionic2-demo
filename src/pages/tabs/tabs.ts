import { Component } from '@angular/core';
import { Events, NavParams } from 'ionic-angular';

import { ReposPage } from '../repos/repos';
import { CameraPage } from '../camera/camera';
import { UploadPage } from '../upload/upload';
import { AboutPage } from '../about/about';

import { Auth } from '../../providers/auth';

export interface TabsInterface {
  title: string;
  root: any;
  icon: string;
}

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  public tabs = [];
  public tabId: number;
  public selectTabIndex: number;

  roleOneTabs: TabsInterface[] = [
    { title: 'About', root: AboutPage, icon: 'home' },
    { title: 'Repos', root: ReposPage, icon: 'copy' },
    { title: 'Camera', root: CameraPage, icon: 'camera' },
    { title: 'Upload', root: UploadPage, icon: 'cloud-upload' }
  ];
  roleTwoTabs: TabsInterface[] = [
    { title: 'About', root: AboutPage, icon: 'home' },
    { title: 'Repos', root: ReposPage, icon: 'copy' },
    { title: 'Camera', root: CameraPage, icon: 'camera' }
  ];
  roleThreeTabs: TabsInterface[] = [
    { title: 'About', root: AboutPage, icon: 'home' },
    { title: 'Repos', root: ReposPage, icon: 'copy' }
  ];

  constructor(
    public events: Events,
    public auth: Auth,
    public params: NavParams
  ) { 
    this.tabId = params.get('tabId');
    if (this.tabId !== undefined || this.tabId !== null) this.selectTabIndex = this.tabId;
  }

  /*  
   * http://ionicframework.com/docs/v2/api/navigation/NavController/
   * Lifecycle events
   */
  ionViewCanEnter(): boolean{
    let role = this.auth.getUserRole();
    console.log('TabsView Can Enter.');
    if (role) {
      switch (role) {
        case 'super_admin': 
          this.tabs = this.roleOneTabs;
          break;
        case 'reseller_admin':
          this.tabs = this.roleTwoTabs;
          break;
        case 'customer_admin':
          this.tabs = this.roleThreeTabs;
          break;
        case 'user_admin':
          this.tabs = this.roleThreeTabs;
          break;
        default:
          this.tabs = this.roleThreeTabs;
          break;
      }
      return true;
    }
    return false;
  }

  ionViewDidLoad(): void{
    console.log('TabsView Did Load.');
  }

  ionViewWillEnter(): void{
    console.log('TabsView Will Enter.');
  }

  ionViewDidEnter(): void{
    console.log('TabsView Did Enter.');
  }

  ionViewCanLeave(): boolean{
    console.log('TabsView Can Leave.');
    return true;
  }

  ionViewWillUnload(): void{
    console.log('TabsView Will Unload.');
  }

  ionViewWillLeave(): void{
    console.log('TabsView Will Leave.');
  }

  ionViewDidLeave(): void{
    console.log('TabsView Did Leave.');
  }
}
