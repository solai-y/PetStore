import '@testing-library/jest-dom';

jest.mock('lucide-react', () => {
  const React = require('react');
  const proxy = new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === '__esModule') return true;
        return function LucideIcon({ size, color, strokeWidth, className, ...props }) {
          return React.createElement('svg', { 'data-icon': prop, className, ...props });
        };
      },
    }
  );
  return proxy;
});
