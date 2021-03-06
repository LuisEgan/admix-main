"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const minify = require("gulp-minify");
const gulpSrc = "./src/scss/**/*.scss";

gulp.task("sass", function () {
      return gulp
            .src(gulpSrc)
            .pipe(sass({
                  outputStyle: "compressed"
            }).on("error", sass.logError))
            .pipe(
                  autoprefixer({
                        browsers: ["last 2 versions"],
                        cascade: false
                  })
            )
            .pipe(gulp.dest("./src"));
});

gulp.task("sass:watch", function () {
      gulp.watch(gulpSrc, gulp.series('sass'));
});

gulp.task("tjsminify", function () {
      return gulp
            .src("./ThreeJsR92/*.js")
            .pipe(
                  minify({
                        ext: {
                              min: ".min.js"
                        },
                        noSource: true
                  })
            )
            .pipe(gulp.dest("./public/THREEJS"));
});

gulp.task("tjsminify:watch", function () {
      gulp.watch("./ThreeJsR92/*.js", gulp.series('tjsminify'));
});