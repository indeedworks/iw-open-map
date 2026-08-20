<script setup lang="ts">
import { computed, ref } from 'vue';
import { OpenMapView, type OpenMap } from '@indeedworks/open-map-vue3';

const token = import.meta.env.VITE_TIANDITU_TOKEN || 'your-tianditu-token';
const map = ref<OpenMap>();
const message = ref('等待地图加载');
const options = computed(() => ({ provider: { type: 'tianditu' as const, token, mapType: 'vector' as const }, center: [121.4737, 31.2304] as [number, number], zoom: 10 }));
function ready(instance: OpenMap) { map.value = instance; instance.addMarker({ id: 'shanghai', coordinates: [121.4737, 31.2304], label: '上海市', popup: 'Vue 3 + OpenMap' }); message.value = 'Vue 3 组件已就绪'; }
function draw() { map.value?.startDraw('circle'); message.value = '点击圆心和边缘绘制圆形'; }
</script>
<template><div class="shell"><header><b>OpenMap · Vue 3</b><button @click="map?.setMapType('vector')">矢量</button><button @click="map?.setMapType('imagery')">影像</button><button @click="draw">绘制圆形</button><span>{{ message }}</span></header><OpenMapView class="map" :options="options" @ready="ready" @error="message = String($event)" /></div></template>
