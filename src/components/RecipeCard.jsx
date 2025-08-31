
import React from 'react'

export default function RecipeCard({ recipe, selected, onToggle, onDelete }) {
  return (
    <div className="rounded-2xl bg-white shadow-soft overflow-hidden border border-slate-200">
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{recipe.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">{recipe.description}</p>
          </div>
          <input type="checkbox" checked={selected} onChange={onToggle} className="w-5 h-5" />
        </div>
        <div className="mt-3">
          <h4 className="text-sm font-medium text-slate-700">Ingredients</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {recipe.ingredients.map((ing, idx) => (
              <span key={idx} className="text-xs px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                {ing}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onDelete} className="text-sm text-red-600 hover:underline">Delete</button>
        </div>
      </div>
    </div>
  )
}
