import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './error-boundary';
import { Provider } from './provider';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Component that renders successfully
const NoError = () => <div>Success</div>;

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <Provider>
        <ErrorBoundary>
          <NoError />
        </ErrorBoundary>
      </Provider>
    );

    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <Provider>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      </Provider>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays the error message when child throws', () => {
    render(
      <Provider>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      </Provider>
    );

    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });
});
