# Firebase App Check in FireCMS Cloud
FireCMS Cloud can enforce Firebase App Check on every request your admin panel makes to Firestore and Storage, so only your own CMS can read or write your data — not a copied API key, and not a script lifted out of your bundle.

App Check itself is a Firebase service. This page covers wiring it into FireCMS; for what App Check does and which attestation providers exist, see [Firebase's own App Check documentation](https://firebase.google.com/docs/app-check).

:::important
Remember to add the domain `app.firecms.co` to the list of allowed domains in AppCheck provider configuration.
:::

You can enable Firebase App Check in your app directly in the **project settings** in the FireCMS Cloud console,
or by providing the `appCheck` prop in your app configuration.

By implementing it in code, you can have more control over the configuration and the provider you want to use,
including custom providers.

You can define some options:
- `provider`: The provider you want to use.
- `isTokenAutoRefreshEnabled`: Whether to automatically refresh the token.
- `debugToken`: A debug token to use.
- `forceRefresh`: Whether to force a token refresh.

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

const appConfig: FireCMSAppConfig = {

    version: "1",

    appCheck: {
        provider: new ReCaptchaEnterpriseProvider("your-site-key")
    },
}

export default appConfig;
```

### ReCaptchaV3Provider

In order to set up the ReCaptchaV3Provider, you need to create a new reCAPTCHA v3 site key.
Follow the instructions in the [Firebase documentation](https://firebase.google.com/docs/app-check/web/recaptcha-provider).

```tsx

const appConfig: FireCMSAppConfig = {

    version: "1",

    appCheck: {
        provider: new ReCaptchaV3Provider("your-site-key")
    },
}

export default appConfig;
```

### Custom provider

You can also create a custom provider by implementing the `AppCheckProvider` interface.

## Check your configuration

FireCMS Cloud can share dependencies with your uploaded app. It is important than your app and FireCMS Cloud use the same version of Firebase App Check.
In order to do so, make sure, in your `vite.config.ts`, you are using the shared dependency provided by FireCMS.
You need to have the dependency `@firebase/app-check` in your `vite.config.ts`. Federation plugin `shared` configuration.

This is a sample configuration:

```tsx

// https://vitejs.dev/config/
export default defineConfig({
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }
    },
    plugins: [
        react(),
        federation({
            name: "remote_app",
            filename: "remoteEntry.js",
            exposes: {
                "./config": "./src/index"
            },
            shared: [
                "react",
                "react-dom",
                "@firecms/cloud",
                "@firecms/core",
                "@firecms/firebase",
                "@firecms/ui",
                "@firebase/firestore",
                "@firebase/app",
                "@firebase/functions",
                "@firebase/auth",
                "@firebase/storage",
                "@firebase/analytics",
                "@firebase/remote-config",
                "@firebase/app-check" // Add this line
            ]
        })
    ],
    build: {
        modulePreload: false,
        minify: false,
        target: "ESNEXT",
        cssCodeSplit: false,
    }
});
```

