var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
const gulpFilter = require('gulp-filter');
var headerfooter = require('gulp-headerfooter');
var minimist = require('minimist');

var knownOptions = {
    string: ['ex', 'app'],
    boolean: true,
    default: {ex: 'sheet', app: null}
};

var options = minimist(process.argv.slice(2), knownOptions);

const srcHeader = 'src/header';
const srcExternal = 'vendor-src';
const srcLib = 'src/lib';
const exampleAppSrcBase = 'example-apps';


function mapIt(externalFilter, libFilter, appFilter, srcApp) {
    return [srcHeader + '/**/*.js'].concat(
        externalFilter.map((val)=> {
            return (srcExternal + '/**/##.js').replace('##', val);
        }),
        libFilter.map((val)=> {
            return (srcLib + '/**/##.js').replace('##', val);
        }),
        appFilter.map((val)=> {
            return (srcApp + '/**/##.js').replace('##', val);
        })
    );
}


// const exampleAppBuilds = {
//     ALL: mapIt(['*'], ['*'], ['*']),
//     sheet: mapIt([], ['1.*', '2.*', '10.*'], ['*']),
//     oauth: mapIt(['*'], ['1.*', '2.*'], ['*'])
// };

var appPath = null;
if (options.app) {
    appPath = options.app;
}else {
    appPath = exampleAppSrcBase + options.ex;
}

var mods = require(appPath + '/config').modules;
var src = mapIt(mods.external, mods.library, mods.app, appPath + '/app');


gulp.task('build', () => {

    console.log(src);

    var filtWrapper = gulpFilter(['*src/lib/**/*', '!*src/lib/**/*.0.*'], {restore: true});

    return gulp.src(src)
        .pipe(cached('build'))        // only pass through changed files
        //.pipe(jshint())                 // do special things to the changed files...
        .pipe(filtWrapper)  //skip making a wrapper for Defs - they should be global

        .pipe(headerfooter(
            '//**************************************************************************************************************************\n' +
            '(function () {\n' +
            '//**************************************************************************************************************************\n\n',
            '\n})();\n\n')
        )

        .pipe(filtWrapper.restore)

        .pipe(remember('build'))      // add back all files to the stream
        .pipe(concat('2-app.js'))         // do things that require all files
        .pipe(gulp.dest(appPath + '/build'));
});

gulp.task('watch', () => {
    var watcher = gulp.watch(allFiles, ['scripts']); // watch the same files in our scripts task
    watcher.on('change', function (event) {
        if (event.type === 'deleted') {                   // if a file is deleted, forget about it
            delete cached.caches.scripts[event.path];       // gulp-cached remove api
            remember.forget('scripts', event.path);         // gulp-remember remove api
        }
    });
});
