/**
 * Mock all shadcn/ui components with simple HTML equivalents.
 * Import this at the top of test files that render pages with shadcn components.
 */

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }) => <div className={className}>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...rest }) => (
    <button onClick={onClick} disabled={disabled} type={type || 'button'} {...rest}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, type, ...rest }) => <input id={id} type={type || 'text'} {...rest} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ id, ...rest }) => <textarea id={id} {...rest} />,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }) => <div className={className} />,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }) => (
    <div data-testid="select" onClick={() => onValueChange && onValueChange('pet-1')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => (
    <button data-value={value} role="option">{children}</button>
  ),
  SelectTrigger: ({ children }) => <div role="combobox">{children}</div>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-skeleton" />,
}));

jest.mock('@/components/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
  Toaster: () => null,
}));
