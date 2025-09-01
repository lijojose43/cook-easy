
import React from 'react'

export default function PurchaseList({ items, onClose, onExport }) {
  const sorted = Array.from(new Set(items)).sort((a,b) => a.localeCompare(b))

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-soft border border-slate-200" onClick={(e)=>e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Purchase List</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <div className="p-4">
          {sorted.length === 0 ? (
            <p className="text-slate-600">No items selected yet.</p>
          ) : (
            <ul className="grid gap-2 list-disc pl-5">
              {sorted.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onExport} className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">Export as .txt</button>
          <button onClick={onClose} className="px-3 py-2 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50">Close</button>
        </div>
      </div>
    </div>
  )
}
