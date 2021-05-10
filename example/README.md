## Testing the example and developing the CMS

- To run this project locally, run...
```
yarn
yarn build
```
...in the library folder. You can also run `yarn start` instead of `yarn build` if
want the library to build automatically on changes, useful while developing.

- Then you need to set your Firebase configuration in the file
`firebase_config.ts` under `src`.

- Then simply
```
cd example
yarn
```
and
```
yarn start
```
to run locally.

### Linking to the CMS source code

For development purposes the dependencies of this project are linked directly
to the parent library. This example folder is not meant to be copied as it is
(since how dependencies are linked). In any case, if you would like to use this
example outside the development flow, you can just replace the dependencies
in `package.json` from `link:../...` to regular npm packages, and it will work
just fine.


### Algolia search

The example backend included in this package indexes various collections to
Algolia, using Cloud functions. If you deploy it, your data will be indexed.
Then you can add your appId and searchKey to the .env file in the root of this
example project.

Note that you only need to have a Cloud Functions backend such as this one if
you want to enable text search or are extending functionality in any other
way.

