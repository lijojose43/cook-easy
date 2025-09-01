import React from "react";

export default function Header({ onCreate, onGotoList }) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-orange-500 grid place-items-center shadow-soft">
            <span className="text-white font-bold">EC</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Easy Cook</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCreate}
            className="p-2 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-soft"
            aria-label="Add recipe"
            title="Add recipe"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M12 4.5a.75.75 0 01.75.75V11h5.75a.75.75 0 010 1.5H12.75v5.75a.75.75 0 01-1.5 0V12.5H5.5a.75.75 0 010-1.5h5.75V5.25A.75.75 0 0112 4.5z" />
            </svg>
          </button>
          <button
            onClick={onGotoList}
            className="p-2 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50"
            aria-label="Open purchase list"
            title="Purchase list"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M2.25 3a.75.75 0 000 1.5h1.22l.528 2.112a2.25 2.25 0 002.182 1.713h10.59a2.25 2.25 0 002.182-1.713l.93-3.722A.75.75 0 0019.75 2.25H6.5a.75.75 0 000 1.5h12.3l-.78 3.122a.75.75 0 01-.727.571H5.7a.75.75 0 01-.727-.571L4.18 4.5H2.25z"/>
              <path d="M6.75 9.75a.75.75 0 000 1.5h.9l-.9 4.5A2.25 2.25 0 008.962 18h7.576a2.25 2.25 0 002.211-1.75l.9-4.5h.301a.75.75 0 000-1.5H6.75zm3.5 7.5a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zm7 0a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
