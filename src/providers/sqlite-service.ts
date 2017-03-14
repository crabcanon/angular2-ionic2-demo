import { Injectable } from '@angular/core';
import { SQLite } from 'ionic-native';
import { Observable } from 'rxjs/Rx';
import dedent from 'dedent';

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
    let sqlQuery = dedent`SELECT name, description, htmlurl\ 
    FROM ${tableName}\ 
    LIMIT ${startNum}, ${startNum + 50}`;

    return this.queryReposTable(sqlQuery);
  }

  findRepos(tableName: string, repoName: string, startNum: number) {
    let sqlQuery = dedent`SELECT name, description, htmlurl\ 
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

  insertItemsToGalleryTable(items: Array<any>) {
    let insertItemSql: string = 'INSERT INTO gallery (content, createtime, uploadtime, status) VALUES (?, ?, ?, ?)';
    
    return Observable.create((observer) => {
      db.transaction((tx) => {
        for (let item of items) {
          console.log('Item: ', item, item.content, item.createTime, item.uploadTime, item.status);
          tx.executeSql(insertItemSql, [item.content, item.createTime, item.uploadTime, item.status]);
        }
      }).then(() => {
        console.log('Insert into gallery table done!');
        observer.next('New items have been inserted into gallery table.');
        observer.complete();
      }, error => {
        console.log('Error when inserting items into gallery table: ', JSON.stringify(error));
        observer.error(error);
      });
    });
  }

  updateItemOfGalleryTable(item: any) {
    let updateItemSql = dedent`UPDATE gallery \
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

  selectItemsFromGalleryTable(condition: any, startNum: number) {
    let selectItemsSql: string = '';

    if (typeof condition === 'object' && Object.keys(condition).length === 3 && condition.type) {
      switch (condition.type) {
        case 'all':
          selectItemsSql = dedent`SELECT id, * FROM gallery \
          ORDER BY id ASC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'sync':
          selectItemsSql = dedent`SELECT id, * FROM gallery \
          WHERE status = 1 \
          ORDER BY id ASC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'unsync':
          selectItemsSql = dedent`SELECT id, * FROM gallery \
          WHERE status = 0 \ 
          ORDER BY id ASC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'timestamp':
          selectItemsSql = dedent`SELECT id, * FROM gallery \
          WHERE createtime >= ${condition.startTime} AND createtime <= ${condition.endTime} \
          ORDER BY id ASC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
      }
    }

    return Observable.create((observer) => {
      console.log('selectItemsSql: ', selectItemsSql);
      if (selectItemsSql) {
        db.executeSql(selectItemsSql, []).then(data => {
          let items: any = [];
          if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
              items.push(data.rows.item(i));
            }
          } 
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

  deleteItemsFromGalleryTable(condition: any) {
    let deleteItemSql: string = '';

    if (typeof condition === 'object' && Object.keys(condition).length === 2 && condition.type) {
      switch (condition.type) {
        case 'all':
          deleteItemSql = `DELETE FROM gallery`;
          break;
        case 'sync':
          deleteItemSql = `DELETE FROM gallery WHERE status = 1`;
          break;
        case 'unsync':
          deleteItemSql = `DELETE FROM gallery WHERE status = 0`;
          break;
        case 'ids':
          deleteItemSql = `DELETE FROM gallery WHERE id IN ${condition.ids}`;
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
