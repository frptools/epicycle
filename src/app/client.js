const most = require('most');
const {run} = require('@motorcycle/core');
const {makeDOMDriver} = require('@motorcycle/dom');
const {html, head, title, body, div, script} = require('@motorcycle/dom');
const App = require('./app');

// run()
console.log('Client is running.');

require('./areas/home/index');
