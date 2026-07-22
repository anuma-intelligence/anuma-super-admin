import { useEffect, useState } from "react";

// Debounce any changing value by `delay` milliseconds. Same shape as the
// planorama-admin hook (`hooks/useDebounce.jsx`) — kept as a JS module here
// since we don't need any JSX in it.
export const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
