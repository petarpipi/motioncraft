import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/space-grotesk/latin-500.css'
import { MotionProvider } from './motion'
import App from './App'
import './styles/base.css'
import './styles/layout.css'
import './styles/home.css'
import './styles/pages.css'
import './styles/reduced.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionProvider>
        <App />
      </MotionProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
