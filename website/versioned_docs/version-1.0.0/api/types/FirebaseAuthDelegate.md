---
id: "FirebaseAuthDelegate"
title: "Type alias: FirebaseAuthDelegate"
sidebar_label: "FirebaseAuthDelegate"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FirebaseAuthDelegate**: [`AuthDelegate`](AuthDelegate)<`FirebaseUser`\> & { `authLoading`: `boolean` ; `loginSkipped?`: `boolean` ; `anonymousLogin`: () => `void` ; `appleLogin`: () => `void` ; `createUserWithEmailAndPassword`: (`email`: `string`, `password`: `string`) => `void` ; `emailPasswordLogin`: (`email`: `string`, `password`: `string`) => `void` ; `facebookLogin`: () => `void` ; `fetchSignInMethodsForEmail`: (`email`: `string`) => `Promise`<`string`[]\> ; `githubLogin`: () => `void` ; `googleLogin`: () => `void` ; `microsoftLogin`: () => `void` ; `skipLogin?`: () => `void` ; `twitterLogin`: () => `void`  }

#### Defined in

[firebase_app/models/auth.tsx:34](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/models/auth.tsx#L34)
