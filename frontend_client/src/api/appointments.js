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

export function getNutritionistAppointments(nutritionistId, signal) {
  return client
    .get(`/nutritionists/${nutritionistId}/appointments`, { signal })
    .then(r => r.data);
}

export function acceptAppointment(id, signal) {
  return client
    .patch(`/appointments/${id}/accept`, null, { signal })
    .then(r => r.data);
}

export function rejectAppointment(id, signal) {
  return client
    .patch(`/appointments/${id}/reject`, null, { signal })
    .then(r => r.data);
}
