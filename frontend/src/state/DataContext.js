import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0); // total items from server

  const fetchItems = useCallback(async ({ q = '', page = 1, limit = 10, signal } = {}) => {
    try {
      const params = new URLSearchParams({ q, page, limit });
      const res = await fetch(`http://localhost:4001/api/items?${params.toString()}`, { signal });
      const json = await res.json();
      console.log(json.data)
      setItems(json.data);
      setTotal(json.total);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('fetch failed', err);
      }
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, total, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);