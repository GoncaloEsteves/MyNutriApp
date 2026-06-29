import { useState, useEffect, useCallback } from 'react';
import { getNutritionists } from '../api/nutritionists';

export function useNutritionists({ searchBy, location }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getNutritionists({ searchBy, location }, controller.signal)
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
  }, [searchBy, location, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, loading, error, refetch };
}
