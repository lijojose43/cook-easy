
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(<App />)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`
    navigator.serviceWorker.register(swUrl).catch(console.error)
  })
}
