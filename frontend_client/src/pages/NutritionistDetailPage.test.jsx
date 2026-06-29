import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NutritionistDetailPage } from './NutritionistDetailPage';
import * as api from '../api/nutritionists';

jest.mock('../api/nutritionists');

function renderPage(id = '1') {
  render(
    <MemoryRouter initialEntries={[`/nutritionists/${id}`]}>
      <Routes>
        <Route path="/nutritionists/:id" element={<NutritionistDetailPage />} />
        <Route path="/patient" element={<div>Patient list</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => jest.clearAllMocks());

test('shows skeleton while loading', () => {
  api.getNutritionist.mockReturnValue(new Promise(() => {}));
  renderPage();
  expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
});

test('shows nutritionist name and id after load', async () => {
  api.getNutritionist.mockResolvedValue({ id: 1, name: 'Mary Jane', services: [] });
  renderPage('1');
  await waitFor(() => expect(screen.getByText('Mary Jane')).toBeInTheDocument());
  expect(screen.getByText('#1')).toBeInTheDocument();
});

test('shows error message and Retry on failure', async () => {
  api.getNutritionist.mockRejectedValue(new Error('Not Found'));
  renderPage('99');
  await waitFor(() =>
    expect(screen.getByText('Failed to load nutritionist profile. Please try again.')).toBeInTheDocument()
  );
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});

test('Retry triggers a new fetch', async () => {
  api.getNutritionist
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue({ id: 1, name: 'Mary Jane', services: [] });
  renderPage('1');
  await waitFor(() => screen.getByRole('button', { name: /retry/i }));
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));
  await waitFor(() => expect(screen.getByText('Mary Jane')).toBeInTheDocument());
});

test('Back link navigates to /patient', async () => {
  api.getNutritionist.mockResolvedValue({ id: 1, name: 'Mary Jane', services: [] });
  renderPage('1');
  await waitFor(() => screen.getByText('Back to search'));
  await userEvent.click(screen.getByText('Back to search'));
  expect(screen.getByText('Patient list')).toBeInTheDocument();
});
