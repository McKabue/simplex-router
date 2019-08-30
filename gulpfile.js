const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const babel = require('gulp-babel');

gulp.task('es5', function () {
    const tsProject = ts.createProject('tsconfig.json', {
        "module": "es6"
    });
    return tsProject.src()
        .pipe(tsProject()).js
        .pipe(babel({
            presets: [
                "@babel/preset-env"
            ]
        }))
        .pipe(gulp.dest('./dist/es5/'));
});

gulp.task('es6', function () {
    const tsProject = ts.createProject('tsconfig.json', {
        "module": "es6"
    });
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('./dist/es6/'));
});

gulp.task('clean', function () {
    return del('./dist/**', { force: true });
});

gulp.task('default', gulp.series('clean', gulp.parallel('es5', 'es6')));