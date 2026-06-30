import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentCard } from './AppointmentCard';

const appt = {
  id: 5,
  patient_name: 'Alice Walker',
  patient_email: 'alice@example.com',
  scheduled_date: '2026-07-15T10:00:00.000Z',
  status: 'pending',
  service_type_name: 'Online',
  location_name: 'London',
};

test('renders patient name and the service type · location line', () => {
  render(<AppointmentCard appointment={appt} />);
  expect(screen.getByText('Alice Walker')).toBeInTheDocument();
  expect(screen.getByText(/Online · London/)).toBeInTheDocument();
});

test('shows Accept and Reject buttons when handlers are provided', () => {
  render(<AppointmentCard appointment={appt} onAccept={() => {}} onReject={() => {}} />);
  expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
});

test('calls onAccept with the appointment id', async () => {
  const onAccept = jest.fn();
  render(<AppointmentCard appointment={appt} onAccept={onAccept} onReject={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: /accept/i }));
  expect(onAccept).toHaveBeenCalledWith(5);
});

test('disables the action buttons when busy', () => {
  render(<AppointmentCard appointment={appt} onAccept={() => {}} onReject={() => {}} busy />);
  expect(screen.getByRole('button', { name: /accept/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled();
});

test('renders a read-only status badge and no buttons when no handlers', () => {
  render(<AppointmentCard appointment={{ ...appt, status: 'accepted' }} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('Accepted')).toBeInTheDocument();
});
