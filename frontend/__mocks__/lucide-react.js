const React = require('react');

module.exports = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === '__esModule') return true;
      if (prop === 'default') return {};
      return function LucideIcon({ size, color, strokeWidth, ...props }) {
        return React.createElement('svg', { 'data-icon': prop, ...props });
      };
    },
  }
);
