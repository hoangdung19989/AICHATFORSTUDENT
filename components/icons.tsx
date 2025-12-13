
import React from 'react';

type IconProps = {
  className?: string;
};

export const OnLuyenLogo: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="logo_gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD700" />
        <stop offset="1" stopColor="#FF8C00" />
      </linearGradient>
      <filter id="inset_shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feComponentTransfer in="SourceAlpha">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="2" />
        <feOffset dx="1" dy="2" result="offsetblur" />
        <feFlood floodColor="#995c00" result="color" />
        <feComposite in2="offsetblur" operator="in" />
        <feComposite in2="SourceAlpha" operator="in" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode />
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Squircle */}
    <rect x="5" y="5" width="90" height="90" rx="24" fill="url(#logo_gradient)" stroke="#FFFFFF" strokeWidth="2" />
    
    {/* Graduation Cap */}
    <path 
      d="M50 25L20 40L50 55L80 40L50 25Z" 
      fill="#FFFFFF" 
      stroke="#995c00" 
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path 
      d="M80 40V55C80 55 70 60 50 60C30 60 20 55 20 55V40" 
      stroke="#FFFFFF" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
    />
    <path d="M80 40V65" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Star / Spark (Representing AI) */}
    <path 
      d="M50 65L53 72L60 75L53 78L50 85L47 78L40 75L47 72L50 65Z" 
      fill="#FFFFFF"
    />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const BeakerIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.653.528-1.18 1.18-1.18s1.18.527 1.18 1.18v.324c0 .653-.528 1.18-1.18 1.18a1.18 1.18 0 01-1.18-1.18v-.324zM9.75 6.087c0-.653.528-1.18 1.18-1.18s1.18.527 1.18 1.18v.324c0 .653-.528 1.18-1.18 1.18a1.18 1.18 0 01-1.18-1.18v-.324zM12 4.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125S10.875 7.746 10.875 7.125v-1.5C10.875 5.004 11.379 4.5 12 4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v5.25m-3.75-5.25v5.25m7.5-5.25v5.25M3 13.5h18M3 17.25h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 10.5h17.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125v-5.25c0-.621.504-1.125 1.125-1.125z" />
  </svg>
);

export const CalculatorIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const GlobeAltIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 13.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12a8.959 8.959 0 01-2.157 5.253m0 0A11.953 11.953 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m7.843 2.918c-2.103 1.818-4.845 2.918-7.843 2.918A9.004 9.004 0 013.284 9.253" />
  </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export const PaperAirplaneIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const AcademicCapIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12v-2.5l11-6.111L23 9.5V12" />
    </svg>
);

export const CodeBracketIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
);

export const ChatBubbleLeftRightIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.372c-1.131.113-2.097.641-2.097 1.625V21L11.5 17.5 7.54 14.341A2.25 2.25 0 016 12.341V8.511c0-1.136.847-2.1 1.98-2.193l3.722-.372c1.131-.113 2.097-.641 2.097-1.625V3L16.5 6.5l3.75 3.159c.828.698 1.567 1.22 1.567 1.852zM3 4.5a2.25 2.25 0 00-2.25 2.25v7.5a2.25 2.25 0 002.25 2.25h.75a.75.75 0 00.75-.75v-8.25a.75.75 0 00-.75-.75h-.75z" />
    </svg>
);

export const ChatBubbleBottomCenterTextIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.09-.934.09-1.423A8.98 8.98 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const VideoCameraIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
  </svg>
);

export const PencilSquareIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const LightBulbIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a6.01 6.01 0 00-3.75 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

export const ArrowRightCircleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const ChartBarIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

export const KeyIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
);

export const QuestionMarkCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);

export const UserCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const DocumentTextIconOld: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const TowerIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5-3.75L12 3m0 0l-1.5 1.25M3 15.75l9 6 9-6M3 9v6.75m18-6.75v6.75M3 9l9 6 9-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5l8.25 6 8.25-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 19.5l8.25-6 8.25 6" />
    </svg>
);

export const XMarkIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const PlayCircleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
  </svg>
);

