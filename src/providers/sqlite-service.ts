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
    return db.openDatabase({ name: dbName, location: dbLocation });
  }

  getRepos(tableName: string, startNum: number) {
    let sqlQuery = `SELECT name, description, htmlurl\ 
    FROM ${tableName}\ 
    LIMIT ${startNum}, ${startNum + 50}`;

    return this.queryReposTable(sqlQuery);
  }

  findRepos(tableName: string, repoName: string, startNum: number) {
    let sqlQuery = `SELECT name, description, htmlurl\ 
    FROM ${tableName}\ 
    WHERE name LIKE '%${repoName}%'\ 
    LIMIT ${startNum}, ${startNum + 50}`;

    return this.queryReposTable(sqlQuery);
  }

  queryReposTable(sqlQuery: string) {
    return Observable.create((observer) => {
      db.executeSql(sqlQuery, []).then((data) => {
        let repos: any = [];
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            repos.push(data.rows.item(i));
          }
        } 
        observer.next(repos);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

}
