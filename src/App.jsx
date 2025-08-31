
import React, { useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import RecipeCard from './components/RecipeCard.jsx'
import RecipeForm from './components/RecipeForm.jsx'
import PurchaseList from './components/PurchaseList.jsx'
import { loadRecipes, saveRecipes } from './lib/storage.js'

export default function App() {
  const [recipes, setRecipes] = useState(() => loadRecipes())
  const [adding, setAdding] = useState(false)
  const [showList, setShowList] = useState(false)
  const [selected, setSelected] = useState({})

  const toggleSelect = (id) => {
    setSelected(s => ({ ...s, [id]: !s[id] }))
  }

  const addRecipe = (r) => {
    const next = [r, ...recipes]
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
      <Header onCreate={() => setAdding(true)} onGotoList={() => setShowList(true)} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-slate-600 bg-white">
            <p className="text-lg">No recipes yet.</p>
            <p>Add your first recipe to get started!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map(r => (
              <RecipeCard key={r.id} recipe={r}
                selected={!!selected[r.id]}
                onToggle={() => toggleSelect(r.id)}
                onDelete={() => deleteRecipe(r.id)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowList(true)}
        className="fixed bottom-6 right-6 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-soft px-5 py-3">
        Generate Purchase List
      </button>

      {adding && <RecipeForm onSave={addRecipe} onClose={() => setAdding(false)} />}
      {showList && <PurchaseList items={purchaseItems} onClose={() => setShowList(false)} onExport={exportTxt} />}
    </div>
  )
}
