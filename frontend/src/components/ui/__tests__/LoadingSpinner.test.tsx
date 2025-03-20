import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('w-6');
    expect(spinner).toHaveClass('h-6');
    expect(spinner).toHaveClass('border-blue-600');
    expect(spinner).toHaveClass('border-t-transparent');
  });
  
  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveClass('w-4');
    expect(spinner).toHaveClass('h-4');
  });
  
  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveClass('w-8');
    expect(spinner).toHaveClass('h-8');
  });
  
  it('renders with extra large size', () => {
    const { container } = render(<LoadingSpinner size="xl" />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveClass('w-12');
    expect(spinner).toHaveClass('h-12');
  });
  
  it('renders with secondary color', () => {
    const { container } = render(<LoadingSpinner color="secondary" />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveClass('border-gray-600');
    expect(spinner).toHaveClass('border-t-transparent');
  });
  
  it('renders with white color', () => {
    const { container } = render(<LoadingSpinner color="white" />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveClass('border-white');
    expect(spinner).toHaveClass('border-t-transparent');
  });
  
  it('renders with black color', () => {
    const { container } = render(<LoadingSpinner color="black" />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveClass('border-black');
    expect(spinner).toHaveClass('border-t-transparent');
  });
  
  it('accepts additional className', () => {
    const { container } = render(<LoadingSpinner className="my-custom-class" />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveClass('my-custom-class');
  });
  
  it('has correct accessibility attributes', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild as HTMLElement;
    
    expect(spinner).toHaveAttribute('role', 'presentation');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });
});
