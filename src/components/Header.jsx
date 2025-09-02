import React from "react";

export default function Header({ isAdmin, onCreate, onGotoList, onExportAll, onImportAll }) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img
            src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
            alt="Easy Cook"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl shadow-soft object-cover"
          />
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800">Easy Cook</h1>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {isAdmin && (
            <>
              <button
                onClick={onCreate}
                className="px-2.5 sm:px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-soft flex items-center gap-2"
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
                <span className="hidden sm:inline text-sm font-medium">Recipe</span>
              </button>
              <button
                onClick={onExportAll}
                className="px-2.5 sm:px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-soft flex items-center gap-2"
                aria-label="Export all content"
                title="Export content (recipes + mixes)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5" />
                  <path d="M7.5 10.5L12 6l4.5 4.5M12 6v12" />
                </svg>
                <span className="hidden sm:inline text-sm">Export</span>
              </button>
              <button
                onClick={onImportAll}
                className="px-2.5 sm:px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-soft flex items-center gap-2"
                aria-label="Import content"
                title="Import content (recipes + mixes)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M3 7.5V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25V7.5" />
                  <path d="M16.5 13.5 12 18l-4.5-4.5M12 18V6" />
                </svg>
                <span className="hidden sm:inline text-sm">Import</span>
              </button>
            </>
          )}
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
