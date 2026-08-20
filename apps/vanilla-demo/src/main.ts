import { OpenMap, type TiandituMapType } from '@indeedworks/open-map';
import '@indeedworks/open-map/style.css';
import './style.css';

const token = import.meta.env.VITE_TIANDITU_TOKEN || 'your-tianditu-token';
const status = document.querySelector<HTMLElement>('#status')!;

try {
  const map = new OpenMap({ container: 'map', provider: { type: 'tianditu', token, mapType: 'vector' }, center: [116.397, 39.908], zoom: 10 });
  map.on('ready', () => {
    map.addMarker({ id: 'marker-001', coordinates: [116.397, 39.908], label: '北京市', popup: '<b>天安门</b><br>点击工具栏体验 OpenMap。', color: '#e11d48' });
    status.textContent = '地图已加载：滚轮缩放，拖动平移，右键旋转。';
  });
  map.on('draw.create', () => { status.textContent = '多边形已创建，可点击“导出 GeoJSON”。'; });
  document.querySelectorAll<HTMLButtonElement>('[data-map]').forEach((button) => button.addEventListener('click', () => void map.setMapType(button.dataset.map as TiandituMapType)));
  document.querySelector('#draw')?.addEventListener('click', () => { map.startDraw('polygon'); status.textContent = '依次点击顶点，双击结束，Esc 取消。'; });
  document.querySelector('#export')?.addEventListener('click', () => {
    const blob = new Blob([map.exportGeoJSON()], { type: 'application/geo+json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'open-map.geojson'; link.click(); URL.revokeObjectURL(link.href);
  });
} catch (error) {
  status.textContent = error instanceof Error ? error.message : String(error);
}
