
import React from 'react';

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="animate-spin"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.75V6.25m0 11.5v1.5M17.75 6.25l-1.06 1.06M6.25 17.75l-1.06 1.06M20.25 12h-1.5M4.75 12h-1.5m14.44-4.75l-1.06-1.06M7.31 16.69l-1.06-1.06"
    />
  </svg>
);

export default SpinnerIcon;
