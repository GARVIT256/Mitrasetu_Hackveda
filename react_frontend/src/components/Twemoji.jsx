import twemoji from 'twemoji';
import React from 'react';

export function Twemoji({ children, className = '', ...props }) {
  // Ensure children is a valid string
  const content = typeof children === 'string' ? children : '';

  // Render emoji as Twemoji SVG
  const parsed = twemoji.parse(content, {
    folder: 'svg',
    ext: '.svg',
    className: 'twemoji',
  });

  return (
    <span
      className={className + ' twemoji-normal'} // Add normalization class for emoji size
      {...props}
      dangerouslySetInnerHTML={{ __html: parsed }}
    />
  );
}
