> This is a full-blown app that uses every feature of FireCMS in one way or
another.

## Testing the example

This example is used for development purposes.

IMPORTANT: If you want to get started using FireCMS it is advisable to check the
[quickstart](https://firecms.co/docs/quickstart)

You need to specify a valid **Firebase config** in the file `firebase_config.ts`
which is not in VCS, but there is a template `firebase_config.ts.template`

To run the app, in the main folder run: 

```
yarn
```

and in either in the root or the `example` folder, simply run:

```
yarn dev
```


### vite and react-scripts

This project implements both vite, and react-scripts for testing purposes. Users
of the library will only need one of them, most likely `react-scripts`. Vite is
used for development and is a huge time saver.

### Algolia search

The `example_backend` included package is a simple backend that indexes various
collections to Algolia, using Cloud functions. If you deploy it in your
environment, your Firestore collections will be indexed to Algolia. Then you can
add your `appId` and `searchKey` to the `.env` file in the root of this example
project.

There are different `.env` keys depending on if you are using `vite` or
`react-scripts`

Note that you only need to have a Cloud Functions backend such as this one if
you want to enable text search or are extending functionality in any other way.

