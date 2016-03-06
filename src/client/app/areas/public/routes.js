import {configureRoutes} from 'common/routing-helpers';
import Home from './home';
import About from './about';

module.exports = configureRoutes([
  { id: 'home', component: Home, path: '/' },
  { id: 'about', component: About, path: '/about' }
]);
