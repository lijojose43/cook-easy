
const KEY = 'cookbook:recipes:v1';
const MIX_KEY = 'cookbook:mixes:v1';

export function loadRecipes() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecipes(recipes) {
  localStorage.setItem(KEY, JSON.stringify(recipes));
}

export function loadMixes() {
  try {
    const raw = localStorage.getItem(MIX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMixes(mixes) {
  localStorage.setItem(MIX_KEY, JSON.stringify(mixes));
}
