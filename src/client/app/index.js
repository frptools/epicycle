import most from 'most';
import {h} from '@motorcycle/dom';
// import {merge} from 'common/utils';
import App from './app';

module.exports = function main(sources) {
  const sinks = App(Object.assign({}, sources, { DOM: sources.context.DOM }));

  // if the application returns a DOM sink, convert it to a context sink
  if(sinks.DOM) {
    const context$ = sinks.DOM.map(view => ({ view }));
    sinks.context = (sinks.context ? sinks.context.merge(context$) : context$);
  }
  else if(!sinks.context) {
    sinks.context = most.just({
      view: h('p', 'No view available.'),
      metadata: {
        status: 'notfound'
      }
    });
  }

  // sources.routes.combine((route, context) => {
  //   merge({ metadata: { status: '' }})
  //   if(route. context.metadata && context.metadata.status) {
  //
  //   }
  // }, sinks.context);

  return sinks;
};
