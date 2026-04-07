import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { CreateAccountPage } from './CreateAccountPage';
import '@testing-library/jest-dom/vitest';

describe('CreateAccountPage - Mock Object Testing', () => {
  it('displays success UI after successful registration', async () => {
    // Mock the onRegister function to simulate a successful backend response
    // This prevents real API calls and isolates the frontend logic
    const mockRegister = vi.fn().mockResolvedValue(null);

    // Render the component inside a router (required because the component uses <Link>)
    render(
      <MemoryRouter>
        <CreateAccountPage onRegister={mockRegister} />
      </MemoryRouter>
    );

    // Fill out the form fields with valid input data
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/CWRU Email/i), {
      target: { value: 'jane@case.edu' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'abc123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'abc123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Verify that the mocked function was called with the correct arguments
    // This ensures the component is correctly passing user input to the backend layer
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'jane@case.edu',
        'abc123',
        'Jane',
        'Doe'
      );
    });

    // Verify that the UI updates to the success state after registration
    // This confirms that the component correctly handles a successful response
    expect(screen.getByText(/Check your email!/i)).toBeInTheDocument();
    expect(screen.getByText(/verification link/i)).toBeInTheDocument();
  });
});