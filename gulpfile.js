import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import del from 'del';
import cleancss from 'gulp-clean-css';
import less from 'gulp-less';
import rename from 'gulp-rename';
import webpack from 'webpack-stream';

import webpackConfig from './webpack.config.js';

gulp.task('clean', () => del(['build']));

gulp.task('webpack', () => gulp.src('lib/frontend/main.js', { read: false })
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('build/scripts/')));

gulp.task('css', () => gulp.src('css/style.less')
    .pipe(less())
    .pipe(autoprefixer('>5%'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cleancss())
    .pipe(gulp.dest('build/css/')));

gulp.task('images', () => gulp.src('images/*')
    .pipe(gulp.dest('build/images/')));

gulp.task('default', gulp.series(['clean', 'webpack', 'css', 'images']))
