import client from './client';

export function getNutritionists({ searchBy, location } = {}, signal) {
  const params = {};
  if (searchBy) params.searchBy = searchBy;
  if (location) params.location = location;
  return client.get('/nutritionists', { params, signal }).then(r => r.data);
}

export function getNutritionist(id, signal) {
  return client.get(`/nutritionists/${id}`, { signal }).then(r => r.data);
}
