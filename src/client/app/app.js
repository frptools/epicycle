import {h1, div} from '@motorcycle/dom';
import {makePageComponent} from 'common/component-helpers';
import {routes, paths} from './routes';
import Navigation from './components/navigation';

function makeView({ nav, page, model }) {
  return (
    div('.app', [
      div('.app__nav', [nav.vtree]),
      h1(model.heading),
      div('.app__content', [page.vtree])
    ])
  );
}

function makeModel({ page: { model } }) {
  const appTitle = 'Epicycle: Isomorphic Foundation';
  const title = model && model.title ? `${appTitle} / ${model.title}` : appTitle;
  const status = model.status;
  const heading = model.heading || model.title || appTitle;
  return {
    title,
    status,
    heading // propagate these automatically if not manually specified
  };
}

export default makePageComponent({
  routes,
  makeView,
  makeModel,
  main: sources => ({
    nav: Navigation(sources, paths),
  })
});
