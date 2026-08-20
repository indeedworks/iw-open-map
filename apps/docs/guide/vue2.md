# Vue 2 快速开始

支持 Vue 2.6 与 2.7。地图逻辑仍由 `@indeedworks/open-map` 提供。

```bash
pnpm add @indeedworks/open-map @indeedworks/open-map-vue2
```

```vue
<script>
import { OpenMapView } from '@indeedworks/open-map-vue2';
import '@indeedworks/open-map/style.css';

export default {
  components: { OpenMapView },
  data: () => ({ options: {
    provider: { type: 'tianditu', token: process.env.VUE_APP_TIANDITU_TOKEN, mapType: 'vector' },
    center: [116.397, 39.908], zoom: 10
  }}),
  methods: {
    onReady(map) {
      map.addMarker({ id: 'beijing', coordinates: [116.397, 39.908], label: '北京市' });
      map.startDraw('polygon');
    }
  }
};
</script>
<template><OpenMapView style="height:500px" :options="options" @ready="onReady" /></template>
```
