
const KEY = 'cookbook:recipes:v1';

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
