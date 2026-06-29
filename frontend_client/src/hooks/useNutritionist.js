import { useState, useEffect, useCallback } from 'react';
import { getNutritionist } from '../api/nutritionists';

export function useNutritionist(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getNutritionist(id, controller.signal)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') {
          setError(err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [id, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, loading, error, refetch };
}
