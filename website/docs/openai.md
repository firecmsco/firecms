---
id: openai
title: OpenAI plugin
sidebar_label: ✨ OpenAI plugin
---

The OpenAI plugin allows you to use the **OpenAI API** to generate content using
the latest **GPT models**. This plugin is able to understand the structure of
your
data and generate content that fits your schema.

<p align="center">
    <img src="/img/data_enhancement.png" width="800px" alt="Data enhancement UI" />
</p>

In order to be able to use this plugin you need to have a valid subscription.

You can add the plugin in a couple of simple steps.

## Get a subscription

In order to use this plugin, you need to create a subscription:

You need to specify the Firebase project id you would like to use the plugin
with,
in the website. And that's it!

You will not need to specify a subscription key when configuring the plugin.

<a href="https://app.firecms.co/subscriptions"
rel="noopener noreferrer"
target="_blank"
class="btn px-6 my-2 py-2 md:px-12 md:py-4 text-white bg-primary hover:
text-white hover:bg-blue-700 hover:text-white uppercase border-solid rounded
text-center">
Create a subscription
</a>

## Install the plugin

```bash
npm install @firecms/data_enhancement
```

or

```bash
yarn add @firecms/data_enhancement
```

The plugin is then initialised as a React hook, which is added to the `plugins`
array of the `FirebaseCMSApp` (or `FireCMS` if you are using a custom app)
component.

```tsx
import React from "react";
import { FirebaseCMSApp } from "firecms";
import "typeface-rubik";
import "@fontsource/ibm-plex-mono";

import { useDataEnhancementPlugin } from "@firecms/data_enhancement";

// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

export default function App() {

    const dataEnhancementPlugin = useDataEnhancementPlugin({
        // Optional callback for defining which collections should be enhanced
        getConfigForPath: async ({ path }) => {
            return true;
        }
    });

    return <FirebaseCMSApp
        name={"My Online Shop"}
        plugins={[dataEnhancementPlugin]}
        authentication={myAuthenticator}
        collections={[
            //...
        ]}
        firebaseConfig={firebaseConfig}
    />;
}
```
