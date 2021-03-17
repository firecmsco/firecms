## Testing the example

To run this project locally you can set your Firebase configuration in the file
`firebase_config.ts` under `src`

Then simply
```
yarn install
```
and
```
yarn start
```
to run locally.

### Linking to the CMS source code

For development purposes it is useful to link this project to the FireCMS library.
In order to do that you need to run in the library directory
```
yarn link
```
Then you can run:
```
yarn link "@camberi/firecms"
```
as described [here](https://classic.yarnpkg.com/en/docs/cli/link/)

With both projects linked, you will want to run `yarn start` in both of them
(library and example) so that whenever you do a change in the source code it is
updated in your local running example.

### Algolia search

The example backend included in this package indexes various collections to
Algolia, using Cloud functions. If you deploy it your data will be indexed.
Then you can add your appId and searchKey to the .env file in the root of this
example project.

Note that you only need to have a Cloud Functions backend such as this one if
you want to enable text search or are extending functionality in any other
way.

