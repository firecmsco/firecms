---
id: "FirebaseAuthController"
title: "Type alias: FirebaseAuthController"
sidebar_label: "FirebaseAuthController"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FirebaseAuthController**: [`AuthController`](AuthController.md)<`FirebaseUser`\> & { `anonymousLogin`: () => `void` ; `appleLogin`: () => `void` ; `authLoading`: `boolean` ; `confirmationResult?`: `ConfirmationResult` ; `createUserWithEmailAndPassword`: (`email`: `string`, `password`: `string`) => `void` ; `emailPasswordLogin`: (`email`: `string`, `password`: `string`) => `void` ; `facebookLogin`: () => `void` ; `fetchSignInMethodsForEmail`: (`email`: `string`) => `Promise`<`string`[]\> ; `githubLogin`: () => `void` ; `googleLogin`: () => `void` ; `microsoftLogin`: () => `void` ; `phoneLogin`: (`phone`: `string`, `applicationVerifier`: `ApplicationVerifier`) => `void` ; `skipLogin?`: () => `void` ; `twitterLogin`: () => `void`  }

#### Defined in

[lib/src/firebase_app/types/auth.tsx:32](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/types/auth.tsx#L32)
