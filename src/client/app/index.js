import {assign} from 'common/utils';
import App from './app';

function sanitizeStatus(state) {
  const model = state.model || {};
  if(model.status && typeof model.status === 'object') {
    return state;
  }
  const newModel = assign(model, { status: { type: model.status || 'found' }});
  return assign(state, { model: newModel });
}

export default function main(sources) {
  // applyAPI must be called first in order to surface its internals for general consumption
  const convertedSources = sources.state.applyAPI(sources);
  const sinks = App(convertedSources);

  if(sinks.DOM) {
    console.warning('App should return a state sink, rather than a DOM sink');
    const state$ = sinks.DOM.map(vtree => ({ vtree }));
    sinks.state = (sinks.state ? sinks.state.merge(state$) : state$);
    delete sinks.DOM;
  }
  else if(!sinks.state) {
    throw new Error('App component failed to return a state sink');
  }

  // specifying a string value for `status` is just an upstream convenience
  // for when additional context values are not required (as opposed to cases
  // like 302 redirects, which also require a location value).
  sinks.state = sinks.state.map(sanitizeStatus);
  // sinks.state = sinks.state.map(debug(sanitizeStatus, 'STATE'));

  return sinks;
};
