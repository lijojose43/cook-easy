import React, { useMemo, useState } from 'react'
import { loadMixes } from '../lib/storage'
import { chipColorClasses } from '../lib/colors'

export default function RecipeView({ recipe, allRecipes = [], onOpenRecipe, onClose }) {
  if (!recipe) return null
  // minimal markdown renderer (safe): escapes HTML, supports ###, bold, italic, code, lists
  const renderMarkdown = (input) => {
    if (!input) return ''
    // escape HTML first
    const esc = (s) => s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
    const bold = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    const italic = (s) => s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    const code = (s) => s.replace(/`([^`]+)`/g, '<code class="px-1 rounded bg-slate-100 text-slate-800">$1<\/code>')

    const toInline = (s) => code(italic(bold(esc(s))))

    const lines = input.split(/\r?\n/)
    const out = []
    let listMode = null // 'ul' | 'ol'
    let listItems = []
    const flushList = () => {
      if (!listMode || listItems.length === 0) return
      const itemsHtml = listItems.map(li => `<li>${toInline(li)}</li>`).join('')
      out.push(listMode === 'ul' ? `<ul class="list-disc pl-6 my-2">${itemsHtml}</ul>` : `<ol class="list-decimal pl-6 my-2">${itemsHtml}</ol>`)
      listMode = null
      listItems = []
    }

    for (const raw of lines) {
      const line = raw.trimEnd()
      if (/^\s*$/.test(line)) { flushList(); continue }
      const ulMatch = /^-\s+(.*)$/.exec(line)
      const olMatch = /^(\d+)\.\s+(.*)$/.exec(line)
      const h3Match = /^###\s+(.*)$/.exec(line)
      if (ulMatch) {
        if (listMode && listMode !== 'ul') flushList()
        listMode = 'ul'
        listItems.push(ulMatch[1])
        continue
      }
      if (olMatch) {
        if (listMode && listMode !== 'ol') flushList()
        listMode = 'ol'
        listItems.push(olMatch[2])
        continue
      }
      flushList()
      if (h3Match) {
        out.push(`<h3 class=\"text-base font-semibold mt-3\">${toInline(h3Match[1])}</h3>`) 
      } else {
        out.push(`<p class=\"my-2\">${toInline(line)}</p>`)
      }
    }
    flushList()
    return out.join('')
  }
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
      .slice(0, 12) // limit
  }, [openMix, openMixItems, allRecipes, recipe.id])
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white shadow-soft border border-slate-200 overflow-hidden flex flex-col" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">{recipe.title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title} className="w-full h-80 object-cover" />
        )}
        <div className="p-4 grid gap-4 overflow-y-auto flex-1">
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
                  {relatedRecipes.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-slate-600 mb-1">Related recipes using these items:</div>
                      <div className="flex flex-wrap gap-2">
                        {relatedRecipes.map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => onOpenRecipe && onOpenRecipe(r)}
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
          {recipe.description && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(recipe.description) }} />
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
