import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PatientPage } from './PatientPage';
import * as api from '../api/nutritionists';

jest.mock('../api/nutritionists');
jest.mock('../components/ProfessionalCard', () => ({
  ProfessionalCard: ({ pro }) => <div data-testid="pro-card">{pro.name}</div>,
}));

const mockProfessionals = [
  { id: 1, name: 'Mary Jane', services: [] },
  { id: 2, name: 'Carlos Mendes', services: [] },
];

function renderPage() {
  render(<MemoryRouter><PatientPage /></MemoryRouter>);
}

beforeEach(() => jest.clearAllMocks());

test('shows skeleton cards while loading', () => {
  api.getNutritionists.mockReturnValue(new Promise(() => {}));
  renderPage();
  expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  expect(screen.queryByTestId('pro-card')).not.toBeInTheDocument();
});

test('renders professionals after successful load', async () => {
  api.getNutritionists.mockResolvedValue(mockProfessionals);
  renderPage();
  await waitFor(() => expect(screen.getByText('Mary Jane')).toBeInTheDocument());
  expect(screen.getByText('Carlos Mendes')).toBeInTheDocument();
  expect(screen.queryAllByTestId('skeleton-card')).toHaveLength(0);
});

test('shows no-results message when list is empty', async () => {
  api.getNutritionists.mockResolvedValue([]);
  renderPage();
  await waitFor(() =>
    expect(screen.getByText('No professionals found.')).toBeInTheDocument()
  );
});

test('shows error message and Retry button on fetch failure', async () => {
  api.getNutritionists.mockRejectedValue(new Error('Network Error'));
  renderPage();
  await waitFor(() =>
    expect(screen.getByText('Failed to load professionals. Please try again.')).toBeInTheDocument()
  );
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});

test('Retry button triggers a new fetch', async () => {
  api.getNutritionists
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue(mockProfessionals);
  renderPage();
  await waitFor(() => screen.getByRole('button', { name: /retry/i }));
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));
  await waitFor(() => expect(screen.getByText('Mary Jane')).toBeInTheDocument());
});

test('Search button commits query and triggers refetch with searchBy param', async () => {
  api.getNutritionists.mockResolvedValue([]);
  renderPage();
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(1));
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'Mary');
  await userEvent.click(screen.getByRole('button', { name: /search/i }));
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
  expect(api.getNutritionists).toHaveBeenLastCalledWith(
    { searchBy: 'Mary', location: '' },
    expect.anything()
  );
});

test('Search button commits location param', async () => {
  api.getNutritionists.mockResolvedValue([]);
  renderPage();
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(1));
  await userEvent.type(screen.getByPlaceholderText('Location'), 'Porto');
  await userEvent.click(screen.getByRole('button', { name: /search/i }));
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
  expect(api.getNutritionists).toHaveBeenLastCalledWith(
    { searchBy: '', location: 'Porto' },
    expect.anything()
  );
});

test('pressing Enter in the name input commits query', async () => {
  api.getNutritionists.mockResolvedValue([]);
  renderPage();
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(1));
  await userEvent.type(screen.getByPlaceholderText('Name or service'), 'Carlos{Enter}');
  await waitFor(() => expect(api.getNutritionists).toHaveBeenCalledTimes(2));
  expect(api.getNutritionists).toHaveBeenLastCalledWith(
    { searchBy: 'Carlos', location: '' },
    expect.anything()
  );
});
