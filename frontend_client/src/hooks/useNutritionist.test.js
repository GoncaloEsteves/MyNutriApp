import { renderHook, waitFor, act } from '@testing-library/react';
import { useNutritionist } from './useNutritionist';
import * as api from '../api/nutritionists';

jest.mock('../api/nutritionists');

const mockData = { id: 1, name: 'Mary', services: [] };

beforeEach(() => jest.clearAllMocks());

test('returns loading=true and null data initially', () => {
  api.getNutritionist.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() => useNutritionist(1));
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeNull();
});

test('returns data after successful fetch', async () => {
  api.getNutritionist.mockResolvedValue(mockData);
  const { result } = renderHook(() => useNutritionist(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(mockData);
  expect(result.current.error).toBeNull();
});

test('returns error when fetch fails', async () => {
  api.getNutritionist.mockRejectedValue(new Error('Not Found'));
  const { result } = renderHook(() => useNutritionist(99));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.data).toBeNull();
});

test('refetches when refetch is called', async () => {
  api.getNutritionist.mockResolvedValue(mockData);
  const { result } = renderHook(() => useNutritionist(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.refetch());
  await waitFor(() => expect(api.getNutritionist).toHaveBeenCalledTimes(2));
});
