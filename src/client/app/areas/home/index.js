import most from 'most';
import {p} from '@motorcycle/dom';

export default function Home(sources) {
  return {
    DOM: most.just(p('Home is where the heart is.'))
  };
};
