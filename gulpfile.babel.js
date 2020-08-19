import * as fs from "fs";
import * as childProcess from "child_process";
import * as pkg from "pkg";
import gulp from "gulp";
import babel from "gulp-babel";
import typescript from "gulp-typescript";
import nodemon from "gulp-nodemon";

const packageJSON = JSON.parse(fs.readFileSync("package.json"));
const tsProject = typescript.createProject("tsconfig.json");

function clear(done) {
  const buildExists = fs.existsSync("./build");
  const distExists = fs.existsSync("./dist");
  if (buildExists) childProcess.execSync("rmdir /q /s build");
  if (distExists) childProcess.execSync("rmdir /q /s dist");
  return done();
}

function transpile() {
  return gulp
    .src(["src/**/*.ts"])
    .pipe(gulp.src("types/**/*.ts"))
    .pipe(tsProject())
    .pipe(gulp.src("src/**/*.js"))
    .pipe(babel())
    .pipe(gulp.dest(packageJSON.gulp.buildPath));
}

function bundle() {
  return pkg.exec([
    packageJSON.gulp.builtMain,
    ...(packageJSON.gulp?.buildPlatforms
      ? ["--targets", packageJSON.gulp?.buildPlatforms.join(",")]
      : []),
    "--out-path",
    packageJSON.gulp.distPath,
  ]);
}

function start() {
  return nodemon({
    script: packageJSON.main,
    ext: packageJSON.gulp.nodemonExt.join(" "),
    tasks: ["transpile"], // Is it not working? :thinking:
    exec: "ts-node --files"
  });
}

function demo() {
  return nodemon({
    script: "./tests/dummy.demo.ts",
    ext: packageJSON.gulp.nodemonExt.join(" "),
    tasks: ["transpile"], // Is it not working? :thinking:
    exec: "ts-node --files"
  });
}

exports.default = gulp.series(clear, transpile, bundle);
exports.build = gulp.series(clear, transpile);
exports.clear = clear;
exports.start = start;
exports.demo = demo;
