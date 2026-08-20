<script lang="ts">
import Vue from 'vue';
import { OpenMapView, type OpenMap } from '@indeedworks/open-map-vue2';

export default Vue.extend({
  name: 'App', components: { OpenMapView },
  data: () => ({ map: null as OpenMap | null, message: '等待地图加载', options: { provider: { type: 'tianditu' as const, token: import.meta.env.VITE_TIANDITU_TOKEN || 'your-tianditu-token', mapType: 'vector' as const }, center: [113.2644, 23.1291] as [number, number], zoom: 10 } }),
  methods: {
    ready(map: OpenMap) { this.map = map; map.addMarker({ id: 'guangzhou', coordinates: [113.2644, 23.1291], label: '广州市', popup: 'Vue 2 + OpenMap' }); this.message = 'Vue 2 组件已就绪'; },
    draw() { this.map?.startDraw('rectangle'); this.message = '点击矩形的两个对角点'; }
  }
});
</script>
<template><div class="shell"><header><b>OpenMap · Vue 2</b><button @click="map && map.setMapType('vector')">矢量</button><button @click="map && map.setMapType('terrain')">地形</button><button @click="draw">绘制矩形</button><span>{{ message }}</span></header><OpenMapView class="map" :options="options" @ready="ready" @error="message = String($event)" /></div></template>
