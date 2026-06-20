/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['DM Mono', 'monospace'],
        mono:    ['DM Mono', 'monospace'],
      },
      colors: {
        background:        'hsl(var(--background))',
        foreground:        'hsl(var(--foreground))',
        card:              { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover:           { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary:           { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary:         { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted:             { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent:            { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive:       { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border:            'hsl(var(--border))',
        input:             'hsl(var(--input))',
        ring:              'hsl(var(--ring))',
        glow:              'hsl(var(--glow))',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg:      'calc(var(--radius) + 6px)',
        sm:      'calc(var(--radius) - 2px)',
        full:    '9999px',
      },
      boxShadow: {
        glow:    '0 0 24px -4px hsl(var(--glow) / 0.55)',
        'glow-lg': '0 0 40px -6px hsl(var(--glow) / 0.6)',
      },
    },
  },
  plugins: [],
}
