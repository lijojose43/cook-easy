
import React from 'react'

export default function RecipeCard({ recipe, selected, onToggle, onOpen, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl glass shadow-soft overflow-hidden border border-slate-200">
      {recipe.image && (
        <button type="button" onClick={onOpen} className="block w-full group focus:outline-none">
          <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover group-hover:opacity-95 transition" />
        </button>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onOpen} className="text-left flex-1 focus:outline-none">
            <h3 className="text-lg font-semibold text-slate-900 hover:underline">{recipe.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">{recipe.description}</p>
          </button>
          <input type="checkbox" checked={selected} onChange={onToggle} className="w-5 h-5" />
        </div>
        <div className="mt-3">
          <h4 className="text-sm font-medium text-slate-700">Ingredients</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {recipe.ingredients.map((ing, idx) => (
              <span key={idx} className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                {ing}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
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
