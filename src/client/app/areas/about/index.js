import most from 'most';
import {p} from '@motorcycle/dom';

export default function About(sources) {
  const page = {
    view: p('All about us.')
  };
  return {
    pages: most.just(page)
  };
};
