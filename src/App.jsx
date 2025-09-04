import React, { useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import RecipeCard from "./components/RecipeCard.jsx";
import RecipeForm from "./components/RecipeForm.jsx";
import PurchaseList from "./components/PurchaseList.jsx";
import RecipeView from "./components/RecipeView.jsx";
import {
  loadRecipes,
  saveRecipes,
  loadMixes,
  saveMixes,
} from "./lib/storage.js";

export default function App() {
  const [recipes, setRecipes] = useState(() => loadRecipes());
  const [adding, setAdding] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showList, setShowList] = useState(false);
  const [selected, setSelected] = useState({});
  const [viewRecipe, setViewRecipe] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  // theme: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    try {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [dismissedUntil, setDismissedUntil] = useState(() => {
    try {
      return Number(localStorage.getItem("pwa_install_dismissed_until")) || 0;
    } catch {
      return 0;
    }
  });

  // Admin mode toggle via secret query param (?admin=KEY). Default key 'chef' or VITE_ADMIN_KEY
  const isAdmin = useMemo(() => {
    try {
      const key = import.meta?.env?.VITE_ADMIN_KEY || "chef";
      const qp = new URLSearchParams(window.location.search);
      return qp.get("admin") === key;
    } catch {
      return false;
    }
  }, []);

  // Apply theme to <html> and persist
  React.useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const snoozeInstallPrompt = (days = 7) => {
    try {
      const until = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem("pwa_install_dismissed_until", String(until));
      setDismissedUntil(until);
      setDeferredPrompt(null);
    } catch {
      setDeferredPrompt(null);
    }
  };

  // PWA install prompt handling
  React.useEffect(() => {
    const checkStandalone = () => {
      const mql =
        window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches;
      const ios = window.navigator.standalone === true;
      setIsStandalone(Boolean(mql || ios));
    };
    checkStandalone();
    const onBeforeInstall = (e) => {
      // Prevent auto mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      try {
        localStorage.removeItem("pwa_install_dismissed_until");
      } catch {}
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("visibilitychange", checkStandalone);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("visibilitychange", checkStandalone);
    };
  }, []);

  const promptInstall = async () => {
    try {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome !== "dismissed") {
        setDeferredPrompt(null);
      }
    } catch {
      // ignore
    }
  };

  // On first load, if no local data, try loading static seed from public/recipe.json
  React.useEffect(() => {
    const hasLocalRecipes = Array.isArray(recipes) && recipes.length > 0;
    let hasLocalMixes = false;
    try {
      hasLocalMixes = Array.isArray(loadMixes()) && loadMixes().length > 0;
    } catch {
      hasLocalMixes = false;
    }
    if (hasLocalRecipes || hasLocalMixes) return;
    const candidates = [];
    try {
      const base = (import.meta?.env?.BASE_URL || "/cook-easy/")
        .replace(/\/\/+$/, "/");
      candidates.push(`${base}recipe.json`);
    } catch {}
    // Try relative to current page location (helps in dev or if hosted under a subpath)
    try {
      const fromHere = new URL('recipe.json', window.location.href).toString();
      candidates.unshift(fromHere);
    } catch {}
    // Fallback absolute paths
    candidates.push("/cook-easy/recipe.json", "/recipe.json");
    (async () => {
      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          // Support either {recipes, mixes} object or a plain array of recipes
          const seedRecipes = Array.isArray(data)
            ? data
            : Array.from(Array.isArray(data?.recipes) ? data.recipes : []);
          const seedMixes = Array.from(
            Array.isArray(data?.mixes) ? data.mixes : []
          );
          if (seedRecipes.length > 0) {
            saveRecipes(seedRecipes);
            setRecipes(seedRecipes);
          }
          if (seedMixes.length > 0) {
            saveMixes(seedMixes);
          }
          if (seedRecipes.length > 0 || seedMixes.length > 0) return; // done
        } catch (err) {
          // try next candidate
          try { console.warn('recipe.json load failed for', url, err); } catch {}
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = (id) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const saveRecipe = (r) => {
    if (!isAdmin) {
      alert("Admin only action");
      return;
    }
    // if recipe exists, update; else prepend
    const idx = recipes.findIndex((x) => x.id === r.id);
    let next;
    if (idx >= 0) {
      next = [...recipes];
      next[idx] = r;
    } else {
      next = [r, ...recipes];
    }
    setRecipes(next);
    saveRecipes(next);
  };

  const deleteRecipe = (id) => {
    if (!isAdmin) {
      alert("Admin only action");
      return;
    }
    const next = recipes.filter((r) => r.id !== id);
    setRecipes(next);
    saveRecipes(next);
    setSelected((s) => {
      const n = { ...s };
      delete n[id];
      return n;
    });
  };

  // Parse quantity and unit from a freeform extra string, naive best-effort.
  // Supports: decimals (1.5), commas (1,5), and unicode fractions (¼, ½, ¾), including mixed numbers (e.g., 1½ cup).
  // Examples: "2 kg", "1.5 tsp", "3", "2 large", "½ cup", "1½ tbsp", "to taste" -> qty 1, unit "to taste"
  const parseQtyUnit = (extra) => {
    if (!extra || typeof extra !== 'string') return { qty: 1, unit: '' }
    const s = extra.trim()
    const fracMap = { '¼': 0.25, '½': 0.5, '¾': 0.75 }
    // Match optional number (int/decimal with dot/comma), optional unicode fraction, then the rest as unit
    const m = s.match(/^(\d+(?:[\.,]\d+)?)?\s*([¼½¾])?\s*([^\d].*)?$/)
    if (m) {
      const raw = (m[1] || '').replace(',', '.')
      const base = raw ? Number(raw) : 0
      const frac = m[2] ? (fracMap[m[2]] || 0) : 0
      const total = base + frac
      const unit = (m[3] || '').trim()
      if (total > 0) return { qty: Math.round(total * 100) / 100, unit }
      // If zero but has unit words, treat as descriptor-only
      if (unit) return { qty: 1, unit }
    }
    // Fallback: if no recognizable number, keep descriptor as unit with qty=1
    return { qty: 1, unit: s }
  }

  const normalizeName = (name) => (name || '').trim()

  const purchaseItems = useMemo(() => {
    // aggregate as Map key: name||unit group
    const agg = new Map()
    const add = (name, extra) => {
      const n = normalizeName(name)
      if (!n) return
      const { qty, unit } = parseQtyUnit(extra)
      const key = `${n.toLowerCase()}|${unit.toLowerCase()}`
      const cur = agg.get(key)
      if (cur) {
        cur.qty += qty
      } else {
        agg.set(key, { name: n, unit, qty })
      }
    }
    for (const r of recipes) {
      if (!selected[r.id]) continue
      if (Array.isArray(r.ingredientDetails) && r.ingredientDetails.length > 0) {
        for (const d of r.ingredientDetails) {
          add(d?.name, d?.extra)
        }
      } else if (Array.isArray(r.ingredients)) {
        for (const n of r.ingredients) add(n, '')
      }
    }
    const list = Array.from(agg.values())
    // round qty to 2 decimals
    for (const it of list) {
      if (typeof it.qty === 'number') it.qty = Math.round(it.qty * 100) / 100
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [recipes, selected]);

  const exportTxt = () => {
    const lines = purchaseItems.map(it => {
      const qtyStr = (it.qty && it.qty !== 1) ? `${it.qty} ` : ''
      const unitStr = it.unit ? `${it.unit} ` : ''
      return `• ${qtyStr}${unitStr}${it.name}`.trim()
    })
    const content = lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'purchase-list.txt'
    a.click();
    URL.revokeObjectURL(url);
  };

  // helper: read Blob to data URL
  const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

  // helper: compress an image blob via canvas to WebP/JPEG
  const compressImageBlob = async (
    blob,
    { maxSize = 1280, quality = 0.8 } = {}
  ) => {
    try {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      const loaded = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });
      img.src = url;
      await loaded;

      let { width, height } = img;
      const scale = Math.min(1, maxSize / Math.max(width, height));
      const targetW = Math.max(1, Math.round(width * scale));
      const targetH = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Prefer WebP, fallback to JPEG
      let dataUrl = "";
      try {
        dataUrl = canvas.toDataURL("image/webp", quality);
      } catch {
        dataUrl = "";
      }
      if (!dataUrl || dataUrl === "data:,") {
        try {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        } catch {
          dataUrl = "";
        }
      }
      URL.revokeObjectURL(url);
      // Fallback: if conversion failed, return original blob as data URL
      if (!dataUrl || dataUrl === "data:,") {
        return await blobToDataUrl(blob);
      }
      return dataUrl;
    } catch {
      // On any error, fallback to original blob as data URL
      try {
        return await blobToDataUrl(blob);
      } catch {
        return null;
      }
    }
  };

  // helper: try to inline image as data URL; if fails, return original
  const inlineImage = async (src) => {
    try {
      if (!src || typeof src !== "string") return src;
      if (src.startsWith("data:")) return src;
      const res = await fetch(src, { mode: "cors" });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const dataUrl = await compressImageBlob(blob, {
        maxSize: 1280,
        quality: 0.8,
      });
      return dataUrl;
    } catch {
      return src;
    }
  };

  // helper: parse a data URL into { mime, data }
  const parseDataUrl = (du) => {
    try {
      if (!du || typeof du !== "string") return null;
      const m = du.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) return null;
      return { mime: m[1], data: m[2] };
    } catch {
      return null;
    }
  };

  // Export all content (recipes + mixes) as JSON, including images as data URLs and as blob-like objects
  const exportAll = async () => {
    try {
      const mixes = loadMixes();
      const recipesWithImages = await Promise.all(
        recipes.map(async (r) => {
          const inlined = await inlineImage(r.image);
          const imageData = parseDataUrl(inlined);
          return {
            ...r,
            image: inlined,
            // Also export a blob-like representation for consumers that prefer raw bytes
            ...(imageData ? { imageData } : {}),
          };
        })
      );
      const data = { recipes: recipesWithImages, mixes };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recipe.json";
      a.click();
      URL.revokeObjectURL(url);
      alert(
        "Exported recipe.json. To share with all users, place this file at public/recipe.json in the repo and redeploy GitHub Pages."
      );
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to export content.");
    }
  };

  // Import content (recipes + mixes) from JSON file
  const importAll = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const nextRecipes = Array.isArray(parsed?.recipes)
          ? parsed.recipes
          : [];
        // Ensure images are strings (prefer data URLs if provided)
        for (const r of nextRecipes) {
          if (r && typeof r === "object") {
            // if someone provided { imageData: { mime, data } }, convert to data URL
            if (
              !r.image &&
              r.imageData &&
              r.imageData.mime &&
              r.imageData.data
            ) {
              r.image = `data:${r.imageData.mime};base64,${r.imageData.data}`;
            }
          }
        }
        const nextMixes = Array.isArray(parsed?.mixes) ? parsed.mixes : [];
        saveRecipes(nextRecipes);
        saveMixes(nextMixes);
        setRecipes(nextRecipes);
        setSelected({});
        alert("Content imported successfully.");
      } catch (e) {
        console.error("Import failed", e);
        alert("Failed to import content. Ensure the file is a valid export.");
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen">
      <Header
        isAdmin={isAdmin}
        isDark={theme === "dark"}
        onToggleTheme={toggleTheme}
        onCreate={() => {
          if (isAdmin) {
            setEditingRecipe(null);
            setAdding(true);
          } else {
            alert("Admin only action");
          }
        }}
        onGotoList={() => setShowList(true)}
        onExportAll={isAdmin ? exportAll : undefined}
        onImportAll={isAdmin ? importAll : undefined}
      />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-slate-600 glass">
            <p className="text-lg">No recipes yet.</p>
            <p>Add your first recipe to get started!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                isAdmin={isAdmin}
                allRecipes={recipes}
                onOpenRecipe={setViewRecipe}
                selected={!!selected[r.id]}
                onToggle={() => toggleSelect(r.id)}
                onOpen={() => setViewRecipe(r)}
                onEdit={() => {
                  if (isAdmin) {
                    setEditingRecipe(r);
                    setAdding(true);
                  } else {
                    alert("Admin only action");
                  }
                }}
                onDelete={() => deleteRecipe(r.id)}
              />
            ))}
          </div>
        )}
      </main>

      {adding && (
        <RecipeForm
          initialRecipe={editingRecipe}
          onSave={saveRecipe}
          onClose={() => {
            setAdding(false);
            setEditingRecipe(null);
          }}
        />
      )}
      {viewRecipe && (
        <RecipeView
          recipe={viewRecipe}
          allRecipes={recipes}
          onOpenRecipe={setViewRecipe}
          onClose={() => setViewRecipe(null)}
        />
      )}
      {showList && (
        <PurchaseList
          items={purchaseItems}
          onClose={() => setShowList(false)}
          onExport={exportTxt}
        />
      )}
      {!isStandalone && deferredPrompt && Date.now() > dismissedUntil && (
        <div className="fixed inset-x-0 bottom-3 px-3 sm:px-4 z-50">
          <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white/90 backdrop-blur shadow-soft p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={(import.meta?.env?.BASE_URL || "/") + "icons/icon-192.png"}
                alt=""
                className="w-8 h-8 rounded"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Install Easy Cook
                </p>
                <p className="text-xs text-slate-600">
                  Get quick access and offline support.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => snoozeInstallPrompt(7)}
                className="px-3 py-2 text-slate-600 hover:text-slate-800"
              >
                Not now
              </button>
              <button
                onClick={promptInstall}
                className="px-3 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 shadow-soft"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
