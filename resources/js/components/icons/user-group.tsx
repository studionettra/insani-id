import React from 'react';

export const UserGroup = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className = 'w-5 h-5', ...props }, ref) => (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <path d="M17 21v-1a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1" />
            <path d="M19 10h1a2 2 0 0 1 2 2v1" />
            <path d="M5 10H4a2 2 0 0 0-2 2v1" />
            <circle cx="12" cy="11" r="3" />
            <circle cx="18" cy="4" r="2" />
            <circle cx="6" cy="4" r="2" />
        </svg>
    )
);

UserGroup.displayName = 'UserGroup';

export default UserGroup;
