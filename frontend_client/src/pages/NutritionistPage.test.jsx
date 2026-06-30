import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NutritionistPage } from './NutritionistPage';
import * as appointmentsHook from '../hooks/useAppointments';
import * as appointmentsApi from '../api/appointments';

jest.mock('../hooks/useAppointments');
jest.mock('../api/appointments');

const base = {
  service_type_name: 'Online',
  location_name: 'London',
  scheduled_date: '2026-07-15T10:00:00.000Z',
};
const appts = [
  { ...base, id: 1, patient_name: 'Alice Pending', patient_email: 'a@x.com', status: 'pending' },
  { ...base, id: 2, patient_name: 'Bob Accepted', patient_email: 'b@x.com', status: 'accepted' },
  { ...base, id: 3, patient_name: 'Carol Rejected', patient_email: 'c@x.com', status: 'rejected' },
];

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/dashboard/9']}>
      <Routes>
        <Route path="/dashboard/:id" element={<NutritionistPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  appointmentsHook.useAppointments.mockReturnValue({
    data: appts, loading: false, error: null, refetch: jest.fn(),
  });
});

test('shows the pending appointments by default', () => {
  renderPage();
  expect(screen.getByText('Alice Pending')).toBeInTheDocument();
  expect(screen.queryByText('Bob Accepted')).not.toBeInTheDocument();
});

test('switches to the Accepted tab', async () => {
  renderPage();
  await userEvent.click(screen.getByRole('button', { name: /accepted/i }));
  expect(screen.getByText('Bob Accepted')).toBeInTheDocument();
  expect(screen.queryByText('Alice Pending')).not.toBeInTheDocument();
});

test('accepting a pending appointment calls the API, moves it, and shows a toast', async () => {
  appointmentsApi.acceptAppointment.mockResolvedValue({ ...appts[0], status: 'accepted' });
  renderPage();
  await userEvent.click(screen.getByRole('button', { name: /^accept$/i }));
  expect(appointmentsApi.acceptAppointment).toHaveBeenCalledWith(1);
  await waitFor(() =>
    expect(screen.queryByText('Alice Pending')).not.toBeInTheDocument(),
  );
  expect(screen.getByText('Appointment accepted!')).toBeInTheDocument();
  // Switch to Accepted tab and confirm Alice is there
  fireEvent.click(screen.getByRole('button', { name: /Accepted/i }));
  expect(screen.getByText('Alice Pending')).toBeInTheDocument();
});

test('rejecting a pending appointment calls the API and shows a toast', async () => {
  appointmentsApi.rejectAppointment.mockResolvedValue({ ...appts[0], status: 'rejected' });
  renderPage();
  await userEvent.click(screen.getByRole('button', { name: /^reject$/i }));
  expect(appointmentsApi.rejectAppointment).toHaveBeenCalledWith(1);
  await waitFor(() =>
    expect(screen.getByText('Appointment rejected.')).toBeInTheDocument(),
  );
});
