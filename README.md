# OpenMap

OpenMap 是一套面向国内开发者的开源 Web 地图 SDK。它提供框架无关的 TypeScript 核心，并提供 Vue 2.6/2.7、Vue 3 适配组件以及普通 JavaScript 示例。

**在线文档：** [https://openmap.indeedworks.cn/](https://openmap.indeedworks.cn/)

> **重要说明：OpenMap 不是地图数据或瓦片提供商。** 本项目不提供、不代理、不缓存、不批量下载、也不重新分发天地图或其他第三方瓦片。默认接入天地图时，使用者必须自行申请 Key，并遵守天地图服务条款和国内地图相关法律法规。不得移除版权、数据来源及审图信息。

## 功能

- 天地图矢量、影像、地形底图切换；
- 缩放、平移、旋转、定位、范围获取与视野适配；
- 标记的增删改，自定义图片、SVG、HTML、旋转、标签、弹窗和事件；
- GeoJSON 点、线、面图层与图层事件；
- 点、线、矩形、圆形、多边形绘制，数据编辑与删除；
- GeoJSON 导入、导出，距离与面积测量；
- 大量点位聚合；
- XYZ、WMTS 地图源；
- PMTiles、MBTiles、MVT 可插拔扩展接口。

## Monorepo

```text
packages/core      @indeedworks/open-map
packages/vue2      @indeedworks/open-map-vue2
packages/vue3      @indeedworks/open-map-vue3
apps/docs          中文教学网站
apps/vanilla-demo  JavaScript 示例
apps/vue2-demo     Vue 2 示例
apps/vue3-demo     Vue 3 示例
```

Vue 组件只负责地图实例的挂载、销毁、尺寸同步和事件转发。地图业务逻辑只在 `@indeedworks/open-map` 中实现，核心包不依赖 Vue。

## 环境要求与启动

- Node.js 20+
- pnpm 11+

本仓库使用 `pnpm-workspace.yaml` 和 `workspace:*` 协议，请勿运行 `npm install` 或 `yarn install`。如果尚未启用 pnpm，可先执行 `corepack enable`。

```bash
corepack enable
pnpm install
cp .env.example .env
# 编辑仓库根目录的 .env，填写自己申请的 VITE_TIANDITU_TOKEN；所有示例共用此文件
pnpm dev
```

独立运行示例：

```bash
pnpm dev:vanilla
pnpm dev:vue2
pnpm dev:vue3
```

## 快速使用

```ts
import { OpenMap } from '@indeedworks/open-map';
import '@indeedworks/open-map/style.css';

const map = new OpenMap({
  container: 'map',
  provider: {
    type: 'tianditu',
    token: import.meta.env.VITE_TIANDITU_TOKEN,
    mapType: 'vector'
  },
  center: [116.397, 39.908],
  zoom: 10
});

await map.ready();
map.addMarker({
  id: 'marker-001',
  coordinates: [116.397, 39.908],
  label: '北京市'
});
```

构建后的核心包包含 ESM、CommonJS、IIFE、TypeScript 类型声明和 CSS。IIFE 版本需要页面先提供全局 `maplibregl` 与 `turf`。

## 质量命令

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

访问 `http://localhost:8080`。Docker 构建参数只用于示例页面的浏览器端配置；天地图 Key 会出现在浏览器请求中，这是浏览器端 Key 的正常工作方式，因此必须配置域名白名单与用量限制，且不要提交 `.env`。

三个独立示例位于：

- `/demos/vanilla/`
- `/demos/vue2/`
- `/demos/vue3/`

## 合规与坐标注意事项

- 本项目不授予任何第三方地图数据的使用权；
- 使用天地图或其他数据源前，请阅读并遵守相应服务条款、授权范围和配额；
- 不得通过本 SDK 批量抓取、离线缓存、代理或重新分发第三方瓦片；
- 不得隐藏或删除地图上的版权、来源和审图信息；
- 在中国境内发布地图服务时，应自行确认数据、坐标、审图、备案等合规义务；
- OpenMap API 使用 `[经度, 纬度]`，不自动进行 WGS84、GCJ-02、BD-09 之间的转换，避免使用者误以为转换结果天然合规。

## License

[MIT](./LICENSE)

## npm 发布

公开包使用 IndeedWorks 组织 scope：`@indeedworks/open-map`、`@indeedworks/open-map-vue2`、`@indeedworks/open-map-vue3`。发布者需要先加入 npm 的 `indeedworks` organization，并启用 2FA。

```bash
npm login
pnpm build
pnpm --filter @indeedworks/open-map publish --access public
pnpm --filter @indeedworks/open-map-vue2 publish --access public
pnpm --filter @indeedworks/open-map-vue3 publish --access public
```
