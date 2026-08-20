# 地图源与扩展

## XYZ

```ts
map.addCustomSource({ id: 'local-xyz', provider: {
  type: 'xyz', tiles: ['https://example.com/{z}/{x}/{y}.png'],
  attribution: '© 数据提供方', maxzoom: 18
}});
```

## WMTS

```ts
map.addCustomSource({ id: 'wmts', provider: {
  type: 'wmts', url: 'https://example.com/wmts', layer: 'base',
  tileMatrixSet: 'WebMercator', attribution: '© 数据提供方'
}});
```

## PMTiles、MBTiles、MVT

通过 `registerSourceAdapter({ type, createSource })` 注册协议适配器，再调用 `addExtensionSource`。浏览器不能直接读取服务器上的 MBTiles 文件，通常需要由使用者自己的合规服务按需提供瓦片；OpenMap 不内置代理或重新分发逻辑。
