
import React from 'react'

export default function PurchaseList({ items, onClose, onExport }) {
  // items: [{ name, qty, unit }]
  const sorted = Array.isArray(items)
    ? [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    : []

  const shareToWhatsApp = () => {
    try {
      const title = 'Purchase List'
      const lines = sorted.map(it => {
        const qtyStr = (it.qty && it.qty !== 1) ? `${it.qty} ` : ''
        const unitStr = it.unit ? `${it.unit} ` : ''
        return `• ${qtyStr}${unitStr}${it.name}`.trim()
      })
      const msg = [title, '', ...lines].join('\n')
      const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50" onClick={onClose}>
      <div className="w-full max-w-xl max-h-[80vh] rounded-2xl bg-white shadow-soft border border-slate-200 overflow-hidden flex flex-col" onClick={(e)=>e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Purchase List</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {sorted.length === 0 ? (
            <p className="text-slate-600">No items selected yet.</p>
          ) : (
            <ul className="grid gap-2 list-disc pl-5">
              {sorted.map((it, idx) => (
                <li key={idx}>
                  <span className="font-medium">{it.name}</span>
                  {it.qty && it.qty !== 1 && <span> — {it.qty}{it.unit ? ` ${it.unit}` : ''}</span>}
                  {!it.qty || it.qty === 1 ? (it.unit ? <span> — {it.unit}</span> : null) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={shareToWhatsApp} className="px-3 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2" title="Share to WhatsApp">
            {/* WhatsApp icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.207-.242-.58-.487-.502-.67-.51l-.571-.01c-.198 0-.521.074-.794.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.41.248-.694.248-1.289.173-1.41-.074-.124-.272-.198-.57-.347z"/></svg>
            <span>Share</span>
          </button>
          <button onClick={onExport} className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">Export as .txt</button>
          <button onClick={onClose} className="px-3 py-2 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50">Close</button>
        </div>
      </div>
    </div>
  )
}
