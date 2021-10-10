This is a full-blown app that uses every feature of FireCMS in one way or
another.

## Testing the example

For development purposes the dependencies of this project are linked directly to
the parent library. This example folder is not meant to be copied as it is
(since how dependencies are linked). In any case, if you would like to use this
example outside the development flow, you can just replace the dependencies
in `package.json` from `link:../...` to regular npm packages, and it will work
just fine.

If you just want to run the example, you can replace the linked dependencies in
the `package.json` file for:

```
// ...
"dependencies": {
    "@camberi/firecms": "latest",
    "@emotion/react": "^11.4.1",
    "@emotion/styled": "^11.3.0",
    "@mui/icons-material": "5",
    "@mui/lab": "^5.0.0-alpha.49",
    "@mui/material": "5",
    "@mui/styles": "5",
    "firebase": "9",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-scripts": "^4.0.3"
},
```

## Developing the CMS

This example is used for development purposes. Dependencies in `package.json`
are linked to the parent folder. In order to make it work for development
purposes, you need to run first:

```
yarn
yarn build
```

in the parent directory.

Then you need to set your Firebase configuration in the
file `example/src/firebase_config.ts`.

Then you can:

```
cd example
yarn
yarn build
```

You can also run `yarn start` instead of `yarn build`on both folders, in
parallel, if you want the library to build automatically on changes, useful
while developing.

### Algolia search

The example backend included in this package indexes various collections to
Algolia, using Cloud functions. If you deploy it, your data will be indexed.
Then you can add your appId and searchKey to the .env file in the root of this
example project.

Note that you only need to have a Cloud Functions backend such as this one if
you want to enable text search or are extending functionality in any other way.

