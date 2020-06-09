## Testing the example

This example has dependencies to the FireCMS package in the parent directory
for development purposes.

In a regular project you would link the dependencies regularly using the `npm`
repository.

To run this project locally you can set your Firebase configuration in the file
`firebase_config.ts` under `src`

You can run `yarn install` and then `yarn start` to test this package.

### Algolia search

The example backend included in this package indexes various collections to
Algolia, using Cloud functions. If you deploy it your data will be indexed.
Then you can add your appId and searchKey to the .env file in the root of this
example project.

Note that you only need to have a Cloud Functions backend such as this one if
you want to enable text search or are extending functionality in any other
way.

