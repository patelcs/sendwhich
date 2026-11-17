<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Theming and color rules

- All colors (including brand/accent colors, not just backgrounds/borders/text) must be defined as CSS custom properties in `app/globals.css`, once in `:root` (light theme) and, only when the value actually differs, overridden in `[data-theme='dark']`.
- Never hardcode a Tailwind color utility (e.g. `text-blue-500`, `bg-red-500`, `border-gray-300`) in component files. Reference the CSS variable instead, e.g. `text-(--brand)`, `bg-(--danger)/10`, `border-(--border)`. Tailwind's arbitrary-value opacity modifier (`/10`, `/30`, etc.) works directly on these variables, so there's no need for separate "soft"/opacity variants.
- Never branch on the `theme` value from `useTheme()` to pick between two color classes in JS (e.g. `theme === 'dark' ? 'text-gray-400' : 'text-gray-500'`). Theme-dependent color switching belongs entirely in `app/globals.css` via the `:root` / `[data-theme='dark']` variable overrides — the component just references the variable and the correct value resolves automatically. Only use `theme` for non-color decisions (e.g. choosing which icon to render).

# Mini app (World App) constraints

- In the mini app build (`NEXT_PUBLIC_IS_MINIAPP=true`, `uiConfigs` = `configs/ui-configs/minikit.ts`), MiniKit `sendTransaction` can only call contracts whitelisted in the World Developer Portal → Mini App → Permissions → **Contract Entrypoints**. For an ERC20 transfer that is the token contract itself; the Permit2 Tokens list only covers Permit2 signature transfers. A call to anything else fails with `invalid_contract` (`TransactionError` code `NotWhitelisted`).
- Whitelisting is manual and can't be done at runtime, so **the mini app must never interact with an arbitrary, user-supplied token or contract**. Any feature that lets the user enter, paste, import or save a token/contract address (forms, pickers, address-book entries, URL params, …) must, in the mini app, be limited to the predefined lists in `configs/chain/*` (which are expected to be whitelisted). Do this by default for every new feature, without being asked.
- Gate such differences with a flag on `AdapterConfigs` (`configs/ui-configs/types.ts`, set in `browser.ts` and `minikit.ts`) rather than ad-hoc `env.isMiniApp` checks in components. Existing flags/examples: `customTokenInput` (Send token field is pick-only), `dashboardAddButton`, `defaultsFilter`, the contacts-only "More" address-book menu, and `ADDRESS_CATEGORIES` (contacts-only recipient picker).
- Not affected: native ETH transfers (`NATIVE_TOKEN_ADDRESS`, a plain value transfer with no contract call) and sending to any recipient wallet address.
- When adding a World Chain token/contract to the defaults, remind the user to add its address to Contract Entrypoints in the Developer Portal.
