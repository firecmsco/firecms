# Example backend
This is a very simple backend that is based in Google Cloud Functions and it is
only in charge of indexing changes to the collections `users`, `products` and
`blog` to Algolia.

You need to have billing enabled in your Firebase project to deploy Cloud
Functions.

## Config

To set this up you just need to create an Algolia account, find your API keys
and set the config with:
```
firebase functions:config:set algolia.app_id="YOUR APPLICATION ID" algolia.api_key="YOUR_ADMIN_KEY --project YOUR_FIREBASE_PROJECT
```

Then you can deploy with
```
yarn deploy --project YOUR_FIREBASE_PROJECT
```
