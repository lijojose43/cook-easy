
import React from 'react'

export default function Header({ onCreate, onGotoList }) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-sky-500 grid place-items-center shadow-soft">
            <span className="text-white font-bold">CB</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">CookBook Planner</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onCreate} className="px-3 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 shadow-soft">
            Add Recipe
          </button>
          <button onClick={onGotoList} className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100">
            Purchase List
          </button>
        </div>
      </div>
    </header>
  )
}
