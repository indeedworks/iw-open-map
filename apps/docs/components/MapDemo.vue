<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { OpenMap } from '@indeedworks/open-map';
import '@indeedworks/open-map/style.css';

const container = ref<HTMLElement>();
const message = ref('请配置 VITE_TIANDITU_TOKEN 后运行示例');
let map: OpenMap | undefined;

onMounted(() => {
  const token = import.meta.env.VITE_TIANDITU_TOKEN || '';
  if (!token || !container.value) return;
  try {
    map = new OpenMap({ container: container.value, provider: { type: 'tianditu', token, mapType: 'vector' }, center: [116.397, 39.908], zoom: 9 });
    map.ready().then(() => { map?.addMarker({ id: 'beijing', coordinates: [116.397, 39.908], label: '北京市' }); message.value = '示例已就绪'; });
  } catch (error) { message.value = String(error); }
});
onBeforeUnmount(() => map?.destroy());
function draw(mode: 'point' | 'line' | 'rectangle' | 'circle' | 'polygon') { map?.startDraw(mode); message.value = mode === 'polygon' || mode === 'line' ? '依次点击，双击结束' : '请在地图上点击完成绘制'; }
function switchType(type: 'vector' | 'imagery' | 'terrain') { void map?.setMapType(type); }
</script>
<template><div class="demo-toolbar"><button @click="switchType('vector')">矢量</button><button @click="switchType('imagery')">影像</button><button @click="switchType('terrain')">地形</button><button @click="draw('point')">点</button><button @click="draw('line')">线</button><button @click="draw('rectangle')">矩形</button><button @click="draw('circle')">圆</button><button @click="draw('polygon')">多边形</button><span class="demo-message">{{ message }}</span></div><div ref="container" class="demo-frame" /></template>
