import type { App } from 'vue';
import OpenMapView from './OpenMapView.vue';
import '@indeedworks/open-map/style.css';

export { OpenMapView };
export { OpenMap } from '@indeedworks/open-map';
export type * from '@indeedworks/open-map';

export default {
  install(app: App): void { app.component('OpenMapView', OpenMapView); }
};
