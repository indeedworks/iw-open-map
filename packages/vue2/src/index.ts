import Vue, { type PropType, type VueConstructor } from 'vue';
import { OpenMap, type OpenMapOptions } from '@indeedworks/open-map';
import '@indeedworks/open-map/style.css';

export const OpenMapView = Vue.extend({
  name: 'OpenMapView',
  props: {
    options: { type: Object as PropType<Omit<OpenMapOptions, 'container'>>, required: true }
  },
  data(): { instance: OpenMap | null; observer: ResizeObserver | null } {
    return { instance: null, observer: null };
  },
  mounted() {
    const instance = new OpenMap({ ...this.options, container: this.$refs.container as HTMLElement });
    this.instance = instance;
    instance.ready().then(() => this.$emit('ready', instance)).catch((error) => this.$emit('error', error));
    this.observer = new ResizeObserver(() => instance.resize());
    this.observer.observe(this.$refs.container as HTMLElement);
  },
  beforeDestroy() {
    this.observer?.disconnect();
    this.instance?.destroy();
    this.instance = null;
  },
  methods: {
    getMap(): OpenMap | null { return this.instance; }
  },
  render(createElement) {
    return createElement('div', { ref: 'container', class: 'open-map-vue2' });
  }
});

export const OpenMapVue2Plugin = {
  install(VueClass: VueConstructor): void { VueClass.component('OpenMapView', OpenMapView); }
};

export { OpenMap } from '@indeedworks/open-map';
export type * from '@indeedworks/open-map';
export default OpenMapVue2Plugin;
