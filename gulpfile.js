var fs = require('fs'),
    gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    htmlreplace = require('gulp-html-replace'),
    image = require('gulp-image'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    shell = require('gulp-shell'),
    webpack = require('webpack-stream');

gulp.task('clean', function(cb) {
    del(['build'], cb);
});

gulp.task('html', function() {
    return gulp.src('views/**')
        .pipe(htmlreplace({
            css: {
                src: ['/css/style.min.css'],
                tpl: '<link rel="stylesheet" href="%s">',
            },
            js: [
                '/scripts/build.min.js'
            ]
        }))
        .pipe(gulp.dest('build/views/'));
});

gulp.task('webpack', function() {
    return gulp.src('lib/frontend/main.js', { read: false })
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('build/scripts/'));
});

gulp.task('css', function() {
    return gulp.src('css/style.less')
        .pipe(less())
        .pipe(autoprefixer('>5%'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('build/css/'));
});

gulp.task('preview-css', function() {
    /*
     * This covers the "preview" CSS for EpicEditor, which is currently just
     * the bootstrap base with some slight customizations. It would be nice to
     * get rid of this entirely and just replace it with a link to the
     * bootstrap base on a CDN.
     */
    return gulp.src('css/preview.css')
        .pipe(minifycss())
        .pipe(gulp.dest('build/css/'));
});

gulp.task('images', function() {
    return gulp.src('images/*')
        //.pipe(image())
        .pipe(gulp.dest('build/images/'));
});

gulp.task('default', ['clean'], function() {
    gulp.start('html', 'webpack', 'css', 'preview-css', 'images');
});
