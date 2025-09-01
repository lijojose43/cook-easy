
import React, { useEffect, useRef, useState } from 'react'
import { chipColorClasses } from '../lib/colors'
import { PREFILLED_INGREDIENTS } from '../lib/ingredients'
import { loadMixes, saveMixes } from '../lib/storage'

export default function RecipeForm({ initialRecipe, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [customIng, setCustomIng] = useState('')
  const [image, setImage] = useState(null)
  const [recipeId, setRecipeId] = useState(null)

  // mixes state
  const [mixes, setMixes] = useState(() => loadMixes())
  const [mixName, setMixName] = useState('')
  const [mixItems, setMixItems] = useState('') // comma separated

  const fileRef = useRef()
  const descRef = useRef()

  // hydrate when editing
  useEffect(() => {
    if (initialRecipe) {
      setRecipeId(initialRecipe.id)
      setTitle(initialRecipe.title || '')
      setDescription(initialRecipe.description || '')
      setIngredients(initialRecipe.ingredients || [])
      setImage(initialRecipe.image || null)
    }
  }, [initialRecipe])

  const addIngredient = (ing) => {
    if (!ing) return;
    if (!ingredients.includes(ing)) setIngredients([...ingredients, ing])
  }

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return;
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return alert('Title is required')
    const id = recipeId || crypto.randomUUID()
    onSave({ id, title, description, ingredients, image })
    onClose()
  }

  // simple formatter to insert markdown-like syntax
  const applyFormat = (prefix = '', suffix = '') => {
    const ta = descRef.current
    if (!ta) return
    const start = ta.selectionStart ?? 0
    const end = ta.selectionEnd ?? 0
    const before = description.slice(0, start)
    const selected = description.slice(start, end)
    const after = description.slice(end)
    const next = `${before}${prefix}${selected || ''}${suffix}${after}`
    setDescription(next)
    // restore selection around inserted text
    const cursor = start + prefix.length + (selected ? selected.length : 0)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(cursor, cursor)
    })
  }

  const parseItems = (text) =>
    text
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

  const createMix = () => {
    const name = mixName.trim()
    const items = parseItems(mixItems)
    if (!name) return alert('Mix name is required')
    if (items.length === 0) return alert('Add at least one item to the mix')
    if (mixes.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      return alert('A mix with this name already exists')
    }
    const next = [...mixes, { id: crypto.randomUUID(), name, items }]
    setMixes(next)
    saveMixes(next)
    setMixName('')
    setMixItems('')
  }

  const removeMix = (id) => {
    const next = mixes.filter(m => m.id !== id)
    setMixes(next)
    saveMixes(next)
  }

  const addMixToRecipe = (mix) => {
    const toAdd = mix.items.filter(i => !ingredients.includes(i))
    if (toAdd.length === 0) return
    setIngredients([...ingredients, ...toAdd])
  }

  // edit mixes inline
  const [editMixId, setEditMixId] = useState(null)
  const [editMixName, setEditMixName] = useState('')
  const [editMixItems, setEditMixItems] = useState('')

  const startEditMix = (mix) => {
    setEditMixId(mix.id)
    setEditMixName(mix.name)
    setEditMixItems(mix.items.join(', '))
  }

  const cancelEditMix = () => {
    setEditMixId(null)
    setEditMixName('')
    setEditMixItems('')
  }

  const saveEditMix = () => {
    const name = editMixName.trim()
    const items = parseItems(editMixItems)
    if (!name) return alert('Mix name is required')
    if (items.length === 0) return alert('Add at least one item to the mix')
    if (mixes.some(m => m.id !== editMixId && m.name.toLowerCase() === name.toLowerCase())) {
      return alert('A mix with this name already exists')
    }
    const next = mixes.map(m => m.id === editMixId ? { ...m, name, items } : m)
    setMixes(next)
    saveMixes(next)
    cancelEditMix()
  }

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white shadow-soft border border-slate-200 overflow-hidden flex flex-col" onClick={(e)=>e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Recipe</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={submit} className="p-4 grid gap-4 overflow-y-auto flex-1">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)}
                   className="px-3 py-2 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                   placeholder="e.g., Paneer Butter Masala" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => applyFormat('**', '**')} className="px-2 py-1 text-xs rounded-lg border hover:bg-slate-50" title="Bold">B</button>
              <button type="button" onClick={() => applyFormat('*', '*')} className="px-2 py-1 text-xs rounded-lg border hover:bg-slate-50" title="Italic">I</button>
              <button type="button" onClick={() => applyFormat('### ', '')} className="px-2 py-1 text-xs rounded-lg border hover:bg-slate-50" title="Heading">H3</button>
              <button type="button" onClick={() => applyFormat('- ', '\n')} className="px-2 py-1 text-xs rounded-lg border hover:bg-slate-50" title="Bullet">•</button>
              <button type="button" onClick={() => applyFormat('1. ', '\n')} className="px-2 py-1 text-xs rounded-lg border hover:bg-slate-50" title="Numbered">1.</button>
              <button type="button" onClick={() => applyFormat('`', '`')} className="px-2 py-1 text-xs rounded-lg border hover:bg-slate-50" title="Inline code">{`</>`}</button>
            </div>
            <textarea
              ref={descRef}
              value={description}
              onChange={e=>setDescription(e.target.value)}
              rows={10}
              className="px-3 py-2 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y min-h-48 leading-relaxed whitespace-pre-wrap"
              placeholder="Add detailed steps, notes, tips... Use toolbar for simple formatting (bold, italic, lists)."
            />
            <div className="text-xs text-slate-500">Tip: Use Shift+Enter for line breaks. Supports simple markdown-like formatting via buttons.</div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Image</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} />
            {image && <img src={image} alt="preview" className="mt-2 w-full h-48 object-cover rounded-xl border" />}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Ingredients</label>
            <div className="flex flex-wrap gap-2">
              {ingredients.map(ing => (
                <span key={ing} className={`text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1 ${chipColorClasses(ing)}`}>
                  {ing}
                  <button type="button" onClick={()=>removeIngredient(ing)} className="ml-1 text-white/90 hover:text-white">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input list="ing-list" placeholder="Type or pick…"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e)=>setCustomIng(e.target.value)} value={customIng} />
              <datalist id="ing-list">
                {PREFILLED_INGREDIENTS.map(i => <option key={i} value={i} />)}
              </datalist>
              <button type="button" onClick={()=>{ addIngredient(customIng.trim()); setCustomIng(''); }}
                      className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">Add</button>
            </div>
            <div className="max-h-36 overflow-auto border rounded-xl p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PREFILLED_INGREDIENTS.map(i => (
                <button type="button" key={i}
                  onClick={()=>addIngredient(i)}
                  className="text-left text-sm px-2 py-1 rounded-lg border border-orange-200 hover:bg-orange-50 text-orange-800">
                  + {i}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredient Mixes */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Ingredient Mixes</label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                value={mixName}
                onChange={e=>setMixName(e.target.value)}
                placeholder="Mix name (e.g., Tadka)"
                className="sm:w-48 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                value={mixItems}
                onChange={e=>setMixItems(e.target.value)}
                placeholder="Items, comma separated (e.g., Oil, Mustard Seeds, Curry Leaves)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="button" onClick={createMix}
                className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">Save Mix</button>
            </div>
            {mixes.length > 0 && (
              <div className="max-h-60 overflow-auto border rounded-xl divide-y">
                {mixes.map(mix => (
                  <div key={mix.id} className="p-2 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {editMixId === mix.id ? (
                        <div className="grid gap-2 sm:grid-cols-3">
                          <input
                            value={editMixName}
                            onChange={e=>setEditMixName(e.target.value)}
                            className="px-2 py-1 rounded-lg border"
                          />
                          <input
                            value={editMixItems}
                            onChange={e=>setEditMixItems(e.target.value)}
                            className="sm:col-span-2 px-2 py-1 rounded-lg border"
                          />
                          <div className="sm:col-span-3 flex gap-2">
                            <button type="button" onClick={saveEditMix} className="px-3 py-1 rounded-lg bg-sky-500 text-white">Save</button>
                            <button type="button" onClick={cancelEditMix} className="px-3 py-1 rounded-lg border">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-slate-800">{mix.name}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mix.items.map((it, idx) => {
                              const exists = ingredients.includes(it)
                              return (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => !exists && addIngredient(it)}
                                  disabled={exists}
                                  className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                                    exists
                                      ? 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed'
                                      : 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100'
                                  }`}
                                  title={exists ? 'Already added' : 'Add to ingredients'}
                                >
                                  {it}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editMixId === mix.id ? null : (
                        <>
                          <button
                            type="button"
                            onClick={()=>addMixToRecipe(mix)}
                            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100"
                            aria-label="Add mix to recipe"
                            title="Add to Recipe"
                          >
                            {/* plus icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M12 4.5a.75.75 0 01.75.75V11h5.75a.75.75 0 010 1.5H12.75v5.75a.75.75 0 01-1.5 0V12.5H5.5a.75.75 0 010-1.5h5.75V5.25A.75.75 0 0112 4.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={()=>startEditMix(mix)}
                            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100"
                            aria-label="Edit mix"
                            title="Edit"
                          >
                            {/* pencil icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M16.862 3.487a1.5 1.5 0 0 1 2.122 0l1.53 1.53a1.5 1.5 0 0 1 0 2.122l-9.72 9.72a1.5 1.5 0 0 1-.67.39l-4.08 1.09a.75.75 0 0 1-.92-.92l1.09-4.08a1.5 1.5 0 0 1 .39-.67l9.72-9.72z"/>
                              <path d="M14.74 5.61l3.65 3.65"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={()=>removeMix(mix.id)}
                            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                            aria-label="Delete mix"
                            title="Delete"
                          >
                            {/* trash icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V5h4.25a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1 0-1.5H9V3.75z"/>
                              <path d="M6.75 7.25h10.5l-.73 11.04a2.25 2.25 0 0 1-2.24 2.11H9.72a2.25 2.25 0 0 1-2.24-2.11L6.75 7.25z"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50">Cancel</button>
            <button className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
