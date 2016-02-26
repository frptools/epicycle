import most from 'most';
import {h} from '@motorcycle/dom';
import {assign} from 'common/utils';
import App from './app';

export default function main(sources) {
  // hide `pages` as a source and instead expose `DOM`, as per the standard pattern
  const convertedSources = assign(sources, { DOM: sources.pages.DOM, pages: void 0 });
  const sinks = App(convertedSources);

  // if the application returns a DOM sink, convert it to a page sink
  if(sinks.DOM) {
    console.log('DOM :(');
    const page$ = sinks.DOM.map(view => ({ view }));
    sinks.pages = (sinks.pages ? sinks.pages.merge(page$) : page$);
    delete sinks.DOM;
  }
  else if(!sinks.pages) { // this shouldn't generally happen
    sinks.pages = most.just({
      view: h('p', 'No view available.'),
      status: 'notfound'
    });
  }

  // specifying a string value for `status` is just an upstream convenience
  sinks.pages = sinks.pages.map(page =>
    (!page.status || typeof page.status === 'string')
      ? assign(page, { status: { type: page.status || 'found' } })
      : page);

  return sinks;
};
