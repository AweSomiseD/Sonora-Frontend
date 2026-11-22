import { useCallback, useEffect, useRef, useState } from "react";
import api, { getErrorMessage } from "../services/api.js";

// Loads a page-based endpoint ({ items, page, hasMore, total }) with "Load more".
// `params` changes reset the list (filters, search, tabs).
export default function usePaginatedList(url, params = {}, { limit = 20, enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(
    async (pageToLoad) => {
      if (!enabled || !url) return;
      const id = ++requestId.current;
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);
      setError("");
      try {
        const query = new URLSearchParams({ ...JSON.parse(paramsKey), page: String(pageToLoad), limit: String(limit) });
        [...query.entries()].forEach(([key, value]) => (value === "" || value === "undefined") && query.delete(key));
        const { data } = await api.get(`${url}?${query.toString()}`);
        if (id !== requestId.current) return;
        setItems((prev) => (pageToLoad === 1 ? data.items || [] : [...prev, ...(data.items || [])]));
        setHasMore(Boolean(data.hasMore));
        setTotal(data.total ?? (data.items || []).length);
        setPage(pageToLoad);
      } catch (err) {
        if (id === requestId.current) setError(getErrorMessage(err, "Could not load this list."));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [url, paramsKey, limit, enabled],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  return {
    items,
    setItems,
    total,
    setTotal,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore: () => load(page + 1),
    reload: () => load(1),
  };
}
