
const KEY = 'cookbook:recipes:v1';
const MIX_KEY = 'cookbook:mixes:v1';

export function loadRecipes() {
  // Local persistence disabled: recipes will be fetched from recipe.json in App.jsx
  return [];
}

export function saveRecipes(recipes) {
  // No-op: avoid using localStorage. Use export functionality to download JSON instead.
}

export function loadMixes() {
  // Local persistence disabled: mixes will be fetched from recipe.json in App.jsx
  return [];
}

export function saveMixes(mixes) {
  // No-op: avoid using localStorage. Use export functionality to download JSON instead.
}
