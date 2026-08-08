import { onPageReady } from './utils/lifecycle';

function bindPrintButtons() {
  document.querySelectorAll<HTMLButtonElement>('.print-month-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const table = btn.closest('details')?.querySelector('table');
      if (!table) return;

      const month = btn.dataset.month ?? '';
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) return;

      printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${month} Deep-Sky Targets — PAS Star Tours</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 2rem; color: #111; }
      h1 { font-size: 1.25rem; margin-bottom: 1rem; }
      table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
      th, td { text-align: left; padding: 0.4rem 0.75rem; border-bottom: 1px solid #ccc; }
      th { text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.03em; }
    </style>
  </head>
  <body>
    <h1>${month} Deep-Sky Targets — PAS Star Tours</h1>
    ${table.outerHTML}
  </body>
</html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    });
  });
}

export function initStarToursPrint(): void {
  onPageReady(bindPrintButtons);
}
