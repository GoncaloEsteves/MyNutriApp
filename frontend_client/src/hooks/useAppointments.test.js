import { renderHook, waitFor, act } from '@testing-library/react';
import { useAppointments } from './useAppointments';
import * as api from '../api/appointments';

jest.mock('../api/appointments');

const mockData = [{ id: 1, patient_name: 'Alice', status: 'pending' }];

beforeEach(() => jest.clearAllMocks());

test('returns loading=true and empty data initially', () => {
  api.getNutritionistAppointments.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() => useAppointments(1));
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toEqual([]);
  expect(result.current.error).toBeNull();
});

test('returns data after a successful fetch', async () => {
  api.getNutritionistAppointments.mockResolvedValue(mockData);
  const { result } = renderHook(() => useAppointments(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(mockData);
  expect(result.current.error).toBeNull();
});

test('returns error when the fetch fails', async () => {
  api.getNutritionistAppointments.mockRejectedValue(new Error('Boom'));
  const { result } = renderHook(() => useAppointments(99));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.data).toEqual([]);
});

test('refetches when refetch is called', async () => {
  api.getNutritionistAppointments.mockResolvedValue(mockData);
  const { result } = renderHook(() => useAppointments(1));
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.refetch());
  await waitFor(() =>
    expect(api.getNutritionistAppointments).toHaveBeenCalledTimes(2),
  );
});
