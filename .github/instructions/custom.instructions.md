---
applyTo: '*HTML, CSS, JS*'
---
When generating HTML, CSS, or JS, follow these rules:
1. For all CSS:
   - Use **relative units** like `em`, `rem`, `%`, or `vh/vw` (never use px unless necessary for borders or shadows).
   - Always define a **font-size on the `body` element** (e.g., `body { font-size: 1em; }`).
   - In every container, section, or wrapper, set a `font-size` so that children using `em` units scale correctly.
   - Use **semantic HTML tags** (`<header>`, `<main>`, `<section>`, etc.).
   - Use **Flexbox or Grid** for layout, optimized for **responsive design**.
   - Avoid fixed heights and widths unless necessary — use max-width, auto margins, and responsive layouts.
   - Always include a `meta viewport` tag in HTML.
   - Code should follow **standard practices** (no experimental or deprecated properties).

2. For HTML:
   - Keep it semantic, accessible, and responsive.
   - Include only necessary classes and IDs.

3. For JS:
   - Use standard DOM methods (e.g., `document.querySelector`, `addEventListener`).
   - Keep scripts modular and avoid inline JS.
