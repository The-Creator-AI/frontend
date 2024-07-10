export enum LOCAL_STORAGE_KEY{
  THEME = "theme",
  TIP_SHOWN = "tipShown",
};

const localStorageDefaults = {
  [LOCAL_STORAGE_KEY.THEME]: "light",
  [LOCAL_STORAGE_KEY.TIP_SHOWN]: "false",
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
