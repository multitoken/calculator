# calculator
Start project in project dir:
```sh
$ npm install
$ npm start
```

### Deploy a new version
* Use `Makefile` or `package.json`:
```sh
$ make site
or
$ npm run site:new
```
After that, commit all changes and push updated `gh-pages` branch to origin to deploy the generated site.

