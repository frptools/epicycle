const browserify = require('browserify');
const babelify = require("babelify");
const watchify = require('watchify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babel = require("gulp-babel");
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const child_process = require('child_process');

// 1. i want to build normally for the server
// 2. i want to package things up for the client
// 3. i want to copy assets to the www folder

gulp.task('server', () => {
  gulp.src('./src/app/**/*.js')
    .pipe(plumber())
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/server'));
});

const watcher = watchify(browserify(Object.assign({}, watchify.args, {
  entries: ['./src/app/client.js'],
  paths: ['./node_modules', './components'],
  debug: true,
  transform: [babelify]
})));
watcher.on('update', bundle);
watcher.on('log', gutil.log);

function bundle() {
  return watcher.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(plumber())
    .pipe(source('client.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify({mangle:true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/www/js'));
}

gulp.task('client', bundle);

gulp.task('assets', () => {
  gulp.src('./src/assets/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('./dist/www'));
});

gulp.task('watch', function() {
  gulp.watch(['./src/app/**/*.js'], ['server']);
  gulp.watch(['./src/assets/**'], ['assets']);
});

gulp.task('bgprocs', () => {
  function spawn(cmd, task) {
    child_process.spawn(cmd, ['run', task], { stdio: 'inherit' })
      .on('error', err => {
        if(cmd.indexOf('.cmd') === -1) {
          spawn(cmd + '.cmd', task);
        }
      })
      .on('exit', () => spawn(cmd, task));
  }
  function start(task) {
    spawn('npm', task);
  }
  start('local');
  start('bsync');
});

gulp.task('build', ['client', 'server', 'assets', 'watch']);
gulp.task('default', ['bgprocs', 'build']);
