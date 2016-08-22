# apps-script-uber-kit
Complex modular development kit and build tool for Google (R) Apps Script (TM)
projects


##Modules
- True Web App Framework for Web Published scripts:
  - rendering engine
  - HTML and API server modes (e.g. for separate widgets)
  - url router
  - HTML pages from temlplates with context
- Powerfull configurator tool to read various types of parameters from sheets
- OAuth1 module with QuickBooks support in particular
- Sheets-as-Database tools
- Date-time tools with javascript fixes fro Apps Script environment, Timezone-aware
- Side Bar goodies for google docs
- Dynamic templates
- Namespaces and other utilities

##Features
- Automatic concatenation in proper order into a single file
- recognizes app project structure with configuration folder, see below
- Builds modular library and external dependencies (vendor-src) for particular app according to 'config.js'
- places build into corresponding app folder /build subfolder
- Build is supported on Unix environment only at the moment

## Important notes

- Library and App modules are prefixed with x.x. 
    - this numbers are used for ordering of files in bundles
    - and also for optional inclusion of modules in app's config.js

- *._.* in the file name means gulp should NOT wrap this module with (function(){})();

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

Set $APPS-SCRIPT-UBER-KIT variable in your ~/.bashrc
to this repository root

### To build an example app (from this repository)

```sh
    cd example-apps
    build.sh appname
```

### To build your app (from this repository)

- Make a copy of example-apps folder (e.g. "my-apps") with at least one app inside (e.g. "yourapp") and build.sh script
- Modify code in my-apps/yourapp/app section
- adjust my-apps/yourapp/config.js to the modules you want

```sh
    cd my-apps
    build.sh yourapp
```

