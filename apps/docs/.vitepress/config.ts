import { defineConfig } from 'vitepress';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  lang: 'zh-CN',
  title: 'IWOpenMap',
  description: '面向国内开发者的开源 Web 地图 SDK',
  base: process.env.DOCS_BASE ?? '/',
  cleanUrls: true,
  vite: {
    envDir: fileURLToPath(new URL('../../../', import.meta.url))
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Playground', link: '/playground/' }
    ],
    sidebar: {
      '/guide/': [
        { text: '开始', items: [
          { text: '选择你的技术栈', link: '/guide/' },
          { text: '普通 JavaScript', link: '/guide/javascript' },
          { text: 'Vue 2', link: '/guide/vue2' },
          { text: 'Vue 3', link: '/guide/vue3' },
          { text: '常见问题', link: '/guide/troubleshooting' }
        ] }
      ],
      '/api/': [{ text: 'API', items: [{ text: '核心 API', link: '/api/' }, { text: '地图源扩展', link: '/api/sources' }] }],
      '/playground/': [{ text: '功能示例', items: [{ text: '交互式演练场', link: '/playground/' }] }]
    },
    socialLinks: [],
    footer: { message: 'OpenMap 不是瓦片提供商。地图数据版权归相应数据提供方所有。', copyright: 'Released under the MIT License.' },
    search: { provider: 'local' }
  }
});
