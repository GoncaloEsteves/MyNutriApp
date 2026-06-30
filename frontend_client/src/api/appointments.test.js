import client from './client';
import {
  requestAppointment,
  getNutritionistAppointments,
  acceptAppointment,
  rejectAppointment,
} from './appointments';

jest.mock('./client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
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

describe('getNutritionistAppointments', () => {
  it('GETs the nested appointments path', async () => {
    client.get.mockResolvedValue({ data: [] });
    await getNutritionistAppointments(7);
    expect(client.get).toHaveBeenCalledWith('/nutritionists/7/appointments', {
      signal: undefined,
    });
  });

  it('returns response.data', async () => {
    const data = [{ id: 1, status: 'pending' }];
    client.get.mockResolvedValue({ data });
    const result = await getNutritionistAppointments(7);
    expect(result).toEqual(data);
  });

  it('passes the signal through', async () => {
    client.get.mockResolvedValue({ data: [] });
    const signal = new AbortController().signal;
    await getNutritionistAppointments(7, signal);
    expect(client.get).toHaveBeenCalledWith('/nutritionists/7/appointments', { signal });
  });
});

describe('acceptAppointment', () => {
  it('PATCHes the accept path and returns data', async () => {
    const data = { id: 3, status: 'accepted' };
    client.patch.mockResolvedValue({ data });
    const result = await acceptAppointment(3);
    expect(client.patch).toHaveBeenCalledWith('/appointments/3/accept', null, {
      signal: undefined,
    });
    expect(result).toEqual(data);
  });
});

describe('rejectAppointment', () => {
  it('PATCHes the reject path and returns data', async () => {
    const data = { id: 3, status: 'rejected' };
    client.patch.mockResolvedValue({ data });
    const result = await rejectAppointment(3);
    expect(client.patch).toHaveBeenCalledWith('/appointments/3/reject', null, {
      signal: undefined,
    });
    expect(result).toEqual(data);
  });
});
