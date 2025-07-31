import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import debounce from 'lodash/debounce';
import '../css/items.css';

function Items() {
  const { items, total, fetchItems } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);

  // debounced setter for query value
  const debouncedSetQ = useMemo(
    () =>
      debounce(value => {
        setQ(value);
        setPage(1); // reset page on new search
      }, 500), // 500ms debounce delay
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetQ.cancel();
    };
  }, [debouncedSetQ]);

  // fetch data when q, page or limit changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchItems({ q, page, limit, signal: controller.signal }).finally(() =>
      setLoading(false)
    );

    return () => controller.abort();
  }, [fetchItems, q, page, limit]);

  const totalPages = Math.ceil(total / limit);

  const Row = ({ index, style }) => (
    <div className="list-row" style={style}>
      <Link to={`/items/${items[index].id}`}>{items[index].name}</Link>
    </div>
  );

  return (
    <div className="items-container">
      <h2 className="items-title">Items</h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          debouncedSetQ(e.target.value);
        }}
        className="items-search-input"
        aria-label="Search items"
      />

      {loading && <p>Loading...</p>}

      {!loading && items.length === 0 && <p>No items found.</p>}

      {!loading && items.length > 0 && (
        // react window list for virtualization
        <List height={400} width={600} itemCount={items.length} itemSize={35}>
          {Row}
        </List>
      )}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page} of {totalPages || 1}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}

export default Items;