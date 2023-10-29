Update all packages to a new version:
    
```bash
lerna version --exact <newversion>
``` 

or 

```bash
lerna version --no-private
```


To publish all packages to npm, first you need to login to npm:

```bash
npm login
```

Then you can publish all packages:

```bash
lerna publish --dist-tag pre --force-publish
```

To force

```bash
lerna publish --dist-tag pre --force-publish
```
