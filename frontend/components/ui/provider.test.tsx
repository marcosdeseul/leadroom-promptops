import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from './provider';

describe('Provider', () => {
  it('renders children successfully', () => {
    render(
      <Provider>
        <div>Test Content</div>
      </Provider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('wraps children with necessary providers', () => {
    render(
      <Provider>
        <div data-testid="child">Child Element</div>
      </Provider>
    );

    // Verify child renders successfully within provider context
    const childElement = screen.getByTestId('child');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Child Element');
  });
});
