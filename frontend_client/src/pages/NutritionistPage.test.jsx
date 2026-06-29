import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NutritionistPage } from './NutritionistPage';

function renderPage() {
  render(<MemoryRouter><NutritionistPage /></MemoryRouter>);
}

test('renders all pending request cards', () => {
  renderPage();
  expect(screen.getByText('Francisco Neves')).toBeInTheDocument();
  expect(screen.getByText('Ana Costa')).toBeInTheDocument();
  expect(screen.getByText('Miguel Santos')).toBeInTheDocument();
});

test('opens the modal for the clicked request', async () => {
  renderPage();
  const answerButtons = screen.getAllByRole('button', { name: /answer request/i });
  await userEvent.click(answerButtons[0]);
  expect(screen.getAllByText('Francisco Neves').length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
});

test('accept removes the request and shows success toast', async () => {
  renderPage();
  const answerButtons = screen.getAllByRole('button', { name: /answer request/i });
  await userEvent.click(answerButtons[0]);
  await userEvent.click(screen.getByRole('button', { name: /accept/i }));
  expect(screen.queryByText('Francisco Neves')).not.toBeInTheDocument();
  expect(screen.getByText('Appointment accepted!')).toBeInTheDocument();
});

test('reject removes the request and shows rejection toast', async () => {
  renderPage();
  const answerButtons = screen.getAllByRole('button', { name: /answer request/i });
  await userEvent.click(answerButtons[0]);
  await userEvent.click(screen.getByRole('button', { name: /reject/i }));
  expect(screen.queryByText('Francisco Neves')).not.toBeInTheDocument();
  expect(screen.getByText('Appointment rejected.')).toBeInTheDocument();
});
