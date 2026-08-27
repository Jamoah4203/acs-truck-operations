import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins:[
    react(),
    VitePWA({
      registerType:'prompt',
      includeAssets:['icons/acs-truck.svg'],
      workbox:{
        navigateFallback:'/',
        cleanupOutdatedCaches:true,
        clientsClaim:false,
        skipWaiting:false
      },
      manifest:{
        id:'/',
        name:'ACS Truck Operations',
        short_name:'ACS Truck',
        description:'Delivery, fleet, income, expense, maintenance and profitability operations for ACS.',
        theme_color:'#0b1220',
        background_color:'#f6f7f9',
        display:'standalone',
        display_override:['window-controls-overlay','standalone','minimal-ui'],
        orientation:'any',
        start_url:'/',
        scope:'/',
        categories:['business','productivity','finance'],
        icons:[{src:'/icons/acs-truck.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}],
        shortcuts:[
          {name:'Dashboard',short_name:'Dashboard',url:'/?view=dashboard'},
          {name:'Income',short_name:'Income',url:'/?view=income'},
          {name:'Expenses',short_name:'Expenses',url:'/?view=expenses'},
          {name:'Reports',short_name:'Reports',url:'/?view=reports'}
        ]
      }
    })
  ],
  build:{sourcemap:false,target:'es2021'},
  server:{host:true}
});