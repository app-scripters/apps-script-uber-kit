# apps-script-uber-kit
Complex modular library and build tool kit for Google (R) Apps Script (TM)
all kind of scripts

##Features
- Framework for Web published scripts
- automatic concatenation in proper order into a single file
- recognizes app project structure with configuration folder, see below
- Builds modular library and external dependencies (vendor-src) for particular app according to 'config.js'
- places build into corresponding app folder /build subfolder

## Important notes

- Library and App modules are prefixed with x.x. - this figures are used for optional inclusion of modules
- x.0. prefixes means gulp should NOT wrap thi module with (function(){})();

###App structure

```
/app-root-folder
--- /config.js
---  /app
--- --- /1.0.some.file.js
--- --- /1.1.another.file.js
--- /build       --- this will be generated by the script, add it to .gitignore
--- --- /app.js  --- the concatenated script
```

###config.js structure

```javascript
module.exports = {
    modules: {
        external: ['*'],
        library: ['1.*', '2.*'],
        app: ['*']
    }
};
```

##Usage

### To build an example app (from this repository)

gulp build --ex=appname


### To build your app (from this repository)

gulp build --app=/path/to/app-root-folder
