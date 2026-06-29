import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders the home page on load', () => {
  render(<App />);
  expect(screen.getByText("I'm a patient")).toBeInTheDocument();
  expect(screen.getByText("I'm a nutritionist")).toBeInTheDocument();
});
