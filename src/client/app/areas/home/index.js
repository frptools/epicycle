import most from 'most';
import {p} from '@motorcycle/dom';

export default function Home(sources) {
  const page = {
    view: p('Home is where the heart is.')
  };
  return {
    pages: most.just(page)
  };
};
