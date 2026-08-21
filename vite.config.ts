import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:[],manifest:{name:'ACS Truck Operations',short_name:'ACS Truck',description:'Delivery, fleet, fuel, maintenance and profitability operations',theme_color:'#111827',background_color:'#f3f4f6',display:'standalone',start_url:'/',scope:'/',icons:[]}})],
  server:{host:true}
});