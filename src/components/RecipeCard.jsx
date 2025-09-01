import React, { useMemo, useState } from 'react'
import { loadMixes } from '../lib/storage'
import { chipColorClasses } from '../lib/colors'

export default function RecipeCard({ recipe, selected, onToggle, onOpen, onEdit, onDelete }) {
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
    <div className="rounded-2xl glass shadow-soft overflow-hidden border border-slate-200 h-full flex flex-col">
      {recipe.image && (
        <button type="button" onClick={onOpen} className="block w-full group focus:outline-none">
          <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover group-hover:opacity-95 transition" />
        </button>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onOpen} className="text-left flex-1 focus:outline-none">
            <h3 className="text-lg font-semibold text-slate-900 hover:underline">{recipe.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">{recipe.description}</p>
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            aria-label={selected ? 'Deselect recipe' : 'Select recipe'}
            className={`shrink-0 w-8 h-8 rounded-xl grid place-items-center border transition
              ${selected
                ? 'bg-green-600 border-green-600 text-white shadow-soft'
                : 'bg-white/70 border-slate-300 text-slate-600 hover:bg-slate-50'}
            `}
            title={selected ? 'Selected' : 'Select'}
          >
            {selected ? (
              // check icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M9 16.17l-3.88-3.88a1 1 0 10-1.41 1.41l4.59 4.59a1 1 0 001.41 0l10-10a1 1 0 10-1.41-1.41L9 16.17z" />
              </svg>
            ) : (
              // plus icon (subtle)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 4.5a.75.75 0 01.75.75V11h5.75a.75.75 0 010 1.5H12.75v5.75a.75.75 0 01-1.5 0V12.5H5.5a.75.75 0 010-1.5h5.75V5.25A.75.75 0 0112 4.5z" />
              </svg>
            )}
          </button>
        </div>
        <div className="mt-3">
          {mixNames.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-slate-700">Mixes</h4>
              <div className="flex flex-wrap gap-2 mt-2">
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
          <h4 className="text-sm font-medium text-slate-700">Ingredients</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {recipe.ingredients.map((ing, idx) => (
              <span key={idx} className={`text-xs px-2 py-1 rounded-full border ${chipColorClasses(ing)}`}>
                {ing}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-auto pt-4 flex justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50"
            aria-label="Edit recipe"
            title="Edit"
          >
            {/* pencil icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M16.862 3.487a1.5 1.5 0 0 1 2.122 0l1.53 1.53a1.5 1.5 0 0 1 0 2.122l-9.72 9.72a1.5 1.5 0 0 1-.67.39l-4.08 1.09a.75.75 0 0 1-.92-.92l1.09-4.08a1.5 1.5 0 0 1 .39-.67l9.72-9.72z"/>
              <path d="M14.74 5.61l3.65 3.65"/>
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            aria-label="Delete recipe"
            title="Delete"
          >
            {/* trash icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V5h4.25a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1 0-1.5H9V3.75z"/>
              <path d="M6.75 7.25h10.5l-.73 11.04a2.25 2.25 0 0 1-2.24 2.11H9.72a2.25 2.25 0 0 1-2.24-2.11L6.75 7.25z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
