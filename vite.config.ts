import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins:[
    react(),
    VitePWA({
      registerType:'autoUpdate',
      workbox:{navigateFallback:'/',cleanupOutdatedCaches:true},
      manifest:{
        name:'ACS Truck Operations',
        short_name:'ACS Truck',
        description:'Delivery, fleet, fuel, maintenance and profitability operations',
        theme_color:'#0b1220',
        background_color:'#f6f7f9',
        display:'standalone',
        orientation:'any',
        start_url:'/',
        scope:'/',
        categories:['business','productivity'],
        shortcuts:[
          {name:'Deliveries',short_name:'Deliveries',url:'/?view=deliveries'},
          {name:'New expense',short_name:'Expense',url:'/?view=transactions'}
        ]
      }
    })
  ],
  server:{host:true}
});