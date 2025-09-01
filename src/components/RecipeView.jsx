import React, { useMemo, useState } from 'react'
import { loadMixes } from '../lib/storage'
import { chipColorClasses } from '../lib/colors'

export default function RecipeView({ recipe, onClose }) {
  if (!recipe) return null
  const mixNames = useMemo(() => {
    try {
      const mixes = loadMixes() || []
      return mixes
        .filter(m => Array.isArray(m.items) && m.items.every(i => recipe.ingredients.includes(i)))
        .map(m => m.name)
    } catch {
      return []
    }
  }, [recipe.ingredients])
  const [openMix, setOpenMix] = useState(null)
  const openMixItems = useMemo(() => {
    if (!openMix) return []
    try {
      const mixes = loadMixes() || []
      const m = mixes.find(x => x.name === openMix)
      return m?.items || []
    } catch {
      return []
    }
  }, [openMix])
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-soft border border-slate-200 overflow-hidden" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">{recipe.title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title} className="w-full h-80 object-cover" />
        )}
        <div className="p-4 grid gap-4">
          {mixNames.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Mixes</h4>
              <div className="flex flex-wrap gap-2">
                {mixNames.map((name, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setOpenMix(cur => cur === name ? null : name)}
                    className={`text-xs px-2 py-1 rounded-full border ${chipColorClasses(name)} focus:outline-none focus:ring-2 focus:ring-slate-300`}
                    title="View items in this mix"
                    aria-expanded={openMix === name}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {openMix && openMixItems.length > 0 && (
                <div className="mt-2 ml-1">
                  <div className="text-xs text-slate-600 mb-1">{openMix} items:</div>
                  <div className="flex flex-wrap gap-2">
                    {openMixItems.map((it, i) => (
                      <span key={i} className={`text-[11px] px-2 py-0.5 rounded-full border ${chipColorClasses(it)}`}>{it}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {recipe.description && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
              <p className="text-slate-700 leading-relaxed">{recipe.description}</p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Ingredients</h4>
            {recipe.ingredients?.length ? (
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.map((ing, idx) => (
                  <span key={idx} className={`text-xs px-2 py-1 rounded-full border ${chipColorClasses(ing)}`}>
                    {ing}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">No ingredients listed.</p>
            )}
          </div>
          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
