import React, { useMemo, useState } from 'react'
import { loadMixes } from '../lib/storage'
import { chipColorClasses } from '../lib/colors'

export default function RecipeCard({ recipe, isAdmin, selected, onToggle, onOpen, onEdit, onDelete, allRecipes = [], onOpenRecipe }) {
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
  const relatedRecipes = useMemo(() => {
    if (!openMix) return []
    const items = new Set(openMixItems)
    if (items.size === 0) return []
    return (allRecipes || [])
      .filter(r => r.id !== recipe.id && Array.isArray(r.ingredients) && r.ingredients.some(i => items.has(i)))
      .slice(0, 8)
  }, [openMix, openMixItems, allRecipes, recipe.id])
  return (
    <div className="rounded-2xl glass shadow-soft overflow-hidden border border-slate-200 h-full flex flex-col">
      {recipe.image && (
        <div className="relative">
          <button type="button" onClick={onOpen} className="block w-full group focus:outline-none">
            <img src={recipe.image} alt={recipe.title} className="w-full h-40 sm:h-48 object-cover group-hover:opacity-95 transition" />
          </button>
          {recipe.videoUrl && (
            <>
              <div className="absolute top-1 right-1 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-bl from-black/60 via-black/30 to-transparent blur-md opacity-90 pointer-events-none z-10" />
              <a
                href={recipe.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e)=>e.stopPropagation()}
                className="absolute top-2 right-2 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white shadow-soft hover:bg-red-700 ring-2 ring-white/70 z-20"
                title="Watch on YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.2 31.2 0 000 12a31.2 31.2 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.2 31.2 0 0024 12a31.2 31.2 0 00-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                </svg>
              </a>
            </>
          )}
        </div>
      )}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onOpen} className="text-left flex-1 focus:outline-none">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 hover:underline">{recipe.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-3 sm:line-clamp-2 mt-1">{recipe.description}</p>
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
        <div className="mt-2 sm:mt-3">
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
                  {relatedRecipes.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-slate-600 mb-1">Related recipes using these items:</div>
                      <div className="flex flex-wrap gap-2">
                        {relatedRecipes.map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => (onOpenRecipe ? onOpenRecipe(r) : onOpen())}
                            className="text-xs px-2 py-1 rounded-full border border-sky-200 text-sky-700 hover:bg-sky-50"
                            title={`Open ${r.title}`}
                          >
                            {r.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
        {isAdmin && (
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
        )}
      </div>
    </div>
  )
}
