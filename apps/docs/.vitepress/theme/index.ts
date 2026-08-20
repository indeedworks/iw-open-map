import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import MapDemo from '../../components/MapDemo.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) { app.component('MapDemo', MapDemo); }
} satisfies Theme;
