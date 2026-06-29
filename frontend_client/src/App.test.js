import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders the home page on load', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByText("I'm a patient")).toBeInTheDocument();
  expect(screen.getByText("I'm a nutritionist")).toBeInTheDocument();
});
