var fs = require('fs'),
    gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    htmlreplace = require('gulp-html-replace'),
    image = require('gulp-image'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    shell = require('gulp-shell');

gulp.task('clean', function(cb) {
    del(['build', 'lib/frontend/build.js', 'lib/frontend.build.js.map'], cb);
});

gulp.task('html', function() {
    return gulp.src('views/**')
        .pipe(htmlreplace({
            css: {
                src: ['/css/style.min.css'],
                tpl: '<link rel="stylesheet" href="%s">',
            },
            js: [
                '/scripts/traceur-runtime.min.js',
                '/scripts/build.min.js'
            ]
        }))
        .pipe(gulp.dest('build/views/'));
});

gulp.task('jspm-bundle', function() {
    return gulp.src('lib/frontend/main.js', { read: false })
        .pipe(shell('jspm bundle-sfx main --minify'));
});

gulp.task('javascript', function() {
    var scripts = {
            'jspm_packages/traceur-runtime.js': 'traceur-runtime',
            'lib/frontend/build.js': 'build'
        },
        src = [],
        key;

    for (key in scripts) {
        if (scripts.hasOwnProperty(key)) {
            src.push(key);
        }
    }

    return gulp.src(src, { base: './' })
        .pipe(rename(function(path) {
            var srcFilename = path.dirname + '/' + path.basename + path.extname,
                destFilename = scripts[srcFilename];

            path.dirname = '';
            path.basename = destFilename + '.min';
        }))
        .pipe(gulp.dest('build/scripts/'));
});

gulp.task('sourcemaps', function() {
    return gulp.src(['jspm_packages/traceur-runtime.js.map', 'lib/frontend/build.js.map'])
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

gulp.task('images', function() {
    return gulp.src('images/*')
        .pipe(image())
        .pipe(gulp.dest('build/images/'));
});

gulp.task('default', ['clean', 'jspm-bundle'], function() {
    gulp.start('html', 'javascript', 'sourcemaps', 'css', 'images');
});
