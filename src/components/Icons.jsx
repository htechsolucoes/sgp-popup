const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

export const IconCopy = props => (
  <svg {...base} {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const IconCheck = props => (
  <svg {...base} {...props}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export const IconRefresh = props => (
  <svg {...base} {...props}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
);

export const IconPin = props => (
  <svg {...base} {...props}>
    <path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconDownload = props => (
  <svg {...base} {...props}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

export const IconReceipt = props => (
  <svg {...base} {...props}>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);

export const IconQrcode = props => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
  </svg>
);

export const IconAlert = props => (
  <svg {...base} {...props}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const IconPower = props => (
  <svg {...base} {...props}>
    <path d="M12 2v10" />
    <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
  </svg>
);

export const IconRouter = props => (
  <svg {...base} {...props}>
    <rect x="2" y="13" width="20" height="8" rx="2" />
    <path d="M6 17h.01M10 17h.01M15 13V9M8.5 6.5a5 5 0 0 1 7 0M6 4a8.5 8.5 0 0 1 12 0" />
  </svg>
);

export const IconPlug = props => (
  <svg {...base} {...props}>
    <path d="M9 2v6M15 2v6M7 8h10v4a5 5 0 0 1-10 0z" />
    <path d="M12 17v5" />
  </svg>
);

export const IconWifi = props => (
  <svg {...base} {...props}>
    <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0" />
    <path d="M12 20h.01" />
  </svg>
);

export const IconEye = props => (
  <svg {...base} {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = props => (
  <svg {...base} {...props}>
    <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2" />
    <path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a10.8 10.8 0 0 0 5.4-1.4" />
  </svg>
);

export const IconEdit = props => (
  <svg {...base} {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const IconLockOpen = props => (
  <svg {...base} {...props}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 7.8-1.3" />
  </svg>
);