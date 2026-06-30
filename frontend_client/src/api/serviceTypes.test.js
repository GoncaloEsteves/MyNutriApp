import client from './client';
import { getServiceTypes } from './serviceTypes';

jest.mock('./client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

describe('getServiceTypes', () => {
  it('fetches /service_types', async () => {
    const mockData = [{ id: 1, name: 'Online' }, { id: 2, name: 'Clinic' }];
    client.get.mockResolvedValue({ data: mockData });
    const result = await getServiceTypes();
    expect(client.get).toHaveBeenCalledWith('/service_types', { signal: undefined });
    expect(result).toEqual(mockData);
  });

  it('passes the signal to the request', async () => {
    client.get.mockResolvedValue({ data: [] });
    const signal = new AbortController().signal;
    await getServiceTypes(signal);
    expect(client.get).toHaveBeenCalledWith('/service_types', { signal });
  });
});
