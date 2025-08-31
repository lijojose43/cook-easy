
import React, { useRef, useState } from 'react'
import { PREFILLED_INGREDIENTS } from '../lib/ingredients'

export default function RecipeForm({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [customIng, setCustomIng] = useState('')
  const [image, setImage] = useState(null)
  const fileRef = useRef()

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
    onSave({ id: crypto.randomUUID(), title, description, ingredients, image })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-soft border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Recipe</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={submit} className="p-4 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)}
                   className="px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                   placeholder="e.g., Paneer Butter Masala" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)}
                      rows={3}
                      className="px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Short cooking steps or notes"/>
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
                <span key={ing} className="text-xs px-2 py-1 rounded-full bg-sky-50 border border-sky-200">
                  {ing}
                  <button type="button" onClick={()=>removeIngredient(ing)} className="ml-1">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input list="ing-list" placeholder="Type or pick…"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                onChange={(e)=>setCustomIng(e.target.value)} value={customIng} />
              <datalist id="ing-list">
                {PREFILLED_INGREDIENTS.map(i => <option key={i} value={i} />)}
              </datalist>
              <button type="button" onClick={()=>{ addIngredient(customIng.trim()); setCustomIng(''); }}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-black">Add</button>
            </div>
            <div className="max-h-36 overflow-auto border rounded-xl p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PREFILLED_INGREDIENTS.map(i => (
                <button type="button" key={i}
                  onClick={()=>addIngredient(i)}
                  className="text-left text-sm px-2 py-1 rounded-lg border hover:bg-slate-100">
                  + {i}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
            <button className="px-4 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
