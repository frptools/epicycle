import {run} from '@motorcycle/core';
import {makeDOMDriver} from '@motorcycle/dom';
import {makeRouterDriver} from '@motorcycle/router';
import {createHistory} from 'history';

import App from './app';

const history = createHistory();
catchClicks();

run(App, {
  DOM: makeDOMDriver('.app-root'),
  router: makeRouterDriver(history)
});

function catchClicks() {
  let clickEventName = (typeof document !== 'undefined') && document.ontouchstart ? 'touchstart' : 'click';
  let clickHandler = makeOnClick(path => path, path => history.push(path));
  document.addEventListener(clickEventName, clickHandler, false);
}

// The following is adapted from VisionMedia's page.js router
// https://github.com/visionmedia/page.js/blob/master/index.js

function makeOnClick(match, callback) {
  /**
   * Event button.
   */
  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */
  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  return function onclick(e) {

    if (1 !== which(e)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;

    // ensure link
    var el = e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;

    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (el.pathname === location.pathname && (el.hash || '#' === link)) return;

    // Check for unexpected protocols in the href, e.g. (mailto: or skype:)
    if (link && /^[a-z]+:/.test(link) && /^https?/.test(link)) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;

    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    var route = match(path);
    if(!route) return;

    e.preventDefault();

    callback(route);
  };
};
