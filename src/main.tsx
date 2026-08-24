import React from 'react';
import ReactDOM from 'react-dom/client';
import {QueryClientProvider} from '@tanstack/react-query';
import {registerSW} from 'virtual:pwa-register';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import {queryClient} from './v13/query';
import './styles.css';
import './production.css';
import './pwa-controls.css';

let reloading=false;if('serviceWorker'in navigator)navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;window.location.reload()});
const updateSW=registerSW({immediate:true,onRegisteredSW(_url,registration){registration?.update().catch(()=>{});window.setInterval(()=>registration?.update().catch(()=>{}),5*60_000)},onNeedRefresh(){window.dispatchEvent(new Event('acs-pwa-update'));updateSW(true).catch(()=>{})},onOfflineReady(){window.dispatchEvent(new Event('acs-pwa-offline-ready'))}});(window as any).__ACS_UPDATE_SW__=updateSW;
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><QueryClientProvider client={queryClient}><App/></QueryClientProvider></ErrorBoundary></React.StrictMode>);
