import client from './client';
import { requestAppointment } from './appointments';

jest.mock('./client', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

describe('requestAppointment', () => {
  it('POSTs to the nested appointments path with the appointment payload', async () => {
    client.post.mockResolvedValue({ data: { id: 9, status: 'pending' } });
    const payload = {
      patient_name: 'John Doe',
      patient_email: 'john@example.com',
      scheduled_date: '2026-07-01T13:00:00.000Z',
    };
    await requestAppointment(3, 5, payload);
    expect(client.post).toHaveBeenCalledWith(
      '/nutritionists/3/services/5/appointments',
      { appointment: payload },
      { signal: undefined },
    );
  });

  it('returns response.data', async () => {
    const data = { id: 9, status: 'pending' };
    client.post.mockResolvedValue({ data });
    const result = await requestAppointment(1, 2, {});
    expect(result).toEqual(data);
  });

  it('passes the signal through', async () => {
    client.post.mockResolvedValue({ data: {} });
    const signal = new AbortController().signal;
    await requestAppointment(1, 2, {}, signal);
    expect(client.post).toHaveBeenCalledWith(
      '/nutritionists/1/services/2/appointments',
      { appointment: {} },
      { signal },
    );
  });
});
