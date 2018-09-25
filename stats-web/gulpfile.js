let gulp = require('gulp'),
    sass = require('gulp-sass');

gulp.task('sass', function () {
    return gulp.src('./src/styles/sass/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./src/styles/css'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./src/*.sass', ['sass']);
});