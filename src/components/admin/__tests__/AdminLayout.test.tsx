import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AdminLayout', () => {
  it('should be testable', () => {
    // Simple test to verify the test setup works
    render(<div data-testid="test">Test</div>);
    const element = screen.getByTestId('test');
    expect(element).toBeDefined();
    expect(element.textContent).toBe('Test');
  });
});