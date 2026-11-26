// Shared by the contact and checkout forms.
// - Tailwind class strings for fields and labels (used in the pages' markup).
// - Browser helpers for showing results: message boxes, the server's field errors, Turnstile reset.
// Nothing here runs on the server.
import { site } from '../data/site';

/** Input / select / textarea. Red border once the browser has flagged the field as invalid. */
export const fieldClass =
  'mt-1.5 block w-full rounded-xl border border-border bg-surface-raised px-3.5 py-3 text-base text-fg placeholder:text-fg-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 [&:user-invalid]:border-[#C81E1E]';
export const labelClass = 'block text-sm font-semibold';

/** A green (ok) or red (error) message box. `html` must be our own fixed text. */
export const messageBox = (tone: 'ok' | 'error', html: string) =>
  `<div class="rounded-xl border px-4 py-3 ${tone === 'ok' ? 'border-good bg-good/10' : 'border-[#C81E1E] bg-[#C81E1E]/10'}">${html}</div>`;

/** "call or text 204-…, WhatsApp us or email info@…" as links. */
export const contactLinksHtml = () =>
  `call or text <a class="font-semibold underline" href="${site.phone.href}">${site.phone.display}</a>, ` +
  `<a class="font-semibold underline" href="${site.whatsapp}">WhatsApp us</a> or email ` +
  `<a class="font-semibold underline" href="mailto:${site.email}">${site.email}</a>`;

/** Show the server's field messages as a list. They're inserted as text, never as HTML. */
export function showFieldErrors(status: HTMLElement, fields: Record<string, string>) {
  status.innerHTML = messageBox('error', '<strong>Please check:</strong><ul class="mt-1 list-disc pl-5" data-errors></ul>');
  const list = status.querySelector('[data-errors]')!;
  for (const message of Object.values(fields)) {
    const li = document.createElement('li');
    li.textContent = message;
    list.append(li);
  }
}

type Turnstile = { render(el: HTMLElement, opts: Record<string, string>): string; reset(): void };
const turnstile = () => (window as unknown as { turnstile?: Turnstile }).turnstile;

/** A Turnstile token works once: get a fresh one before the next try. */
export const resetTurnstile = () => turnstile()?.reset();

/**
 * Draw a Turnstile widget into `box` (explicit mode, for widgets inside a step that starts hidden).
 * Waits for Turnstile's script if it's still loading, then draws it once.
 */
export function renderTurnstile(box: HTMLElement, tries = 0): void {
  if (box.dataset.drawn) return;
  const ts = turnstile();
  if (!ts) {
    if (tries < 50) setTimeout(() => renderTurnstile(box, tries + 1), 200);
    return;
  }
  ts.render(box, { sitekey: box.dataset.sitekey!, theme: 'light', size: 'flexible' });
  box.dataset.drawn = 'true';
}
