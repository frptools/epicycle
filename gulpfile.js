'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const watchify = require('watchify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const runseq = require('run-sequence');
const rimraf = require('rimraf');
const server = require('gulp-develop-server');
const serverConfig = require('./src/server/node_modules/common/server-config');

let watcher, b = browserify(Object.assign({}, watchify.args, {
  entries: ['./src/client/index.js'],
  plugins: []
}));

function attachBrowserifyTransforms(br) {
  return br.transform(babelify, {
    global: true, // make sure to also transpile node_modules folders that we're using for shared components
    ignore: __dirname + '/node_modules' // don't transpile the root node_modules folder
  });
}

function startWatchify() {
  watcher = attachBrowserifyTransforms(watchify(b));
  watcher.on('update', changes => build.client());
  watcher.on('log', gutil.log.bind(gutil, 'Browserify:'));
}

function debounce(fn, delay) {
  let id = 0;
  return function() {
    if(id) clearTimeout(id);
    id = setTimeout(() => {
      id = 0;
      fn();
    }, delay);
  };
}

const build = (() => {
  let next = {};
  const add = (type, done) => (next[type] = done||true, start());
  const start = debounce(function build() {
    const prebuilds = [], targets = [], postbuilds = [], callbacks = [];
    const addcb = done => typeof fn === 'function' && callbacks.push(done);
    if(next.client || next.server) {
      prebuilds.push('prebuild:lint:dev');
    }
    if(next.server) {
      targets.push('build:server');
      postbuilds.push('reload:server');
      addcb(next.server);
    }
    if(next.client) {
      targets.push('build:client:dev');
      addcb(next.client);
    }
    if(next.assets) {
      postbuilds.push('postbuild:assets');
      addcb(next.assets);
    }
    postbuilds.push('reload:client');
    next = {};
    const tasks = [...prebuilds, targets, ...postbuilds].filter(t => t.length);
    runseq(...tasks, err => callbacks.forEach(fn => fn(err)));
  }, 250);
  return {
    client: done => add('client', done),
    assets: done => add('assets', done),
    server: done => add('server', done)
  };
})();

// ----------------------------------------------------------------------------

gulp.task('reload:server', (() => {
  let started = false;
  function start(done) {
    server.listen({
      path: './dist/app/server/index.js',
      args: ['--color'],
      env: Object.assign({}, process.env, { PORT: serverConfig.port })
    }, err => {
      if(!err) started = true;
      done(err);
    });
  }
  const restart = server.restart.bind(server);
  return done => (started ? restart : start)(done);
})());

gulp.task('reload:client', (() => {
  let started = false;
  function start(done) {
    browserSync.init({
      proxy: `http://localhost:${serverConfig.port}`,
      open: false
    }, err => {
      if(!err) started = true;
      done(err);
    });
  }
  const restart = done => (browserSync.reload(), done());
  return done => (started ? restart : start)(done);
})());

gulp.task('build:server', () => {
  return gulp.src(['./src/**/*.js', '!./src/client/index.js'])
    .pipe(plumber())
    // .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/app'));
});

function buildClient(b, useUglify, done) {
  let stream = b.bundle()
    .on('error', done)
    .pipe(plumber())
    .pipe(source('client.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}));
  if(useUglify)
    stream = stream.pipe(uglify());
  stream = stream
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/www/js'))
    .on('end', done);
}

gulp.task('build:client:dev', done => buildClient(watcher, false, done));
gulp.task('build:client:prod', done => buildClient(attachBrowserifyTransforms(b), true, done));

function runLinter(failAfterError) {
  let stream = gulp.src('./src/**/*.js')
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format());
  if(failAfterError)
    stream = stream.pipe(eslint.failAfterError()); // causes watchify to stop working for some reason
  return stream;
}
gulp.task('prebuild:lint:dev', () => runLinter(false));
gulp.task('prebuild:lint:prod', () => runLinter(true));
gulp.task('prebuild:clean', cb => rimraf('./dist', cb));

gulp.task('postbuild:assets', () => {
  return gulp.src('./assets/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('./dist/www'));
});

gulp.task('watch', () => {
  gulp.watch(['./src/client/**/*.js', '!./src/client/index.js', './src/server/**/*.js'], build.server);
  gulp.watch(['./assets/**'], build.assets);
});

gulp.task('build:dev', done => {
  startWatchify();
  build.server();
  build.client();
  build.assets(done);
});

gulp.task('build:dist', done => runseq('prebuild:clean', 'prebuild:lint:prod', ['build:server', 'build:client:prod'], 'postbuild:assets', done));

gulp.task('default', ['build:dev', 'watch']);
