'use client';

import { useState, type FormEvent } from 'react';
import { CONTACT, ENQUIRY_EVENT_OPTIONS } from '@/lib/site';

/**
 * Enquiry form. There is no server behind this site yet, so submitting opens the visitor's
 * own email app with the enquiry written out and addressed to CONTACT.email.
 * To collect enquiries directly, replace `send` with a POST to your form service or API route.
 */
export function EnquiryForm() {
  const [sent, setSent] = useState(false);

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    const optional = (label: string, key: string) => (get(key) ? [`${label}: ${get(key)}`] : []);
    const lines = [
      `Name: ${get('name')}`,
      `Phone: ${get('phone')}`,
      ...optional('Email', 'email'),
      `Event: ${get('type')}`,
      ...optional('Date', 'date'),
      ...optional('City or venue', 'place'),
      ...optional('Guests', 'guests'),
      '',
      get('message'),
    ];
    const subject = `Event enquiry: ${get('type')} (${get('name')})`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    setSent(true);
  };

  return (
    <form className="form" onSubmit={send}>
      <div className="field">
        <label htmlFor="f-name">Your name</label>
        <input id="f-name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="f-phone">Phone or WhatsApp</label>
        <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required />
      </div>
      <div className="field">
        <label htmlFor="f-email">
          Email <span className="field__optional">optional</span>
        </label>
        <input id="f-email" name="email" type="email" autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="f-type">Type of event</label>
        <select id="f-type" name="type" defaultValue={ENQUIRY_EVENT_OPTIONS[0]}>
          {ENQUIRY_EVENT_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-date">
          Event date <span className="field__optional">optional</span>
        </label>
        <input id="f-date" name="date" type="date" />
      </div>
      <div className="field">
        <label htmlFor="f-guests">
          Guests <span className="field__optional">optional</span>
        </label>
        <input id="f-guests" name="guests" type="number" min={1} inputMode="numeric" placeholder="e.g. 250" />
      </div>
      <div className="field field--wide">
        <label htmlFor="f-place">
          City or venue <span className="field__optional">optional</span>
        </label>
        <input id="f-place" name="place" type="text" />
      </div>
      <div className="field field--wide">
        <label htmlFor="f-message">What do you have in mind?</label>
        <textarea id="f-message" name="message" rows={4} />
      </div>
      <div className="form__foot field--wide">
        <button type="submit" className="button button--solid">
          Send enquiry
        </button>
        <p className="form__note" role="status">
          {sent
            ? 'Your email app should now be open with the enquiry ready to send. If nothing opened, write to us at the address on this page.'
            : 'This opens your email app with your enquiry filled in.'}
        </p>
      </div>
    </form>
  );
}
