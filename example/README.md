This is a full-blown app that uses every feature of FireCMS in one way or
another.

## Testing the example

This example is used for development purposes.

You need to specify a valid Firebase config in the file `firebase_config.ts`
which is not in VCS, but there is a template `firebase_config.ts.template`

In order to make it work for development
purposes, you need to run first:

```
yarn
yarn dev
```


### Algolia search

The `example_backend` package indexes various collections toAlgolia, using Cloud
functions. If you deploy it in your environment, your Firestore collections will
be indexed to Algolia. Then you can add your `appId` and `searchKey` to
the `.env` file in the root of this example project.

Note that you only need to have a Cloud Functions backend such as this one if
you want to enable text search or are extending functionality in any other way.

