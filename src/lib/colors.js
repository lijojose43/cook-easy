// Utility to assign consistent Tailwind chip colors for a given name
// Uses a simple hash to pick from a palette

const PALETTE = [
  { bg: 'bg-rose-700', border: 'border-rose-800', text: 'text-white' },
  { bg: 'bg-orange-700', border: 'border-orange-800', text: 'text-white' },
  { bg: 'bg-amber-700', border: 'border-amber-800', text: 'text-white' },
  { bg: 'bg-lime-700', border: 'border-lime-800', text: 'text-white' },
  { bg: 'bg-emerald-700', border: 'border-emerald-800', text: 'text-white' },
  { bg: 'bg-teal-700', border: 'border-teal-800', text: 'text-white' },
  { bg: 'bg-sky-700', border: 'border-sky-800', text: 'text-white' },
  { bg: 'bg-indigo-700', border: 'border-indigo-800', text: 'text-white' },
  { bg: 'bg-violet-700', border: 'border-violet-800', text: 'text-white' },
  { bg: 'bg-fuchsia-700', border: 'border-fuchsia-800', text: 'text-white' },
]

function hashString(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function chipColorClasses(key) {
  const idx = hashString(key) % PALETTE.length
  const { bg, border, text } = PALETTE[idx]
  return `${bg} ${border} ${text}`
}
