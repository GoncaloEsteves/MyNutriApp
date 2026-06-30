import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProfessionalCard } from './ProfessionalCard';

jest.mock('./AppointmentRequestModal', () => ({
  AppointmentRequestModal: ({ nutritionist }) => (
    <div data-testid="appt-modal">{nutritionist.name}</div>
  ),
}));

const pro = {
  id: 7,
  name: 'Mary Jane',
  services: [
    { id: 5, price: 50, duration: 45, service_type_name: 'SERVICETYPE.CLINICAPPOINTMENT', location_name: 'Porto' },
  ],
};

function renderCard() {
  render(<MemoryRouter><ProfessionalCard pro={pro} /></MemoryRouter>);
}

test('the modal is not shown initially', () => {
  renderCard();
  expect(screen.queryByTestId('appt-modal')).not.toBeInTheDocument();
});

test('clicking Schedule appointment opens the modal for this nutritionist', async () => {
  renderCard();
  await userEvent.click(screen.getByRole('button', { name: 'Schedule appointment' }));
  expect(screen.getByTestId('appt-modal')).toHaveTextContent('Mary Jane');
});
