import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import * as hook from '../hooks/useNutritionists';

jest.mock('../hooks/useNutritionists');

beforeEach(() => jest.clearAllMocks());

test('opens the nutritionist picker when the nutritionist card is clicked', async () => {
  hook.useNutritionists.mockReturnValue({
    data: [{ id: 1, name: 'John Smith' }],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  render(<MemoryRouter><HomePage /></MemoryRouter>);

  expect(screen.queryByText('Select a nutritionist')).not.toBeInTheDocument();
  await userEvent.click(screen.getByText("I'm a nutritionist"));
  expect(screen.getByText('Select a nutritionist')).toBeInTheDocument();
  expect(screen.getByText('John Smith')).toBeInTheDocument();
});
