import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { SqliteService }  from '../../providers/sqlite-service';

export interface RepoInterface {
  name: string;
  description?: string;
  url?: string;
}

/*
  Generated class for the Repos page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-repos',
  templateUrl: 'repos.html'
})
export class ReposPage {
  public repos: RepoInterface[] = [];
  private startNum: number = 1;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private platform: Platform,
    public sqliteService: SqliteService
  ) {
    platform.ready().then(() => {
      this.openDB();
    });
  }

  ionViewCanEnter(): boolean{
    console.log('ReposView Can Enter.');
    return true;
  }

  ionViewDidLoad() {
    console.log('ReposView Did Load.');
  }

  openDB() {
    this.sqliteService.openDatabase('data.db', 'default').then(() => {
      this.loadRepos();
    }, error => {
      console.log(error);
    });
  }

  loadRepos() {
    return new Promise((resolve, reject) => {
      this.sqliteService.getRepos(this.startNum).subscribe((data) => {
        console.log(data);
        this.repos = this.repos.concat(data);
      }, (error) => {
        console.log('Loading Repos Error: ', error);
        reject(error);
      }, () => {
        console.log('Loading Repos Finished!');
        resolve(true);
      });
    });
  }

  loadMoreRepos(infiniteScroll:any) {
     console.log('Loading More Repos: startNum is currently ' + this.startNum);
     this.startNum += 50;
     
     this.loadRepos().then(() => {
       infiniteScroll.complete();
     });
  }
}
