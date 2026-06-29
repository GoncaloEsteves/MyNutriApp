import { renderHook, waitFor, act } from '@testing-library/react';
import { useNutritionists } from './useNutritionists';
import * as api from '../api/nutritionists';

jest.mock('../api/nutritionists');

const mockData = [{ id: 1, name: 'Mary', services: [] }];

beforeEach(() => jest.clearAllMocks());

test('returns loading=true and empty data initially', () => {
  api.getNutritionists.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() =>
    useNutritionists({ searchBy: '', location: '' })
  );
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toEqual([]);
  expect(result.current.error).toBeNull();
});

test('returns data after successful fetch', async () => {
  api.getNutritionists.mockResolvedValue(mockData);
  const { result } = renderHook(() =>
    useNutritionists({ searchBy: '', location: '' })
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(mockData);
  expect(result.current.error).toBeNull();
});

test('returns error when fetch fails', async () => {
  api.getNutritionists.mockRejectedValue(new Error('Network Error'));
  const { result } = renderHook(() =>
    useNutritionists({ searchBy: '', location: '' })
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.data).toEqual([]);
});

test('refetches when refetch is called', async () => {
  api.getNutritionists.mockResolvedValue(mockData);
  const { result } = renderHook(() =>
    useNutritionists({ searchBy: '', location: '' })
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.refetch());
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
});

test('refetches when search params change', async () => {
  api.getNutritionists.mockResolvedValue(mockData);
  const { result, rerender } = renderHook(
    ({ searchBy, location }) => useNutritionists({ searchBy, location }),
    { initialProps: { searchBy: '', location: '' } }
  );
  await waitFor(() => expect(result.current.loading).toBe(false));
  rerender({ searchBy: 'Mary', location: '' });
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
  expect(api.getNutritionists).toHaveBeenLastCalledWith(
    { searchBy: 'Mary', location: '' },
    expect.anything()
  );
});
