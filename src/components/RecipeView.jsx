import React from 'react'

export default function RecipeView({ recipe, onClose }) {
  if (!recipe) return null
  return (
    <div className="fixed inset-0 bg-black/10 grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl glass shadow-soft border border-slate-200 overflow-hidden" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">{recipe.title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title} className="w-full h-80 object-cover" />
        )}
        <div className="p-4 grid gap-4">
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
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
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
