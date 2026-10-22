# Guia do Luto

**A free, plain-language step-by-step guide for low-income Brazilian families after a death in the family.**

## Purpose

When someone dies, families face deadlines and paperwork at the worst possible moment: registering the death, telling the INSS, claiming a survivor's pension within 90 days, and dealing with debts and inheritance. Low-income families often lose rights or money simply because nobody told them what to do, or they fall for people charging to "speed up" free services.

In seven simple questions the guide shows only the steps that apply to that family, grouped by time (first 24 hours, first week, first month, the following months), with deadlines, rights and free places to get help (CRAS, Defensoria Pública, INSS 135). Steps can be ticked off and the list sent by WhatsApp.

## Principles

- Free, no registration, no ads, no cookies.
- No names, ID numbers or details about the deceased are asked for or stored. Answers stay on the phone.
- Compassionate, non-judgemental tone.
- Guidance, not legal advice. **Status: prototype, content under review by a lawyer.**

## Files

| File | Purpose |
|---|---|
| `index.html` | The page |
| `app.js` | Questions, steps, texts and feedback |
| `style.css` | Colours and typography |
| `_headers` | Security headers |
| `functions/api/feedback.js` | Stores "Did this guide help?" and an optional comment in Cloudflare D1 (binding `DB`); creates its own tables |

Feedback stores yes/no, the codes of the steps shown, the optional comment (long digit sequences are removed) and the date. Answers to the questions and IP addresses are not stored.

Hosting: Cloudflare Pages connected to GitHub, framework preset None, no build command.
