# angular2-ionic2-demo

An experimental project for testing Ionic2 role-based authentication, SQLite pre-loading and native functionalities of mobile platforms(Android && iOS) in using [TypeScript](https://www.typescriptlang.org/), [Angular2](https://angular.io/), [RxJS](http://reactivex.io/), [Ionic2](http://ionicframework.com/), [Cordova](https://cordova.apache.org/), [SQLite](https://www.sqlite.org/), [Auth0](https://auth0.com/), [Firebase](https://firebase.google.com/).  

## About

This repo could be used to explore:

1. How to enrich Auth0 JWT Payload with roles/groups/permissions info by using [Auth0 Authorization Extension](https://auth0.com/docs/extensions/authorization-extension).
2. How to implement a customisable login page with [Auth0 endpoints](https://auth0.com/docs/api/authentication#introduction) instead of using [Auth0 JS SDK](https://auth0.com/docs/libraries/auth0js) and [Auth0 UI Components](https://auth0.com/docs/libraries/lock) => [[code](https://github.com/crabcanon/angular2-ionic2-demo/tree/master/src/pages/login)].
3. How to use RxJS to handle `nested async calls` and `session expiration` issues(renew JWT or force to re-login) => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/providers/auth-service.ts)].
4. How to customise Ionic2 tabs based on different user roles => [[code](https://github.com/crabcanon/angular2-ionic2-demo/tree/master/src/pages/tabs)].
5. How to share data between controllers and services by
    * Route parameters => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/pages/tabs/tabs.ts#L46)]
    * Angular2 setter/getter service for sync data flow => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/providers/auth-service.ts#L95)]
    * Ionic2 publish/subscribe pattern for async data flow => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/providers/auth-service.ts#L111)]
    * Mobile native storage => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/providers/auth-service.ts#L103)]
    * SQLite DB => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/providers/sqlite-service.ts)]
6. How to use [cordova plugins](https://cordova.apache.org/plugins/?platforms=cordova-android%2Ccordova-ios%2Ccordova-windows)(both ionic-native and other extra cordova plugins) to access mobile native functionalities, such as network, device, battery, camera, file system, etc. => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/providers/native-service.ts)]. 
7. How to prepare and preload SQLite database once users install the app in order to support `OFFLINE Mode` => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/app/app.component.ts#L44)].
8. How to implement [InfiniteScroll](https://ionicframework.com/docs/v2/api/components/infinite-scroll/InfiniteScroll/) => [[code](https://github.com/crabcanon/angular2-ionic2-demo/tree/master/src/pages/repos)] with `async SQL queries` => [[code](https://github.com/crabcanon/angular2-ionic2-demo/blob/master/src/providers/sqlite-service.ts#L24)].
9. How to integrate [Firebase](https://firebase.google.com/docs/web/setup)(customisable token authentication and real-time storage) to support `ONLINE Mode`.

## Get started

#### Setup 

```sh
$ npm install -g cordova ionic
$ git clone https://github.com/crabcanon/angular2-ionic2-demo.git
$ cd angular2-ionic2-demo
$ npm install
$ ionic build
$ cp src/data.db www
$ ionic platform add ios
$ ionic platform add android

// If any error regarding cordova-plugin-dbcopy, please run:
$ cordova plugin add https://github.com/an-rahulpandey/cordova-plugin-dbcopy.git --save

$ ionic build ios
$ ionic build android

$ ionic emulate ios/android(your choice)

// Do not test this project with browsers.
// Open project from Android Studio or Xcode instead of running `ionic emulate`.
// Import project from the platforms/ios or platforms/android directory.
```

#### Testing credentials(role: username/password)

* Super Admin: `super_admin@test.com/super_admin`
* Reseller Admin: `reseller_admin@test.com/reseller_admin`
* Customer Admin: `customer_admin@test.com/customer_admin`
* User Admin: `user_admin@test.com/user_admin`

PS: With different roles, you will see different contents and initial routes.

## TODO List

- [x] Enrich Auth0 JWT Payload with roles info
- [x] Customisable login page with Auth0 RESTful endpoints
- [x] Role-based authentication
- [x] Customisable session-expiration handlers(two use cases: JWT metadata or customisable expiration time period)
- [x] Share data between pages by different methods
- [x] Preloading SQLite database
- [x] InfiniteScroll for list
- [ ] Take photoes and store to the iOS/Android camera gallery
- [ ] Take photoes and store base64 data to Firebase
- [ ] Upload files from devices to Firebase 


## License

[MIT License](http://choosealicense.com/licenses/mit/)

---

> [yehuang.me](https://yehuang.me) &nbsp;&middot;&nbsp;
> GitHub [@crabcanon](https://github.com/crabcanon) &nbsp;&middot;&nbsp;
> Gmail [@sysuhuangye](<mailto:sysuhuangye@gmail.com>)  