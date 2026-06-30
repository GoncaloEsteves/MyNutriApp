import client from './client';

export function requestAppointment(nutritionistId, serviceId, payload, signal) {
  return client
    .post(
      `/nutritionists/${nutritionistId}/services/${serviceId}/appointments`,
      { appointment: payload },
      { signal },
    )
    .then(r => r.data);
}
