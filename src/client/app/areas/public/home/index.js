import most from 'most';
import {p} from '@motorcycle/dom';

export default function Home(sources) {
  const state = {
    vtree: p('Home is where the heart is.'),
    model: { text: 'Some state information used by the home page' }
  };
  return {
    state: most.just(state)
  };
};
