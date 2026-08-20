# Playground 功能演练场

在本地 `.env` 配置 `VITE_TIANDITU_TOKEN` 后，下面会显示真实运行效果。

<MapDemo />

每项能力都使用同一套核心 API；三种接入方式仅在获取 `map` 实例的方式上不同。

## 1. 矢量、影像、地形切换

::: code-group
```js [JavaScript]
await map.setMapType('imagery');
```
```js [Vue 2]
this.map.setMapType('terrain');
```
```vue [Vue 3]
<button @click="map?.setMapType('vector')">矢量</button>
```
:::

## 2. 缩放、平移、旋转、定位与范围

::: code-group
```js [JavaScript]
map.zoomTo(12).panTo([116.397, 39.908]).rotateTo(30);
const location = await map.locate();
console.log(map.getBounds(), location);
```
```js [Vue 2]
this.map.flyTo([121.47, 31.23], 13);
```
```ts [Vue 3]
map.value?.fitBounds([[116, 39.5], [117, 40.2]], { padding: 40 });
```
:::

## 3. 标记、图标、标签、弹窗与事件

::: code-group
```js [JavaScript]
map.addMarker({ id:'m1', coordinates:[116.397,39.908], image:'/pin.png', rotation:30, label:'北京', popup:'详情' });
map.onMarker('m1', 'click', () => console.log('clicked'));
```
```js [Vue 2]
this.map.addMarker({ id:'svg', coordinates:[116.4,39.9], svg:'<svg>...</svg>' });
```
```ts [Vue 3]
map.value?.updateMarker('m1', { label: '新标签' });
```
:::

## 4. GeoJSON 点、线、面图层

::: code-group
```js [JavaScript]
map.addGeoJSONLayer({ id:'roads', type:'line', data:geojson, paint:{'line-color':'#ef4444','line-width':3} });
```
```js [Vue 2]
this.map.updateGeoJSONLayer('roads', nextGeoJSON);
```
```ts [Vue 3]
map.value?.onLayer('roads', 'click', event => console.log(event.features));
```
:::

## 5. 绘制与编辑点、线、矩形、圆、多边形

::: code-group
```js [JavaScript]
map.startDraw('polygon');
map.on('draw.create', feature => console.log(feature));
```
```js [Vue 2]
this.map.startDraw('rectangle');
this.map.startEdit(feature.id); // 拖拽顶点后 this.map.stopEdit()
```
```ts [Vue 3]
map.value?.startDraw('circle', { circleSteps: 96 });
```
:::

## 6. GeoJSON 导入与导出

::: code-group
```js [JavaScript]
map.importGeoJSON(fileText);
const text = map.exportGeoJSON();
```
```js [Vue 2]
this.map.importGeoJSON(this.savedData);
```
```ts [Vue 3]
const result = map.value?.exportGeoJSON(false);
```
:::

## 7. 距离与面积测量

::: code-group
```js [JavaScript]
const km = map.measureDistance(lineFeature);
const squareMeters = map.measureArea(polygonFeature);
```
```js [Vue 2]
this.distance = this.map.measureDistance(coordinates);
```
```ts [Vue 3]
area.value = map.value?.measureArea(feature) ?? 0;
```
:::

## 8. 大量点位聚合

::: code-group
```js [JavaScript]
map.addCluster({ id:'shops', data:points, radius:60, maxZoom:15 });
```
```js [Vue 2]
this.map.addCluster({ id:'devices', data:this.points });
```
```ts [Vue 3]
map.value?.removeCluster('devices');
```
:::

## 9. 自定义 XYZ

::: code-group
```js [JavaScript]
map.addCustomSource({ id:'xyz', provider:{ type:'xyz', tiles:['https://host/{z}/{x}/{y}.png'], attribution:'© Provider' } });
```
```js [Vue 2]
this.map.addCustomSource(this.xyzConfig);
```
```ts [Vue 3]
map.value?.addCustomSource(xyzConfig);
```
:::

## 10. 自定义 WMTS

::: code-group
```js [JavaScript]
map.addCustomSource({ id:'wmts', provider:{ type:'wmts', url, layer:'base', tileMatrixSet:'w', attribution:'© Provider' } });
```
```js [Vue 2]
this.map.addCustomSource(this.wmtsConfig);
```
```ts [Vue 3]
map.value?.addCustomSource(wmtsConfig);
```
:::

## 11. PMTiles、MBTiles、MVT 扩展

::: code-group
```js [JavaScript]
map.registerSourceAdapter({ type:'pmtiles', createSource: options => createPmtilesSource(options) });
await map.addExtensionSource('pmtiles', 'archive', { url:'/data.pmtiles' });
```
```js [Vue 2]
this.map.registerSourceAdapter(mbtilesAdapter);
```
```ts [Vue 3]
await map.value?.addExtensionSource('mvt', 'custom-mvt', options);
```
:::

## 12. 生命周期与事件

::: code-group
```js [JavaScript]
map.on('move', () => console.log(map.getBounds()));
map.destroy();
```
```js [Vue 2]
// OpenMapView 会在 beforeDestroy 自动销毁
```
```vue [Vue 3]
<!-- OpenMapView 会在 onBeforeUnmount 自动销毁 -->
```
:::
