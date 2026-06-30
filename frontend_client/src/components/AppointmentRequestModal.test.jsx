import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentRequestModal } from './AppointmentRequestModal';
import * as api from '../api/appointments';

jest.mock('../api/appointments');

const nutritionist = {
  id: 7,
  name: 'Mary Jane',
  services: [
    { id: 5, price: 50, duration: 45, service_type_name: 'SERVICETYPE.CLINICAPPOINTMENT', location_name: 'Porto' },
    { id: 8, price: 30, duration: 30, service_type_name: 'SERVICETYPE.ONLINEAPPOINTMENT', location_name: 'Lisboa' },
  ],
};

const FUTURE = '2099-01-01T10:00';
const PAST = '2000-01-01T10:00';

function renderModal(props = {}) {
  const onClose = jest.fn();
  render(<AppointmentRequestModal nutritionist={nutritionist} onClose={onClose} {...props} />);
  return { onClose };
}

async function fillValidForm() {
  await userEvent.selectOptions(screen.getByLabelText('Service'), '5');
  await userEvent.type(screen.getByLabelText('Your name'), 'John Doe');
  await userEvent.type(screen.getByLabelText('Your email'), 'john@example.com');
  fireEvent.change(screen.getByLabelText('Date & time'), { target: { value: FUTURE } });
}

beforeEach(() => jest.clearAllMocks());

test('returns null when no nutritionist is provided', () => {
  const { container } = render(<AppointmentRequestModal nutritionist={null} onClose={jest.fn()} />);
  expect(container).toBeEmptyDOMElement();
});

test('renders one option per service with translated type, location, price and duration', () => {
  renderModal();
  expect(
    screen.getByRole('option', { name: 'Clinic Appointment · Porto · from 50€ · 45 min' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('option', { name: 'Online Appointment · Lisboa · from 30€ · 30 min' })
  ).toBeInTheDocument();
});

test('Submit is disabled until all fields are valid', async () => {
  renderModal();
  const submit = screen.getByRole('button', { name: 'Request appointment' });
  expect(submit).toBeDisabled();
  await fillValidForm();
  expect(submit).toBeEnabled();
});

test('invalid email shows a hint and keeps Submit disabled', async () => {
  renderModal();
  await userEvent.selectOptions(screen.getByLabelText('Service'), '5');
  await userEvent.type(screen.getByLabelText('Your name'), 'John Doe');
  await userEvent.type(screen.getByLabelText('Your email'), 'not-an-email');
  fireEvent.change(screen.getByLabelText('Date & time'), { target: { value: FUTURE } });
  expect(screen.getByText('Please enter a valid email.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Request appointment' })).toBeDisabled();
});

test('past date shows a hint and keeps Submit disabled', async () => {
  renderModal();
  await userEvent.selectOptions(screen.getByLabelText('Service'), '5');
  await userEvent.type(screen.getByLabelText('Your name'), 'John Doe');
  await userEvent.type(screen.getByLabelText('Your email'), 'john@example.com');
  fireEvent.change(screen.getByLabelText('Date & time'), { target: { value: PAST } });
  expect(screen.getByText('Please choose a date in the future.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Request appointment' })).toBeDisabled();
});

test('successful submit calls requestAppointment with the right args and shows success', async () => {
  api.requestAppointment.mockResolvedValue({ id: 1, status: 'pending' });
  renderModal();
  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: 'Request appointment' }));

  await waitFor(() =>
    expect(api.requestAppointment).toHaveBeenCalledWith(7, '5', {
      patient_name: 'John Doe',
      patient_email: 'john@example.com',
      scheduled_date: new Date(FUTURE).toISOString(),
    })
  );
  expect(await screen.findByText('Request sent!')).toBeInTheDocument();
});

test('backend error shows an inline error and keeps the form open', async () => {
  api.requestAppointment.mockRejectedValue(new Error('boom'));
  renderModal();
  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: 'Request appointment' }));

  expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Request appointment' })).toBeInTheDocument();
});

test('Cancel calls onClose', async () => {
  const { onClose } = renderModal();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).toHaveBeenCalled();
});

test('clicking the overlay backdrop calls onClose', () => {
  const onClose = jest.fn();
  const { container } = render(
    <AppointmentRequestModal nutritionist={nutritionist} onClose={onClose} />
  );
  // container.firstChild is the overlay div (has onClick={onClose})
  // The inner card has stopPropagation, so clicking the overlay directly triggers onClose
  fireEvent.click(container.firstChild);
  expect(onClose).toHaveBeenCalled();
});

test('shows Sending label and disables Submit while request is in flight', async () => {
  let resolve;
  api.requestAppointment.mockReturnValue(new Promise(r => { resolve = r; }));
  renderModal();
  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: 'Request appointment' }));
  // While the promise is unresolved, the button should show "Sending…"
  expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  // Clean up — resolve so no state update leaks after test
  resolve({ id: 1 });
});

test('Close button on success state calls onClose', async () => {
  api.requestAppointment.mockResolvedValue({ id: 1, status: 'pending' });
  const { onClose } = renderModal();
  await fillValidForm();
  await userEvent.click(screen.getByRole('button', { name: 'Request appointment' }));
  const closeBtn = await screen.findByRole('button', { name: 'Close' });
  await userEvent.click(closeBtn);
  expect(onClose).toHaveBeenCalled();
});
