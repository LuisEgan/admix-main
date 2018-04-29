"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var gulpSrc = "./src/scss/**/*.scss";

gulp.task("sass", function() {
   return gulp
      .src(gulpSrc)
      .pipe(sass().on("error", sass.logError))
      .pipe(gulp.dest("./src"));
});

gulp.task("sass:watch", function() {
   gulp.watch(gulpSrc, ["sass"]);
});