export const DocumentTextIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export const RobotIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* Ears */}
        <circle cx="4" cy="13" r="2" fill="#2A3F7A"/>
        <circle cx="20" cy="13" r="2" fill="#2A3F7A"/>
        {/* Head */}
        <circle cx="12" cy="13" r="8" fill="#38B2AC"/>
        {/* Face background */}
        <rect x="7" y="10" width="10" height="6" rx="3" fill="#E6FFFA" />
        {/* Eyes */}
        <circle cx="9.5" cy="13" r="1" fill="#2A3F7A"/>
        <circle cx="14.5" cy="13" r="1" fill="#2A3F7A"/>
        {/* Smile */}
        <path d="M10 15.5 C 12 17, 14 17, 16 15.5" stroke="#2A3F7A" strokeWidth="1" strokeLinecap="round" fill="none"/>
        {/* Antenna */}
        <line x1="12" y1="5" x2="12" y2="2" stroke="#2A3F7A" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="1.5" r="1" fill="#2A3F7A"/>
    </svg>
);

export const LeafIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75l-.478-6.138a.75.75 0 01.44-1.025l1.12-.448a.75.75 0 011.025.44l.29 1.16M13.5 3.75l.478 6.138a.75.75 0 01-.44 1.025l-1.12.448a.75.75 0 01-1.025-.44l-.29-1.16m0 0a9.042 9.042 0 00-2.122 6.198 9.01 9.01 0 001.353 4.832 9.01 9.01 0 004.832 1.353 9.042 9.042 0 006.198-2.122 3 3 0 00-1.25-5.25 3 3 0 00-5.25-1.25" />
  </svg>
);

export const HistoryIcon: React.FC<IconProps> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M10 1c-2.28 0-4.125 1.845-4.125 4.125v.5h-3.25v2h-1.25v2.875h17v-2.875h-1.25v-2h-3.25v-.5C14.125 2.845 12.28 1 10 1zM6.875 5.625V5.5C6.875 4.053 8.29 2.875 10 2.875s3.125 1.178 3.125 2.625v.125h-6.25zM2.375 12.375v4h15.25v-4h-15.25zM4.75 13.5h1.5v1.75h-1.5V13.5zm4.5 0h1.5v1.75h-1.5V13.5zm4.5 0h1.5v1.75h-1.5V13.5z"/>
  </svg>
);

export const ScienceIcon: React.FC<IconProps> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" d="M11.25 10.063c0-1.34.81-2.472 2.03-2.937.28-.108.28-.516 0-.624C12.06 6.04 11.25 4.907 11.25 3.568c0-.33.27-.6.6-.6s.6.27.6.6c0 .943.593 1.765 1.48 2.112.28.108.28.516 0 .624-1.22.465-2.03 1.598-2.03 2.937v.001c0 1.34-.81 2.472-2.03 2.937-.28.108-.28-.516 0 .624 1.22.465 2.03 1.597 2.03 2.937 0 .33-.27.6-.6.6s-.6-.27-.6-.6c0-.943-.593-1.765-1.48-2.112-.28-.108-.28-.516 0-.624.887-.347 1.48-1.17 1.48-2.112zM8.75 6.063c0-1.34.81-2.472 2.03-2.937.28-.108.28-.516 0-.624C9.56 2.04 8.75.907 8.75-.432c0-.33.27-.6.6-.6s.6.27.6.6c0 .943.593 1.765 1.48 2.112.28.108.28.516 0 .624-1.22.465-2.03 1.598-2.03 2.937v.001c0 1.34-.81 2.472-2.03 2.937-.28.108-.28-.516 0 .624 1.22.465 2.03 1.597 2.03 2.937 0 .33-.27.6-.6.6s-.6-.27-.6-.6c0-.943-.593-1.765-1.48-2.112-.28-.108-.28-.516 0-.624.887-.347 1.48-1.17 1.48-2.112z" clipRule="evenodd"/>
    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 10a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/>
  </svg>
);

