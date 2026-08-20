# 核心 API

## 地图与视图

`zoomTo`、`panTo`、`flyTo`、`rotateTo`、`locate`、`getBounds`、`fitBounds`、`resize`、`setProvider`、`setMapType`。

## 标记

`addMarker`、`updateMarker`、`removeMarker`、`clearMarkers`、`onMarker`。标记支持图片 URL、SVG 字符串、HTML 元素、旋转、标签、弹窗、拖拽和事件。

## GeoJSON 与绘制

`addGeoJSONLayer`、`updateGeoJSONLayer`、`removeGeoJSONLayer`、`onLayer`；`startDraw` 支持点、线、矩形、圆和多边形。使用 `startEdit(id)` 显示可拖拽顶点，`stopEdit()` 结束交互编辑；也可用 `updateDrawFeature` 直接更新数据，使用 `deleteDrawFeature` 删除。

## 导入、导出与测量

`importGeoJSON`、`exportGeoJSON`、`measureDistance`（公里）、`measureArea`（平方米）。

## 聚合

`addCluster` 使用 MapLibre 原生 GeoJSON 聚合，适合大量点位；`removeCluster` 清理相关图层与数据源。
