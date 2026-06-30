import client from './client';
import { getNutritionists, getNutritionist } from './nutritionists';

jest.mock('./client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

describe('getNutritionists', () => {
  it('fetches /nutritionists with no params when called with empty strings', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: '', location: '' });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: {},
      signal: undefined,
    });
  });

  it('includes searchBy in params when non-empty', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: 'Mary', location: '' });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { searchBy: 'Mary' },
      signal: undefined,
    });
  });

  it('includes location in params when non-empty', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: '', location: 'Porto' });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { location: 'Porto' },
      signal: undefined,
    });
  });

  it('includes both params when both non-empty', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: 'Mary', location: 'Porto' });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { searchBy: 'Mary', location: 'Porto' },
      signal: undefined,
    });
  });

  it('includes service_type in params when serviceType is non-empty', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionists({ searchBy: '', location: '', serviceType: 2 });
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { service_type: 2 },
      signal: undefined,
    });
  });

  it('returns response.data', async () => {
    const mockData = [{ id: 1, name: 'Mary', services: [] }];
    client.get.mockResolvedValue({ data: mockData });
    const result = await getNutritionists({});
    expect(result).toEqual(mockData);
  });

  it('passes the signal to the request', async () => {
    client.get.mockResolvedValue({ data: [] });
    const signal = new AbortController().signal;
    await getNutritionists({ searchBy: 'Mary' }, signal);
    expect(client.get).toHaveBeenCalledWith('/nutritionists', {
      params: { searchBy: 'Mary' },
      signal,
    });
  });
});

describe('getNutritionist', () => {
  it('fetches /nutritionists/:id', async () => {
    const mockData = { id: 1, name: 'Mary', services: [] };
    client.get.mockResolvedValue({ data: mockData });
    const result = await getNutritionist(1);
    expect(client.get).toHaveBeenCalledWith('/nutritionists/1', { signal: undefined });
    expect(result).toEqual(mockData);
  });

  it('passes the signal to the request', async () => {
    client.get.mockResolvedValue({ data: {} });
    const signal = new AbortController().signal;
    await getNutritionist(42, signal);
    expect(client.get).toHaveBeenCalledWith('/nutritionists/42', { signal });
  });
});
