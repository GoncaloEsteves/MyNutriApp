import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientPage } from './PatientPage';

jest.mock('../components/ProfessionalCard', () => ({
  ProfessionalCard: ({ pro }) => <div>{pro.name}</div>,
}));

function renderPage() {
  render(<PatientPage onHome={() => {}} />);
}

test('renders all professionals on load', () => {
  renderPage();
  expect(screen.getByText('Mary Jane')).toBeInTheDocument();
  expect(screen.getByText('Carlos Mendes')).toBeInTheDocument();
  expect(screen.getByText('Sofia Reis')).toBeInTheDocument();
});

test('filters by name', async () => {
  renderPage();
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'Mary');
  expect(screen.getByText('Mary Jane')).toBeInTheDocument();
  expect(screen.queryByText('Carlos Mendes')).not.toBeInTheDocument();
  expect(screen.queryByText('Sofia Reis')).not.toBeInTheDocument();
});

test('filters by location_name via the search box', async () => {
  renderPage();
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'Lisboa');
  expect(screen.getByText('Carlos Mendes')).toBeInTheDocument();
  expect(screen.queryByText('Mary Jane')).not.toBeInTheDocument();
  expect(screen.queryByText('Sofia Reis')).not.toBeInTheDocument();
});

test('shows no-results message when nothing matches', async () => {
  renderPage();
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'zzz');
  expect(screen.queryByText('Mary Jane')).not.toBeInTheDocument();
  expect(screen.queryByText('Carlos Mendes')).not.toBeInTheDocument();
  expect(screen.queryByText('Sofia Reis')).not.toBeInTheDocument();
  expect(screen.getByText('No professionals found.')).toBeInTheDocument();
});
