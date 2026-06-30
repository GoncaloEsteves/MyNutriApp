import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NutritionistPickerModal } from './NutritionistPickerModal';
import * as hook from '../hooks/useNutritionists';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../hooks/useNutritionists');

beforeEach(() => jest.clearAllMocks());

function renderModal(onClose = () => {}) {
  render(
    <MemoryRouter>
      <NutritionistPickerModal onClose={onClose} />
    </MemoryRouter>,
  );
}

test('lists the nutritionists', () => {
  hook.useNutritionists.mockReturnValue({
    data: [{ id: 1, name: 'John Smith' }, { id: 2, name: 'Emma Brown' }],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  renderModal();
  expect(screen.getByText('John Smith')).toBeInTheDocument();
  expect(screen.getByText('Emma Brown')).toBeInTheDocument();
});

test('navigates to the dashboard for the picked nutritionist and closes', async () => {
  const onClose = jest.fn();
  hook.useNutritionists.mockReturnValue({
    data: [{ id: 2, name: 'Emma Brown' }],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  renderModal(onClose);
  await userEvent.click(screen.getByText('Emma Brown'));
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard/2');
  expect(onClose).toHaveBeenCalled();
});

test('shows an error with retry when loading fails', () => {
  const refetch = jest.fn();
  hook.useNutritionists.mockReturnValue({
    data: [], loading: false, error: new Error('x'), refetch,
  });
  renderModal();
  expect(screen.getByText(/failed to load nutritionists/i)).toBeInTheDocument();
});
