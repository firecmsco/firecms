# Firebase App Check (Self-Hosted)
Self-hosted FireCMS can enforce Firebase App Check on every request your admin panel makes to Firestore and Storage, so only your own CMS can read or write your data — not a copied API key, and not a script lifted out of your bundle.

App Check itself is a Firebase service. This page covers wiring it into FireCMS; for what App Check does and which attestation providers exist, see [Firebase's own App Check documentation](https://firebase.google.com/docs/app-check).

:::important
Remember to add the domain where you will be deploying your app to the list of allowed domains in AppCheck provider
configuration.
:::

For self-hosted versions, you can enable Firebase App Check in your app by providing the `options`
and `firebaseApp` props in the `useAppCheck` hook.

The `useAppCheck` hook is used to initialize Firebase App Check and monitor its status.
It handles the asynchronous initialization process, provides loading state, and captures any errors that
may occur during initialization.

### Parameters

- `firebaseApp` (optional): An instance of `FirebaseApp` to use for App Check initialization.
- `options` (optional): Configuration options for App Check.
    - `provider`: The provider you want to use.
    - `isTokenAutoRefreshEnabled`: Whether to automatically refresh the token.
    - `debugToken`: A debug token to use.
    - `forceRefresh`: Whether to force a token refresh.

### Return Value

Returns an object that includes:
- `loading`: A boolean indicating whether the initialization is in progress.
- `appCheckVerified` (optional): A boolean indicating whether the app has been verified by App Check.
- `error` (optional): Any error encountered during the initialization process.

### Example

```tsx

const {
    loading,
    error,
    appCheckVerified
} = useAppCheck({
    options: {
        provider: new ReCaptchaEnterpriseProvider(process.env.VITE_RECAPTCHA_SITE_KEY as string),
        isTokenAutoRefreshEnabled: true,
    }
});
```

## Providers

The `provider` property is required and should be an instance of a Firebase AppCheck provider.
You can use one of the following providers:

### ReCaptchaEnterpriseProvider

In order to set up the ReCaptchaEnterpriseProvider, you need to create a new reCAPTCHA Enterprise site key.
Follow the instructions in the [Firebase documentation](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider).

:::important
Make sure you have added the domain `app.firecms.co` to the list of allowed domains in the reCAPTCHA Enterprise console.
:::

```tsx

const {
    loading,
    error,
    appCheckVerified
} = useAppCheck({
    options: {
        provider: new ReCaptchaEnterpriseProvider("your-site-key"),
        isTokenAutoRefreshEnabled: true,
    }
});
```

### ReCaptchaV3Provider

In order to set up the ReCaptchaV3Provider, you need to create a new reCAPTCHA v3 site key.
Follow the instructions in the [Firebase documentation](https://firebase.google.com/docs/app-check/web/recaptcha-provider).

```tsx

const {
    loading,
    error,
    appCheckVerified
} = useAppCheck({
    options: {
        provider: new ReCaptchaV3Provider("your-site-key")
        isTokenAutoRefreshEnabled: true,
    }
});
```

### Custom provider

You can also create a custom provider by implementing the `AppCheckProvider` interface.