export const CivicsIcon: React.FC<IconProps> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M10 2.5a.75.75 0 00-1.5 0V3.6a1.5 1.5 0 00-3 0V2.5a.75.75 0 00-1.5 0v1.1c0 1.53 1.015 2.805 2.4 3.148V8.12a.75.75 0 001.5 0V6.748c1.385-.343 2.4-1.618 2.4-3.148V2.5zM3.5 10a.75.75 0 011.5 0v3.15a1.5 1.5 0 003 0V10a.75.75 0 011.5 0v3.15c0 1.63-1.33 2.96-2.97 2.96h-.06c-1.64 0-2.97-1.33-2.97-2.96V10zm11.5 0a.75.75 0 011.5 0v3.15c0 1.63-1.33 2.96-2.97 2.96h-.06c-1.64 0-2.97-1.33-2.97-2.96V10a.75.75 0 011.5 0v3.15a1.5 1.5 0 003 0V10zM1 18.25A.75.75 0 011.75 17.5h16.5a.75.75 0 010 1.5H1.75a.75.75 0 01-.75-.75z"/>
  </svg>
);

export const LocalIcon: React.FC<IconProps> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h9.5A2.25 2.25 0 0117 4.25v11.5A2.25 2.25 0 0114.75 18h-9.5A2.25 2.25 0 013 15.75V4.25zM5.5 4h9a.5.5 0 01.5.5v11a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5z" clipRule="evenodd"/>
    <path d="M6.5 6.25a.75.75 0 01.75-.75h5a.75.75 0 010 1.5h-5a.75.75 0 01-.75-.75zM6.5 13.75a.75.75 0 01.75-.75h5a.75.75 0 010 1.5h-5a.75.75 0 01-.75-.75zM10 7.5a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5z"/>
  </svg>
);

export const TechnologyIcon: React.FC<IconProps> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M10 1a9 9 0 00-3.957 17.163l.5-1.428A7.5 7.5 0 1110 2.5a7.518 7.518 0 013.97 1.025l.894-.447A9.004 9.004 0 0010 1zm6.572 11.571a.75.75 0 01-1.06 1.06l-1.59-1.59a3 3 0 111.06-1.06l1.59 1.59zM12.5 12a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"/>
    <path d="M5.586 5.586a.75.75 0 011.06 0L8.5 7.439l-.004.004a4.5 4.5 0 016.364 6.364l.004-.004L16.717 12a.75.75 0 010 1.06l-1.47 1.47a.75.75 0 01-1.06 0L12.333 12.7a.75.75 0 010-1.06L14.5 9.475V9.47l-1.475-1.475-1.854 1.854-1.06-1.06 1.854-1.854L9.49 4.464 7.636 6.318l-1.06-1.06L8.43 3.404a.75.75 0 011.06 0l1.854 1.854 1.47-1.47a.75.75 0 011.06 0l1.47 1.47a.75.75 0 010 1.06l-1.854 1.854 1.06 1.06-1.854-1.854L10.55 10.55l-1.854-1.854-1.06 1.06 1.854 1.854-2.167 2.167a.75.75 0 01-1.06 0l-1.47-1.47a.75.75 0 010-1.06l1.854-1.854-1.06-1.06z"/>
  </svg>
);

export const InformaticsIcon: React.FC<IconProps> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" d="M3 5.25A2.25 2.25 0 015.25 3h9.5A2.25 2.25 0 0117 5.25v6.5A2.25 2.25 0 0114.75 14h-9.5A2.25 2.25 0 013 11.75v-6.5zM5.25 4.5a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h9.5a.75.75 0 00.75-.75v-6.5a.75.75 0 00-.75-.75h-9.5z" clipRule="evenodd"/>
    <path d="M9 14.25a.75.75 0 000 1.5h2a.75.75 0 000-1.5H9zM3.75 16a.75.75 0 01.75-.75h11a.75.75 0 010 1.5h-11a.75.75 0 01-.75-.75z"/>
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const RocketLaunchIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.95 14.95 0 00-5.84-2.56m0 0a14.95 14.95 0 00-2.56-5.84m2.56 5.84c-2.69.11-5.33-.56-7.38-2.56a6 6 0 017.38-5.84m0 0a6 6 0 012.56 5.84m0 0v4.82m0 0a14.92 14.92 0 005.84 2.56m-5.84-2.56a14.92 14.92 0 00-2.56 5.84" />
    </svg>
);

export const BookmarkIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
);

export const MapIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
  </svg>
);
