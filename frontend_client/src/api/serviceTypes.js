import client from './client';

export function getServiceTypes(signal) {
  return client.get('/service_types', { signal }).then(r => r.data);
}
