const gulp = require("gulp");
const ts = require("gulp-typescript");
const del = require("del");
const babel = require("gulp-babel");

gulp.task("es5", function () {
  return gulp
    .src(["src/simplex-router.ts", "src/*rules/asp-net-core.ts"])
    .pipe(
      babel({
        presets: ["@babel/preset-env", "@babel/preset-typescript"],
      })
    )
    .pipe(gulp.dest("./dist/es5/"));
});

gulp.task("es6", function () {
  const tsProject = ts.createProject("tsconfig.json");
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("./dist/es6/"));
});

gulp.task("clean", function () {
  return del("./dist/**", { force: true });
});

gulp.task("default", gulp.series("clean", gulp.parallel("es5", "es6")));
