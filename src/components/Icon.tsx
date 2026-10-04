import type { CSSProperties } from 'react'

const paths = {
  print: 'M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7v-7Zm10-3h.01',
  fold: 'M4 4h11l5 7-5 9H4l5-9-5-7Zm5 7h11M4 4l5 7-5 9',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  open: 'm8 8 4-4 4 4m-4-4v16m-4-4 4 4 4-4M4 12h2m12 0h2',
  reset: 'M4 10a8 8 0 1 1 1 7M4 4v6h6',
  check: 'm5 12 4 4L19 6',
  heart: 'M12 20S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z',
  help: 'M9 8a3 3 0 1 1 4 3c-1 .5-1 1-1 3m0 3h.01',
  close: 'm6 6 12 12M6 18 18 6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  star: 'm12 2 2.8 6.2L22 9l-5.3 4.8 1.5 7.2L12 17.4 5.8 21l1.5-7.2L2 9l7.2-.8L12 2Z',
  leaf: 'M5 20C-2 5 10 2 21 3c0 11-4 19-13 14M5 20l10-11',
  settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
}

export function Icon({
  name,
  size = 20,
  style,
  className,
}: {
  name: keyof typeof paths
  size?: number
  style?: CSSProperties
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  )
}
