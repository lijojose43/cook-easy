
import React, { useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import RecipeCard from './components/RecipeCard.jsx'
import RecipeForm from './components/RecipeForm.jsx'
import PurchaseList from './components/PurchaseList.jsx'
import RecipeView from './components/RecipeView.jsx'
import { loadRecipes, saveRecipes } from './lib/storage.js'

export default function App() {
  const [recipes, setRecipes] = useState(() => loadRecipes())
  const [adding, setAdding] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [showList, setShowList] = useState(false)
  const [selected, setSelected] = useState({})
  const [viewRecipe, setViewRecipe] = useState(null)

  const toggleSelect = (id) => {
    setSelected(s => ({ ...s, [id]: !s[id] }))
  }

  const saveRecipe = (r) => {
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

  return (
    <div className="min-h-screen">
      <Header onCreate={() => { setEditingRecipe(null); setAdding(true) }} onGotoList={() => setShowList(true)} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-slate-600 glass">
            <p className="text-lg">No recipes yet.</p>
            <p>Add your first recipe to get started!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map(r => (
              <RecipeCard key={r.id} recipe={r}
                selected={!!selected[r.id]}
                onToggle={() => toggleSelect(r.id)}
                onOpen={() => setViewRecipe(r)}
                onEdit={() => { setEditingRecipe(r); setAdding(true) }}
                onDelete={() => deleteRecipe(r.id)}
              />
            ))}
          </div>
        )}
      </main>

      {adding && <RecipeForm initialRecipe={editingRecipe} onSave={saveRecipe} onClose={() => { setAdding(false); setEditingRecipe(null) }} />}
      {viewRecipe && <RecipeView recipe={viewRecipe} onClose={() => setViewRecipe(null)} />}
      {showList && <PurchaseList items={purchaseItems} onClose={() => setShowList(false)} onExport={exportTxt} />}
    </div>
  )
}
