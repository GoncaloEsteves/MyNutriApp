import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfessionalCard } from './ProfessionalCard';

const pro = {
  id: 7,
  name: 'Ana Lima',
  services: [
    {
      id: 1,
      price: 30,
      duration: 45,
      service_type_name: 'SERVICETYPE.ONLINEAPPOINTMENT',
      location_name: 'Lisboa',
    },
  ],
};

function renderCard() {
  render(
    <MemoryRouter initialEntries={['/patient']}>
      <Routes>
        <Route path="/patient" element={<ProfessionalCard pro={pro} />} />
        <Route path="/nutritionists/:id" element={<div>Detail page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

test('renders nutritionist name', () => {
  renderCard();
  expect(screen.getByText('Ana Lima')).toBeInTheDocument();
});

test('View profile button navigates to /nutritionists/:id', async () => {
  renderCard();
  await userEvent.click(screen.getByRole('button', { name: /view profile/i }));
  expect(screen.getByText('Detail page')).toBeInTheDocument();
});

test('Schedule appointment button is still present', () => {
  renderCard();
  expect(screen.getByRole('button', { name: /schedule appointment/i })).toBeInTheDocument();
});
