import {nav, ul, li, a} from '@motorcycle/dom';

function view(route, paths, ahref) {
  return (
    nav('.nav-primary', [
      ul('.nav-primary__links', [
        li('.nav-primary__link', { class: { 'nav-primary__link--active': route.fullPath === paths.home } }, [ahref(paths.home, 'Home')]),
        li('.nav-primary__link', { class: { 'nav-primary__link--active': route.fullPath === paths.about } }, [ahref(paths.about, 'About')]),
        li('.nav-primary__link', { class: { 'nav-primary__link--active': false } }, [ahref('/broken-link-should-generate-404', 'This link is broken')])
      ])
    ])
  );
}

export default function Navigation(sources, paths) {
  const ahref = (url, text) => a({attrs: {href: sources.router.createHref(url)}}, text);
  const route$ = sources.page$.map(page => page.state).switch().map(state => state.route);
  const view$ = route$.map(route => view(route, paths, ahref));
  return {
    DOM: view$
  };
}
