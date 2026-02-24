import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, className, children }) => {
  const navigate = useNavigate();

  return (
    <a 
      href={href} 
      className={className}
      onClick={(e) => {
        if (href.startsWith('/')) {
          e.preventDefault();
          navigate(href);
        } else if (href.startsWith('#')) {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            window.scrollTo({
              top: element.getBoundingClientRect().top + window.scrollY - 100,
              behavior: 'smooth'
            });
          }
        }
      }}
    >
      {children}
    </a>
  );
};