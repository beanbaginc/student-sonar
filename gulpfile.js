var fs = require('fs'),
    gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    cleancss = require('gulp-clean-css'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    shell = require('gulp-shell'),
    webpack = require('webpack-stream');

gulp.task('clean', () => del(['build']));

gulp.task('webpack', () => gulp.src('lib/frontend/main.js', { read: false })
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('build/scripts/')));

gulp.task('css', () => gulp.src('css/style.less')
    .pipe(less())
    .pipe(autoprefixer('>5%'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cleancss())
    .pipe(gulp.dest('build/css/')));

gulp.task('images', () => gulp.src('images/*')
    .pipe(gulp.dest('build/images/')));

gulp.task('default', ['clean'], () => gulp.start('webpack', 'css', 'images'));
