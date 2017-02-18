import { Injectable } from '@angular/core';
import { SQLite } from 'ionic-native';
import { Observable } from 'rxjs/Rx';

let db = new SQLite();

/*
  Generated class for the SqliteService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SqliteService {

  constructor() {
    console.log('Hello SqliteService Provider');
  }

  openDatabase(dbName: string, dbLocation: string) {
    return db.openDatabase({ name: dbName, location: dbLocation })
  }

  getRepos(startNum: number) {
    return Observable.create((observer) => {
      db.executeSql(`SELECT * FROM repos_json1 LIMIT ${startNum}, ${startNum + 50}`, []).then((data) => {
        if (data.rows.length > 0) {
          let repos = [];
          let repoDescription: string;
          for (let i = 0; i < data.rows.length; i++) {
            repoDescription = data.rows.item(i).description ? data.rows.item(i).description : 'Unknown';  
            repos.push({
              name: data.rows.item(i).name, 
              description: repoDescription,
              url: data.rows.item(i).htmlurl
            });
          }
          observer.next(repos);
          observer.complete();
        }
      }, error => {
        observer.error(error);
      });
    });
  }

}
