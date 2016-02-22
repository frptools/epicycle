import {paths} from './routes';
import {nav, li, a} from '@motorcycle/dom';
import {configureStyles} from 'common/style-helpers';

const css = configureStyles({
  color: 'red'
});

function view(route$, ahref) {
  return route$.map(({path}) =>
    nav(`.${css}`, [
      li([ahref(paths.home, 'Home')]),
      li([ahref(paths.about, 'About')])
      // li([ahref(paths.home, `Home`)]),
    ])
  );
}

export default function Navigation(sources, page$) {
  const ahref = (url, text) => a({attrs: {href: sources.router.createHref(url)}}, text);
  const route$ = page$.map(page => page.route);
  const view$ = view(route$, ahref);
  return {
    DOM: view$
  };
}
