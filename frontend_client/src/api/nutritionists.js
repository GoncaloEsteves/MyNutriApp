import client from './client';

export function getNutritionists({ searchBy, location, serviceType } = {}, signal) {
  const params = {};
  if (searchBy) params.searchBy = searchBy;
  if (location) params.location = location;
  if (serviceType) params.service_type = serviceType;
  return client.get('/nutritionists', { params, signal }).then(r => r.data);
}

export function getNutritionist(id, signal) {
  return client.get(`/nutritionists/${id}`, { signal }).then(r => r.data);
}
