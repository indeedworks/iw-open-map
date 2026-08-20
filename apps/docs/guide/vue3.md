# Vue 3 快速开始

```bash
pnpm add @indeedworks/open-map @indeedworks/open-map-vue3
```

```vue
<script setup lang="ts">
import { OpenMapView, type OpenMap } from '@indeedworks/open-map-vue3';
import '@indeedworks/open-map/style.css';

const options = {
  provider: { type: 'tianditu' as const, token: import.meta.env.VITE_TIANDITU_TOKEN, mapType: 'vector' as const },
  center: [116.397, 39.908] as [number, number], zoom: 10
};
function onReady(map: OpenMap) {
  map.addMarker({ id: 'beijing', coordinates: [116.397, 39.908], label: '北京市' });
  map.startDraw('polygon');
}
</script>
<template><OpenMapView style="height:500px" :options="options" @ready="onReady" /></template>
```
