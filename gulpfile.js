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
const autoprefixer = require('autoprefixer');
const concat = require('gulp-concat');
const cssmin = require('gulp-cssmin');
const postcss = require('gulp-postcss');
const stylus = require('gulp-stylus');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const mocha = require('gulp-mocha');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const runseq = require('run-sequence');
const rimraf = require('rimraf');
const child_process = require('child_process');
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
    let fullReload = false;
    if(next.client || next.server) {
      prebuilds.push('prebuild:lint:dev');
      fullReload = true;
    }
    if(next.server) {
      targets.push('build:server');
      postbuilds.push('reload:server');
      fullReload = true;
      addcb(next.server);
    }
    if(next.client) {
      targets.push('build:client:dev');
      fullReload = true;
      addcb(next.client);
    }
    if(next.assets) {
      postbuilds.push('postbuild:assets');
      fullReload = true;
      addcb(next.assets);
    }
    if(next.styles) {
      postbuilds.push('build:styles:dev');
    }
    postbuilds.push(fullReload ? 'reload:client' : 'reload:client:css');
    next = {};
    const tasks = [...prebuilds, targets, ...postbuilds].filter(t => t.length);
    runseq(...tasks, err => callbacks.forEach(fn => fn(err)));
  }, 250);
  return {
    client: done => add('client', done),
    assets: done => add('assets', done),
    server: done => add('server', done),
    styles: done => add('styles', done)
  };
})();

function initServer() {
  let child = null;
  const run = done => {
    if(child) {
      child.kill();
      child = null;
    }
    else {
      child = child_process
        .fork('./dist/app/server/index.js')
        .on('exit', () => run());
    }
    if(done) {
      done();
    }
  };
  return run;
};

const loadBrowserSync = (() => {
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
  const restart = (arg, done) => (browserSync.reload(arg), done());
  return function(done) { return started ? restart(arguments[1], done) : start(done); };
})();

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

function buildStyles(compress, done) {
  const autoprefixerOptions = {
    remove: false,
    browsers: ['> 3%', 'last 2 versions']
  };
  let stream = gulp.src('./src/styles/index.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus({
      compress: !!compress,
      'include css': true
    }))
    .pipe(postcss([ autoprefixer(autoprefixerOptions) ]))
    .pipe(concat('styles.css'));
  if(compress)
    stream = stream.pipe(cssmin());
  stream = stream
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/www/css'))
    .on('end', done);
}

function runLinter(failAfterError) {
  let stream = gulp.src('./src/**/*.js')
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format());
  if(failAfterError)
    stream = stream.pipe(eslint.failAfterError()); // causes watchify to stop working for some reason
  return stream;
}

function runTests() {
  const slash = require('path').sep;
  const babelrc = Object.assign({
    ignore: filename => filename.indexOf(`${slash}src${slash}`) > -1
  }, JSON.parse(require('fs').readFileSync('.babelrc')));
  require('babel-register')(babelrc);
  return gulp.src(['./src/**/tests/**/*.js', './src/**/tests.js'], { read: false })
    .pipe(mocha({ timeout: 5000 }));
}

function buildServer() {
  return gulp.src(['./src/**/*.js', '!./src/client/index.js', '!tests/**/*.js', '!tests.js'])
    .pipe(plumber())
    // .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/app'));
}

function copyAssets() {
  return gulp.src('./assets/**/*')
    .pipe(plumber())
    .pipe(gulp.dest('./dist/www'));
}

function buildAndWatchAll(done) {
  startWatchify();
  build.server();
  build.client();
  build.styles();
  build.assets(done);
}

function buildForProduction(done) {
  runseq(
    'prebuild:clean',
    'prebuild:lint:prod',
    'prebuild:tests',
    ['build:server', 'build:client:prod', 'build:styles:prod'],
    'postbuild:assets',
    done
  );
}

// ----------------------------------------------------------------------------

gulp.task('reload:server', initServer());
gulp.task('reload:client', loadBrowserSync);
gulp.task('reload:client:css', done => loadBrowserSync(done, '*.css'));

gulp.task('prebuild:clean', cb => rimraf('./dist', cb));
gulp.task('prebuild:lint:dev', () => runLinter(false));
gulp.task('prebuild:lint:prod', () => runLinter(true));
gulp.task('prebuild:tests', runTests);

gulp.task('build:server', buildServer);
gulp.task('build:client:dev', done => buildClient(watcher, false, done));
gulp.task('build:client:prod', done => buildClient(attachBrowserifyTransforms(b), true, done));
gulp.task('build:styles:dev', done => buildStyles(false, done));
gulp.task('build:styles:prod', done => buildStyles(true, done));
gulp.task('build:dev', ['prebuild:clean'], buildAndWatchAll);

gulp.task('postbuild:assets', copyAssets);

gulp.task('watch', () => {
  gulp.watch(['./src/client/**/*.js', '!./src/client/index.js', './src/server/**/*.js', './src/node_modules/**/*.js'], build.server);
  gulp.watch(['./src/**/*.styl'], build.styles);
  gulp.watch(['./assets/**'], build.assets);
});
gulp.task('watch:tests', () => gulp.watch(['./src/**/*.js'], ['prebuild:tests']));

// ----------------------------------------------------------------------------

// run in isolation while writing unit tests
gulp.task('test:dev', ['prebuild:tests', 'watch:tests']);

// run when a deployment build is required
gulp.task('build:dist', buildForProduction);

// run for general development (does not include unit tests)
gulp.task('default', ['build:dev', 'watch']);
