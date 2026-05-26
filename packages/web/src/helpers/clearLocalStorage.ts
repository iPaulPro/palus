import { Localstorage } from "@/data/storage";

const clearLocalStorage = (): void => {
  const storesToClear = Object.values(Localstorage).filter(
    (store) =>
      store !== Localstorage.SearchStore &&
      store !== Localstorage.NotificationStore &&
      store !== Localstorage.PreferencesStore
  );

  for (const store of storesToClear) {
    localStorage.removeItem(store);
  }
};

export default clearLocalStorage;
