import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OpenFeature, OpenFeatureProvider } from '@openfeature/react-sdk'
import { FlagdWebProvider } from '@openfeature/flagd-web-provider'


OpenFeature.setProvider(new FlagdWebProvider({
  host: 'ssoon-flagd.ianlog.me', // 배포된 호스트
  tls: true, // HTTPS니까 true  
  port: 443, // https
  maxRetries: 0,
}))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OpenFeatureProvider domain='ssoon-flagd.ianlog.me'>
      <App />
    </OpenFeatureProvider>
  </StrictMode>,
)
