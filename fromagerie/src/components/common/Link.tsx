import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

type RouterLinkTo = React.ComponentPropsWithoutRef<typeof RouterLink>['to'];

type ScrollTarget = 'top' | 'bottom';

type LinkProps = Omit<React.ComponentPropsWithoutRef<typeof RouterLink>, 'to'> & {
  to?: RouterLinkTo;
  href?: RouterLinkTo;
  /** If true, opens in a new tab (sets target and rel defaults). */
  newTab?: boolean;
  /** When set, clicking smooth-scrolls window to the top or bottom of the page. */
  scroll?: ScrollTarget;
};

const isHashHref = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('#') && value.length > 1;

const scrollToTarget = (target: ScrollTarget) => {
  if (typeof window === 'undefined') return;
  window.scrollTo({
    top: target === 'bottom' ? document.body.scrollHeight : 0,
    behavior: 'smooth',
  });
};

const scrollToAnchor = (hash: string) => {
  if (typeof document === 'undefined') return;
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export const Link = React.forwardRef<HTMLElement, LinkProps>(
  ({ to, href, newTab = false, scroll, target, rel, onClick, children, ...rest }, ref) => {
    const finalTarget = newTab ? (target ?? '_blank') : target;
    const finalRel = newTab ? (rel ?? 'noopener noreferrer') : rel;

    if (to !== undefined && to !== null && to !== '') {
      return (
        <RouterLink
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={to}
          target={finalTarget}
          rel={finalRel}
          onClick={onClick}
          data-link-type='route'
          data-link-href={typeof to === 'string' ? to : undefined}
          data-link-target={finalTarget}
          {...rest}
        >
          {children}
        </RouterLink>
      );
    }

    if (href !== undefined && href !== null && href !== '') {
      const hrefStr = typeof href === 'string' ? href : '';
      const isInPageAnchor = isHashHref(hrefStr);

      const handleAnchorClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        if (isInPageAnchor) {
          e.preventDefault();
          scrollToAnchor(hrefStr);
        }
        onClick?.(e as React.MouseEvent<HTMLAnchorElement>);
      };

      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={hrefStr}
          target={isInPageAnchor ? undefined : finalTarget}
          rel={isInPageAnchor ? undefined : finalRel}
          onClick={handleAnchorClick}
          data-link-type={isInPageAnchor ? 'section' : 'url'}
          data-link-href={isInPageAnchor ? hrefStr.slice(1) : hrefStr}
          data-link-target={isInPageAnchor ? undefined : finalTarget}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    if (scroll === 'top' || scroll === 'bottom') {
      const handleScrollClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        e.preventDefault();
        scrollToTarget(scroll);
        onClick?.(e as React.MouseEvent<HTMLAnchorElement>);
      };

      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          role='button'
          onClick={handleScrollClick}
          data-link-type='scroll'
          data-link-href={scroll}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return <>{children}</>;
  }
);

Link.displayName = 'Link';