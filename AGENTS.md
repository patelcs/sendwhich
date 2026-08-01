<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Theming and color rules

- All colors (including brand/accent colors, not just backgrounds/borders/text) must be defined as CSS custom properties in `app/globals.css`, once in `:root` (light theme) and, only when the value actually differs, overridden in `[data-theme='dark']`.
- Never hardcode a Tailwind color utility (e.g. `text-blue-500`, `bg-red-500`, `border-gray-300`) in component files. Reference the CSS variable instead, e.g. `text-(--brand)`, `bg-(--danger)/10`, `border-(--border)`. Tailwind's arbitrary-value opacity modifier (`/10`, `/30`, etc.) works directly on these variables, so there's no need for separate "soft"/opacity variants.
- Never branch on the `theme` value from `useTheme()` to pick between two color classes in JS (e.g. `theme === 'dark' ? 'text-gray-400' : 'text-gray-500'`). Theme-dependent color switching belongs entirely in `app/globals.css` via the `:root` / `[data-theme='dark']` variable overrides — the component just references the variable and the correct value resolves automatically. Only use `theme` for non-color decisions (e.g. choosing which icon to render).
