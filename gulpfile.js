var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
const gulpFilter = require('gulp-filter');
var headerfooter = require('gulp-headerfooter');
var minimist = require('minimist');
//const chmod = require('gulp-chmod');
var merge = require('merge-stream');
var stripComments = require('gulp-strip-comments');

const defaultExampleApp = 'sheet';

var knownOptions = {
    string: ['app'],
    boolean: true,
    default: {app: null}
};

var options = minimist(process.argv.slice(2), knownOptions);

const srcExternal = 'vendor-src';
const srcLib = 'lib-src';
const srcLibPostfix = 'lib-postfix-src';
const exampleAppSrcBase = './example-apps/src';


function constructSources(aFilter, srcArr) {
    var acc = [];
    for (var i in srcArr) {
        acc = acc.concat(aFilter.map((val)=> {
            return (srcArr[i] + '/**/##.js').replace('##', val);
        }));
    }
    return acc;
}

var appPath = null;
if (options.app) {
    appPath = options.app;
}else {
    appPath = exampleAppSrcBase + '/' + defaultExampleApp;
}

var mods = require(appPath + '/config').modules;

var vendorFiles = constructSources(mods.external, [srcExternal]);
var libFiles = constructSources(mods.library, [srcLib]);
var appServerGsFiles = constructSources(mods.app, [appPath + '/server/gs', srcLibPostfix]);
var appServerTemplateFiles = constructSources(mods.app, [appPath + '/server/template']);

function _build(src, what){
    var filtWrapper = gulpFilter(['**', '!**/*._.*.js'], {restore: true});

    return gulp.src(src)
        .pipe(cached('build-' + what))        // only pass through changed files
        //.pipe(jshint())                 // do special things to the changed files...
        .pipe(filtWrapper)  //skip making a wrapper for Defs - they should be global

        .pipe(headerfooter(
            '\n\n\n\n\n\n\n//****************************************************************************************************\n' +
            '(function () {\n' +
            '//******************************************************************************************************\n\n',
            '\n})();//<<<<<<<<<<<<<<<<<<<<<<<<<<<<END<<<<<<<<<<<<<<<<<<<<<<<<<\n\n\n\n\n')
        )

        .pipe(filtWrapper.restore)

        .pipe(stripComments())
        
        .pipe(remember('build-' + what));      // add back all files to the stream
        //.pipe(concat('bundle.js'))         // do things that require all files
        //.pipe(gulp.dest(appPath + '/build'))
    
}

gulp.task('build', () => {

    console.log('Vendor Files:--------------\n', vendorFiles);
    console.log('Library Files:--------------\n', libFiles);
    console.log('App Server .gs Files + Postfix:--------------\n', appServerGsFiles);

    var vendor = _build(vendorFiles, 'vendor')
        .pipe(concat('1-vendor.js'))         // do things that require all files
        .pipe(gulp.dest(appPath + '/build'));
    var lib = _build(libFiles, 'lib')
        .pipe(concat('2-library.js'))         // do things that require all files
        .pipe(gulp.dest(appPath + '/build'));
    var app = _build(appServerGsFiles, 'app')
        .pipe(concat('3-app.js'))         // do things that require all files
        .pipe(gulp.dest(appPath + '/build'));
    
    return merge(vendor, lib, app);
});

gulp.task('watch', () => {
    var watcher = gulp.watch(allFiles, ['scripts']); // watch the same files in our scripts task
    watcher.on('change', function (event) {
        if (event.type === 'deleted') {                   // if a file is deleted, forget about it
            delete cached.caches['build-vendor'][event.path];       // gulp-cached remove api
            remember.forget('build-vendor', event.path);         // gulp-remember remove api
            delete cached.caches['build-app'][event.path];       // gulp-cached remove api
            remember.forget('build-app', event.path);         // gulp-remember remove api
            delete cached.caches['build-lib'][event.path];       // gulp-cached remove api
            remember.forget('build-lib', event.path);         // gulp-remember remove api
        }
    });
});
