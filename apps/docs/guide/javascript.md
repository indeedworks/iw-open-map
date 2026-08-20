# 普通 JavaScript 快速开始

## npm / pnpm 项目

```bash
pnpm add @indeedworks/open-map
```

```html
<div id="map" style="height: 500px"></div>
```

```js
import { OpenMap } from '@indeedworks/open-map';
import '@indeedworks/open-map/style.css';

const map = new OpenMap({
  container: 'map',
  provider: { type: 'tianditu', token: import.meta.env.VITE_TIANDITU_TOKEN, mapType: 'vector' },
  center: [116.397, 39.908], zoom: 10
});

await map.ready();
map.addMarker({ id: 'marker-001', coordinates: [116.397, 39.908], label: '北京市' });
map.startDraw('polygon'); // 依次单击顶点，双击完成
```

## `<script>` 方式

发布后的 IIFE 包暴露 `OpenMapSDK`。同时引入 MapLibre GL JS 与 Turf 的 UMD 包，再引入 `iw-open-map.iife.js` 和 `iw-open-map.css`：

```html
<link rel="stylesheet" href="./iw-open-map.css">
<script src="./maplibre-gl.js"></script>
<script src="./turf.min.js"></script>
<script src="./iw-open-map.iife.js"></script>
<script>
  const map = new OpenMapSDK.OpenMap({
    container: 'map',
    provider: { type: 'tianditu', token: window.TIANDITU_TOKEN }
  });
</script>
```

继续阅读[地图不显示排查](/guide/troubleshooting)。
