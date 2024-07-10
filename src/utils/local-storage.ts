export enum LOCAL_STORAGE_KEY{
  THEME = "theme",
  TIP_SHOWN = "tipShown",
  SELECTED_FILES = "selectedFiles",
};

const localStorageDefaults = {
  [LOCAL_STORAGE_KEY.THEME]: "light",
  [LOCAL_STORAGE_KEY.TIP_SHOWN]: "false",
  [LOCAL_STORAGE_KEY.SELECTED_FILES]: [],
};

export const getFromLocalStorage = <T>(key: LOCAL_STORAGE_KEY): T | null => {
  const value = localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : (localStorageDefaults[key] as T);
};

export const saveToLocalStorage = (key: LOCAL_STORAGE_KEY, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeFromLocalStorage = (key: LOCAL_STORAGE_KEY) => {
  localStorage.removeItem(key);
};

export const clearLocalStorage = () => {
  localStorage.clear();
};
