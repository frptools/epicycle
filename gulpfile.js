const browserify = require('browserify');
const babelify = require('babelify');
const watchify = require('watchify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babel = require('gulp-babel');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const child_process = require('child_process');

// ----------------------------------------------------------------------------
// BUILD/TRANSPILE SERVER APPLICATION

gulp.task('server', () => {
  gulp.src(['!./src/client/index.js', './src/**/*.js'])
    .pipe(plumber())
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/app'));
});

// ----------------------------------------------------------------------------
// BUILD/TRANSPILE/WATCH CLIENT APPLICATION

const watcher = watchify(browserify(Object.assign({}, watchify.args, {
  entries: ['./src/client/index.js'],
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
    .pipe(uglify({mangle:false}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/www/js'));
}
gulp.task('client', bundle);

// ----------------------------------------------------------------------------
// COPY STATIC ASSETS TO DESTINATION

gulp.task('assets', () => {
  gulp.src('./assets/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('./dist/www'));
});

// ----------------------------------------------------------------------------
// RUN LOCAL BACKGROUND PROCESSES FOR DEVELOPMENT AND TESTING (See package.json)

gulp.task('bgprocs', () => {
  function start(task, cmd) {
    if(!cmd) cmd = 'npm';
    child_process.spawn(cmd, ['run', task], { stdio: 'inherit' })
      .on('error', () => cmd === 'npm' && start(task, 'npm.cmd'))
      .on('exit', () => start(cmd, task));
  }
  start('local');
  start('bsync');
});

// ----------------------------------------------------------------------------

gulp.task('watch', function() {
  gulp.watch(['./src/client/**/*.js', './src/server/**/*.js'], ['server']);
  gulp.watch(['./assets/**'], ['assets']);
});

gulp.task('build', ['client', 'server', 'assets', 'watch']);
gulp.task('default', ['bgprocs', 'build']);
