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

const defaultExampleApp = 'sheet';

var knownOptions = {
    string: ['app'],
    boolean: true,
    default: {app: null}
};

var options = minimist(process.argv.slice(2), knownOptions);

const srcHeader = 'src/header';
const srcExternal = 'vendor-src';
const srcLib = 'src/lib';
const exampleAppSrcBase = './example-apps/src';


function mapLib(externalFilter, libFilter) {
    return [srcHeader + '/**/*.js'].concat(
        externalFilter.map((val)=> {
            return (srcExternal + '/**/##.js').replace('##', val);
        }),
        libFilter.map((val)=> {
            return (srcLib + '/**/##.js').replace('##', val);
        })
    );
}

function mapApp(appFilter, srcApp) {
    return appFilter.map((val)=> {
            return (srcApp + '/**/##.js').replace('##', val);
        });
}


var appPath = null;
if (options.app) {
    appPath = options.app;
}else {
    appPath = exampleAppSrcBase + '/' + defaultExampleApp;
}

var mods = require(appPath + '/config').modules;
var libFiles = mapLib(mods.external, mods.library);
var appFiles = mapApp(mods.app, appPath + '/app');

function _build(src, what){
    var filtWrapper = gulpFilter(['**', '!**/*.0.*.js'], {restore: true});

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

        .pipe(remember('build-' + what));      // add back all files to the stream
        //.pipe(concat('bundle.js'))         // do things that require all files
        //.pipe(gulp.dest(appPath + '/build'))
    
}

gulp.task('build', () => {

    console.log('libFiles:--------------\n', libFiles);
    console.log('appFiles:--------------\n', appFiles);

    var lib = _build(libFiles, 'lib')
        .pipe(concat('1-library.js'))         // do things that require all files
        .pipe(gulp.dest(appPath + '/build'));
    var app = _build(appFiles, 'app')
        .pipe(concat('2-app.js'))         // do things that require all files
        .pipe(gulp.dest(appPath + '/build'));
    
    return merge(lib, app);
});

gulp.task('watch', () => {
    var watcher = gulp.watch(allFiles, ['scripts']); // watch the same files in our scripts task
    watcher.on('change', function (event) {
        if (event.type === 'deleted') {                   // if a file is deleted, forget about it
            delete cached.caches['build-app'][event.path];       // gulp-cached remove api
            remember.forget('build-app', event.path);         // gulp-remember remove api
            delete cached.caches['build-lib'][event.path];       // gulp-cached remove api
            remember.forget('build-lib', event.path);         // gulp-remember remove api
        }
    });
});
