import { Link, type LinkProps } from 'react-router-dom';
import type { ButtonProps } from 'react-bootstrap';

type NavButtonProps = LinkProps & Pick<ButtonProps, 'variant' | 'size' | 'className' | 'children'>;

export function NavButton({ variant = 'primary', size, className = '', children, ...linkProps }: NavButtonProps) {
  const sizeClass = size ? ` btn-${size}` : '';
  const variantClass = variant.startsWith('outline-') ? `btn-${variant}` : `btn-${variant}`;
  return (
    <Link
      {...linkProps}
      className={`btn ${variantClass}${sizeClass} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
