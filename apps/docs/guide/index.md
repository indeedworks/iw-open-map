# 选择你的技术栈

OpenMap 的地图能力全部来自 `@indeedworks/open-map`。普通 JavaScript 直接使用核心包；Vue 2 与 Vue 3 项目则使用对应的轻量组件。

| 使用方式 | 入口 | 适合场景 |
| --- | --- | --- |
| 普通 HTML / JavaScript | [快速开始](/guide/javascript) | CDN、原生项目、任意框架 |
| Vue 2.6 / 2.7 | [快速开始](/guide/vue2) | 现有 Vue 2 项目 |
| Vue 3 | [快速开始](/guide/vue3) | Composition API、`<script setup>` |

## 第一步：申请天地图 Key

访问[天地图开发资源](https://cloudcenter.tianditu.gov.cn/center/development/myApp)，注册并创建浏览器端应用。把域名白名单限制为实际使用的域名。OpenMap 不内置 Key，也不会代理天地图瓦片。

```bash
cp .env.example .env
```

```dotenv
VITE_TIANDITU_TOKEN=你申请的浏览器端Key
```
