# @indeedworks/open-map

OpenMap 的框架无关 TypeScript 核心 SDK，提供天地图、XYZ、WMTS、标记、GeoJSON、绘制、测量和点聚合等能力。

```bash
pnpm add @indeedworks/open-map
```

```ts
import { OpenMap } from '@indeedworks/open-map';
import '@indeedworks/open-map/style.css';

const map = new OpenMap({
  container: 'map',
  provider: { type: 'tianditu', token: '使用者自己的Key', mapType: 'vector' }
});
```

本包不提供、代理或重新分发地图瓦片。使用者须自行申请地图服务 Key，并遵守数据提供方条款及国内地图相关规定。
