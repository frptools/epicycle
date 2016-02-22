import most from 'most';
import {p} from '@motorcycle/dom';

export default function NotFound(sources) {

  return {
    DOM: most.just(p('Page not found.'))
  };
};
