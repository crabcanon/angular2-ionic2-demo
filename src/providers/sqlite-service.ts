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
  public message: string = '';

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

  insertItemsToGalleryTable(items: Array<any>) {
    let insertItemSql: string = 'INSERT INTO gallery (id, name, content, createtime, uploadtime, status) VALUES (?, ?, ?, ?, ?, ?)';
    
    return Observable.create((observer) => {
      db.transaction((tx) => {
        for (let item of items) {
          tx.executeSql(insertItemSql, Object.keys(item).map(k => item[k]));
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
          ORDER BY createtime DESC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'sync':
          selectItemsSql = dedent`SELECT id, * FROM gallery \
          WHERE status = 1 \
          ORDER BY createtime DESC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'unsync':
          selectItemsSql = dedent`SELECT id, * FROM gallery \
          WHERE status = 0 \ 
          ORDER BY createtime DESC \
          LIMIT ${startNum}, ${startNum + 50}`;
          break;
        case 'timestamp':
          selectItemsSql = dedent`SELECT id, * FROM gallery \
          WHERE createtime >= ${condition.startTime} AND createtime <= ${condition.endTime} \
          ORDER BY createtime DESC \
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

  deleteItemsFromGalleryTable(condition: any, returnPromise?: boolean) {
    let deleteItemSql: string = '';

    if (typeof condition === 'object' && Object.keys(condition).length === 2 && condition.type) {
      switch (condition.type) {
        case 'all':
          deleteItemSql = `DELETE FROM gallery`;
          this.message = 'All the images have been successfully deleted.';
          break;
        case 'sync':
          deleteItemSql = `DELETE FROM gallery WHERE status = 1`;
          this.message = 'All the sync images have been successfully deleted.';
          break;
        case 'unsync':
          deleteItemSql = `DELETE FROM gallery WHERE status = 0`;
          this.message = 'All the unsync images have been successfully deleted.';
          break;
        case 'id':
          deleteItemSql = `DELETE FROM gallery WHERE id="${condition.id}"`;
          this.message = `Image ${condition.id} has been successfully deleted`;
          break; 
        case 'ids':
          deleteItemSql = `DELETE FROM gallery WHERE id IN (${condition.ids})`;
          this.message = 'All the selected images have been successfully deleted.';
          break;
      }
    }

    if (returnPromise === undefined || returnPromise === null) {
      return Observable.create((observer) => {
        if (deleteItemSql) {
          db.executeSql(deleteItemSql, []).then(() => {
            observer.next(this.message);
            observer.complete();
          }, error => {
            observer.error(error);
          });
        } else {
          observer.error('Images DELETE SQL is empty. Cannot execute SQL.');
        }
      });
    } else if (returnPromise === true) {
      return db.executeSql(deleteItemSql, []);
    }
  }
}
