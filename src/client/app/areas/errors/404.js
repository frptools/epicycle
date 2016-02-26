import most from 'most';
import {p} from '@motorcycle/dom';

export default function NotFound(sources) {

  return {
    pages: most.just({
      view: p('Page not found.'),
      status: 'notfound'
    })
  };
};
