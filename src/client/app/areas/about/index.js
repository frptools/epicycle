import most from 'most';
import {p} from '@motorcycle/dom';

export default function About(sources) {

  return {
    DOM: most.just(p('All about us.'))
  };
};
