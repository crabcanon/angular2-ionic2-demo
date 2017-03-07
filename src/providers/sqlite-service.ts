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

  insertItemsToGalleryTable(tableName: string, items: any) {
    let createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName}(
      id integer PRIMARY KEY AUTOINCREMENT,
      content text NOT NULL,
      createtime integer NOT NULL,
      uploadtime integer NOT NULL,
      status integer NOT NULL
    )`; 
    let insertItemSql = `INSERT INTO ${tableName} (content, createtime, uploadtime, status) VALUES (?, ?, ?, ?)`;
    let sqlBatchArray = [createTableSql].concat(items.map(item => [insertItemSql].concat(Object.values(item))));
    let countItemsSql = `SELECT COUNT(*) FROM ${tableName} WHERE status = 0`;
    let originalAmount: number = null;
    let newAmount: number = null;
    let successMessage: string = '';

    db.executeSql(countItemsSql, []).then((rs) => originalAmount = rs);
    
    return Observable.create((observer) => {
      db.sqlBatch(sqlBatchArray).then(() => {
        db.executeSql(countItemsSql, []).then(rs => {
          newAmount = rs - originalAmount;
          successMessage = `${newAmount} items have been successfully inserted to ${tableName} table. \
          ${rs} items are ready for sync to Firebase.`;
          observer.next(successMessage);
          observer.complete();
        }, error => {
          observer.error(error);
        });
      }, error => {
        observer.error(error);
      });
    });
  }

  updateItemOfGalleryTable(tableName: string, item: any) {
    let updateItemSql = `UPDATE ${tableName} \
    SET uploadtime = '${item.uploadtime}', status = ${item.status} \
    WHERE id = ${item.id}`;

    return Observable.create((observer) => {
      db.executeSql(updateItemSql, []).then(rs => {
        observer.next(`Item ID: ${item.id} has been successfully updated. \
        Uploaded timestamp: ${item.uploadtime}, status: ${item.status}.`);
        observer.complete();
      }, error => {
        observer.error(error);
      });
    });
  }

  selectItemsFromGalleryTable(tableName: string, condition: any, startNum: number) {
    let selectItemsSql: string = '';

    if (typeof condition === 'object' && Object.keys(condition).length === 3 && condition.type) {
      switch (condition.type) {
        case 'all':
          selectItemsSql = `SELECT id, * FROM ${tableName} \
          ORDER BY id ASC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'sync':
          selectItemsSql = `SELECT id, * FROM ${tableName} \
          WHERE status = 1 \
          ORDER BY id ASC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'unsync':
          selectItemsSql = `SELECT id, * FROM ${tableName} \
          WHERE status = 0 \ 
          ORDER BY id ASC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'timestamp':
          selectItemsSql = `SELECT id, * FROM ${tableName} \
          WHERE createtime >= ${condition.startTime} AND createtime <= ${condition.endTime} \
          ORDER BY id ASC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
      }
    } 

    return Observable.create((observer) => {
      if (selectItemsSql) {
        db.executeSql(selectItemsSql, []).then(items => {
          observer.next(items);
          observer.complete();
        }, error => {
          observer.error(error);
        });
      } else {
        observer.error('Images SELECT SQL is empty. Cannot execute SQL.');
      }
    });
  }

  deleteItemsFromGalleryTable(tableName: string, condition: any) {
    let deleteItemSql: string = '';

    if (typeof condition === 'object' && Object.keys(condition).length === 2 && condition.type) {
      switch (condition.type) {
        case 'all':
          deleteItemSql = `DELETE FROM ${tableName}`;
          break;
        case 'sync':
          deleteItemSql = `DELETE FROM ${tableName} WHERE status = 1`;
          break;
        case 'unsync':
          deleteItemSql = `DELETE FROM ${tableName} WHERE status = 0`;
          break;
        case 'ids':
          deleteItemSql = `DELETE FROM ${tableName} WHERE id IN ${condition.ids}`;
          break;
      }
    }

    return Observable.create((observer) => {
      if (deleteItemSql) {
        db.executeSql(deleteItemSql, []).then(() => {
          observer.next('Items have been successfully deleted!');
          observer.complete();
        }, error => {
          observer.error(error);
        });
      } else {
        observer.error('Images DELETE SQL is empty. Cannot execute SQL.');
      }
    });
  }
}
