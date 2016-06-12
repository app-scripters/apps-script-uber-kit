var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
const gulpFilter = require('gulp-filter');
var headerfooter = require('gulp-headerfooter');
var minimist = require('minimist');

var knownOptions = {
  string: 'use',
  default: { use: 'ALL' }
};

var options = minimist(process.argv.slice(2), knownOptions);

const srcHeader = 'src/header';
const srcExternal = 'external-src';
const srcLib = 'src/lib';
const srcApp = 'src/app';


function mapIt(externalFilter, libFilter, appFilter){
    return [srcHeader + '/**/*.js'].concat(
        externalFilter.map((val)=>{
            return (srcExternal + '/**/##.js').replace('##', val);
        }),
        libFilter.map((val)=>{
            return (srcLib + '/**/##.js').replace('##', val);
        }), 
        appFilter.map((val)=>{
            return (srcApp + '/**/##.js').replace('##', val);
        })
    );
}


const customBuilds = {
    ALL:  mapIt(['*'], ['*'], ['*']),
    sheet: mapIt([], ['1.*', '2.*', '10.*'], ['*']),
    oauth: mapIt(['*'], ['1.*', '2.*'], ['*'])
};


gulp.task('build', () => {
    var src = customBuilds[options.use];
    
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
        .pipe(concat('library.js'))         // do things that require all files
        .pipe(gulp.dest('build'));
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
