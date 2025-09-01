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
            className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-soft flex items-center gap-2"
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
            <span className="text-sm font-medium">Recipe</span>
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
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
              <path d="M3 4h2l2.4 10.2A2 2 0 0 0 9.35 16H17a2 2 0 0 0 1.94-1.52L20.5 8H6.1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
