import {configureRoutes} from 'common/routing-helpers';
import Home from './areas/public/home';
import About from './areas/public/about';
import NotFound from './areas/errors/404';

module.exports = configureRoutes([
  { id: 'home', component: Home, path: '/' },
  { id: 'about', component: About, path: '/about' },
  { id: '404', component: NotFound, path: '*' }
]);
