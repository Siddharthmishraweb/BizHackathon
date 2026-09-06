import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, feasibilityTone } from './Badge';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge tone="green">On Track</Badge>);
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('applies the tone-specific classes', () => {
    render(<Badge tone="red">Behind</Badge>);
    expect(screen.getByText('Behind')).toHaveClass('bg-rose-50');
  });

  it('defaults to the slate tone when none is given', () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText('Neutral')).toHaveClass('bg-slate-100');
  });
});

describe('feasibilityTone', () => {
  it('maps likely outcomes to green', () => {
    expect(feasibilityTone('VERY_LIKELY')).toBe('green');
    expect(feasibilityTone('LIKELY')).toBe('green');
  });

  it('maps unlikely/impossible outcomes to red', () => {
    expect(feasibilityTone('UNLIKELY')).toBe('red');
    expect(feasibilityTone('CURRENTLY_IMPOSSIBLE')).toBe('red');
  });

  it('falls back to slate for an unrecognized class', () => {
    expect(feasibilityTone('SOMETHING_NEW')).toBe('slate');
  });
});
