// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  fireBaseConfig : {
    apiKey: "AIzaSyBONcPYmqWXsoVZWlpj4AyAXASEsTs1NIs",
    authDomain: "my-digital-wallet-965f0.firebaseapp.com",
    projectId: "my-digital-wallet-965f0",
    storageBucket: "my-digital-wallet-965f0.firebasestorage.app",
    messagingSenderId: "317799917374",
    appId: "1:317799917374:web:6ab24c9be6c15c47402e6f"
  },
  notificationApiUrl: 'https://sendnotificationfirebase-production.up.railway.app'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
