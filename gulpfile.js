'use strict';

var gulp = require('gulp')
  , uglify = require('gulp-uglify')
  , sourcemaps = require('gulp-sourcemaps')
  , ngAnnotate = require('gulp-ng-annotate')
  , gutil = require('gulp-util')
  , rev = require('gulp-rev')
  , revReplace = require('gulp-rev-replace')
  , browserify = require('browserify')
  , source = require('vinyl-source-stream')
  , buffer = require('vinyl-buffer');

gulp.task('javascript', function () {
    // set up the browserify instance on a task basis
    var b = browserify('main.js', {
        basedir: './public/system',
        paths: ['../vendor'],
        debug: true
    }).require('../vendor/tinymce/tinymce.min.js', {
        expose: 'tinymce'
    }).require('../vendor/moment/min/moment-with-locales.min.js', {
        expose: 'moment'
    });

    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        //.pipe(sourcemaps.init({loadMaps: true}))
            // Add transformation tasks to the pipeline here.
            .on('error', gutil.log)
            .pipe(uglify())
            .pipe(rev())
            //.pipe(ngAnnotate())
        //.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/'))
        .pipe(rev.manifest('manifest.json'))
        .pipe(gulp.dest('./'));
});

gulp.task('index', ['javascript'], function() {
    var manifest = gulp.src('./manifest.json');

    return gulp.src('./views/index.jade')
        .pipe(revReplace({
            manifest: manifest,
            replaceInExtensions: ['.jade']
        }))
        .pipe(gulp.dest('./views/'));
});

gulp.task('default', ['index']);