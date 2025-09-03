
import React, { useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import RecipeCard from './components/RecipeCard.jsx'
import RecipeForm from './components/RecipeForm.jsx'
import PurchaseList from './components/PurchaseList.jsx'
import RecipeView from './components/RecipeView.jsx'
import { loadRecipes, saveRecipes, loadMixes, saveMixes } from './lib/storage.js'

export default function App() {
  const [recipes, setRecipes] = useState(() => loadRecipes())
  const [adding, setAdding] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [showList, setShowList] = useState(false)
  const [selected, setSelected] = useState({})
  const [viewRecipe, setViewRecipe] = useState(null)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)
  // theme: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved === 'dark' || saved === 'light') return saved
    } catch {}
    try {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    } catch { return 'light' }
  })
  const [dismissedUntil, setDismissedUntil] = useState(() => {
    try { return Number(localStorage.getItem('pwa_install_dismissed_until')) || 0 } catch { return 0 }
  })

  // Admin mode toggle via secret query param (?admin=KEY). Default key 'chef' or VITE_ADMIN_KEY
  const isAdmin = useMemo(() => {
    try {
      const key = (import.meta?.env?.VITE_ADMIN_KEY) || 'chef'
      const qp = new URLSearchParams(window.location.search)
      return qp.get('admin') === key
    } catch {
      return false
    }
  }, [])

  // Apply theme to <html> and persist
  React.useEffect(() => {
    try {
      const root = document.documentElement
      if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark')
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  const snoozeInstallPrompt = (days = 7) => {
    try {
      const until = Date.now() + days * 24 * 60 * 60 * 1000
      localStorage.setItem('pwa_install_dismissed_until', String(until))
      setDismissedUntil(until)
      setDeferredPrompt(null)
    } catch {
      setDeferredPrompt(null)
    }
  }

  // PWA install prompt handling
  React.useEffect(() => {
    const checkStandalone = () => {
      const mql = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
      const ios = window.navigator.standalone === true
      setIsStandalone(Boolean(mql || ios))
    }
    checkStandalone()
    const onBeforeInstall = (e) => {
      // Prevent auto mini-infobar
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
      try { localStorage.removeItem('pwa_install_dismissed_until') } catch {}
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)
    window.addEventListener('visibilitychange', checkStandalone)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
      window.removeEventListener('visibilitychange', checkStandalone)
    }
  }, [])

  const promptInstall = async () => {
    try {
      if (!deferredPrompt) return
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice && choice.outcome !== 'dismissed') {
        setDeferredPrompt(null)
      }
    } catch {
      // ignore
    }
  }

  // On first load, if no local data, try loading static seed from public/seed.json
  React.useEffect(() => {
    const hasLocalRecipes = Array.isArray(recipes) && recipes.length > 0
    let hasLocalMixes = false
    try { hasLocalMixes = Array.isArray(loadMixes()) && loadMixes().length > 0 } catch { hasLocalMixes = false }
    if (hasLocalRecipes || hasLocalMixes) return
    const seedUrl = (import.meta?.env?.BASE_URL || '/') + 'seed.json'
    ;(async () => {
      try {
        const res = await fetch(seedUrl, { cache: 'no-cache' })
        if (!res.ok) return
        const data = await res.json()
        const seedRecipes = Array.isArray(data?.recipes) ? data.recipes : []
        const seedMixes = Array.isArray(data?.mixes) ? data.mixes : []
        if (seedRecipes.length > 0) {
          saveRecipes(seedRecipes)
          setRecipes(seedRecipes)
        }
        if (seedMixes.length > 0) {
          saveMixes(seedMixes)
        }
      } catch {
        // ignore
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSelect = (id) => {
    setSelected(s => ({ ...s, [id]: !s[id] }))
  }

  const saveRecipe = (r) => {
    if (!isAdmin) { alert('Admin only action'); return }
    // if recipe exists, update; else prepend
    const idx = recipes.findIndex(x => x.id === r.id)
    let next
    if (idx >= 0) {
      next = [...recipes]
      next[idx] = r
    } else {
      next = [r, ...recipes]
    }
    setRecipes(next)
    saveRecipes(next)
  }

  const deleteRecipe = (id) => {
    if (!isAdmin) { alert('Admin only action'); return }
    const next = recipes.filter(r => r.id !== id)
    setRecipes(next)
    saveRecipes(next)
    setSelected(s => { const n = {...s}; delete n[id]; return n })
  }

  const purchaseItems = useMemo(() => {
    const items = []
    for (const r of recipes) {
      if (selected[r.id]) items.push(...r.ingredients)
    }
    return items
  }, [recipes, selected])

  const exportTxt = () => {
    const content = Array.from(new Set(purchaseItems)).sort().join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'purchase-list.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  // helper: read Blob to data URL
  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })

  // helper: compress an image blob via canvas to WebP/JPEG
  const compressImageBlob = async (blob, { maxSize = 1280, quality = 0.8 } = {}) => {
    try {
      const url = URL.createObjectURL(blob)
      const img = new Image()
      const loaded = new Promise((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
      })
      img.src = url
      await loaded

      let { width, height } = img
      const scale = Math.min(1, maxSize / Math.max(width, height))
      const targetW = Math.max(1, Math.round(width * scale))
      const targetH = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, targetW, targetH)

      // Prefer WebP, fallback to JPEG
      let dataUrl = ''
      try {
        dataUrl = canvas.toDataURL('image/webp', quality)
      } catch {
        dataUrl = ''
      }
      if (!dataUrl || dataUrl === 'data:,') {
        try {
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        } catch {
          dataUrl = ''
        }
      }
      URL.revokeObjectURL(url)
      // Fallback: if conversion failed, return original blob as data URL
      if (!dataUrl || dataUrl === 'data:,') {
        return await blobToDataUrl(blob)
      }
      return dataUrl
    } catch {
      // On any error, fallback to original blob as data URL
      try { return await blobToDataUrl(blob) } catch { return null }
    }
  }

  // helper: try to inline image as data URL; if fails, return original
  const inlineImage = async (src) => {
    try {
      if (!src || typeof src !== 'string') return src
      if (src.startsWith('data:')) return src
      const res = await fetch(src, { mode: 'cors' })
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const dataUrl = await compressImageBlob(blob, { maxSize: 1280, quality: 0.8 })
      return dataUrl
    } catch {
      return src
    }
  }

  // Export all content (recipes + mixes) as JSON, inlining images as data URLs when possible
  const exportAll = async () => {
    try {
      const mixes = loadMixes()
      const recipesWithImages = await Promise.all(recipes.map(async r => ({
        ...r,
        image: await inlineImage(r.image)
      })))
      const data = { recipes: recipesWithImages, mixes }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'seed.json'
      a.click()
      URL.revokeObjectURL(url)
      alert('Exported seed.json. To share with all users, place this file at public/seed.json in the repo and redeploy GitHub Pages.')
    } catch (e) {
      console.error('Export failed', e)
      alert('Failed to export content.')
    }
  }

  // Import content (recipes + mixes) from JSON file
  const importAll = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = async () => {
      const file = input.files && input.files[0]
      if (!file) return
      try {
        const text = await file.text()
        const parsed = JSON.parse(text)
        const nextRecipes = Array.isArray(parsed?.recipes) ? parsed.recipes : []
        // Ensure images are strings (prefer data URLs if provided)
        for (const r of nextRecipes) {
          if (r && typeof r === 'object') {
            // if someone provided { imageData: { mime, data } }, convert to data URL
            if (!r.image && r.imageData && r.imageData.mime && r.imageData.data) {
              r.image = `data:${r.imageData.mime};base64,${r.imageData.data}`
            }
          }
        }
        const nextMixes = Array.isArray(parsed?.mixes) ? parsed.mixes : []
        saveRecipes(nextRecipes)
        saveMixes(nextMixes)
        setRecipes(nextRecipes)
        setSelected({})
        alert('Content imported successfully.')
      } catch (e) {
        console.error('Import failed', e)
        alert('Failed to import content. Ensure the file is a valid export.')
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen">
      <Header
        isAdmin={isAdmin}
        isDark={theme === 'dark'}
        onToggleTheme={toggleTheme}
        onCreate={() => { if (isAdmin) { setEditingRecipe(null); setAdding(true) } else { alert('Admin only action') } }}
        onGotoList={() => setShowList(true)}
        onExportAll={isAdmin ? exportAll : undefined}
        onImportAll={isAdmin ? importAll : undefined}
      />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-slate-600 glass">
            <p className="text-lg">No recipes yet.</p>
            <p>Add your first recipe to get started!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {recipes.map(r => (
              <RecipeCard key={r.id} recipe={r} isAdmin={isAdmin}
                allRecipes={recipes}
                onOpenRecipe={setViewRecipe}
                selected={!!selected[r.id]}
                onToggle={() => toggleSelect(r.id)}
                onOpen={() => setViewRecipe(r)}
                onEdit={() => { if (isAdmin) { setEditingRecipe(r); setAdding(true) } else { alert('Admin only action') } }}
                onDelete={() => deleteRecipe(r.id)}
              />
            ))}
          </div>
        )}
      </main>

      {adding && <RecipeForm initialRecipe={editingRecipe} onSave={saveRecipe} onClose={() => { setAdding(false); setEditingRecipe(null) }} />}
      {viewRecipe && (
        <RecipeView recipe={viewRecipe} allRecipes={recipes} onOpenRecipe={setViewRecipe} onClose={() => setViewRecipe(null)} />
      )}
      {showList && <PurchaseList items={purchaseItems} onClose={() => setShowList(false)} onExport={exportTxt} />}
      {(!isStandalone && deferredPrompt && Date.now() > dismissedUntil) && (
        <div className="fixed inset-x-0 bottom-3 px-3 sm:px-4 z-50">
          <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-soft p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={(import.meta?.env?.BASE_URL || '/') + 'icons/icon-192.png'} alt="" className="w-8 h-8 rounded" />
              <div>
                <p className="text-sm font-medium text-slate-900">Install Easy Cook</p>
                <p className="text-xs text-slate-600">Get quick access and offline support.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => snoozeInstallPrompt(7)} className="px-3 py-2 text-slate-600 hover:text-slate-800">Not now</button>
              <button onClick={promptInstall} className="px-3 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 shadow-soft">Install</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
