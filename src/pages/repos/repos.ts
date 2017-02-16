import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { SQLite } from 'ionic-native';
import { Observable } from 'rxjs/Rx';

let db = new SQLite();

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
  public repos: RepoInterface[];
  private startNum: number = 1;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private platform: Platform
  ) {
    this.repos = [
      { name: 'Unknown', description: 'Unknown' }
    ]
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
    db.openDatabase({ 
      name: 'data.db',
      location: 'default' 
    })
    .then(() => {
      this.loadRepos().subscribe(() => console.log('Done'));
    })
    .catch((error) => {
      console.log(error);
    });
  }

  loadRepos() {
    return new Observable((observer) => {
      db.executeSql(`SELECT * FROM repos_json1 LIMIT ${this.startNum},${this.startNum + 50}`, []).then((data) => {
        if (data.rows.length > 0) {
          let repoDescription: string;
          for(let i = 0; i < data.rows.length; i++) {
            repoDescription = data.rows.item(i).description ? data.rows.item(i).description : 'Unknown';  
            this.repos.push({
              name: data.rows.item(i).name, 
              description: repoDescription,
              url: data.rows.item(i).htmlurl
            });
          }
          observer.complete();
        }
      });
    });
  }

  loadMoreRepos(infinite:any) {
     console.log('doInfinite, start is currently ' + this.startNum);
     this.startNum += 50;
     
     this.loadRepos().subscribe(() => {
       infinite.complete();
     });
  }


}
