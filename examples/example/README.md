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
