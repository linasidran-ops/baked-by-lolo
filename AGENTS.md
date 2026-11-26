# AGENTS.md · baked by Lolo.

Instructions for any AI coding agent working on this project.

## Who you are working with

The owner is not a technical person and prefers Arabic.

- Think and work in English. Reply to the owner in Arabic only.
- After every change, explain in simple Arabic what you changed and why, in a few lines.
- When there is a choice to make, list the options in non-technical language and let the owner choose.
- For anything the owner must do outside the code (an account, a setting, an upload), give step-by-step instructions.

## Source of truth

- `PRD.md`: what the store must do and for whom.
- `SPEC.md`: how it is built: data model, access rules, business rules, acceptance tests.
- Do not add any feature that is not in `SPEC.md` without asking the owner first. Put new ideas under "Next version" and ask.

## Rules

- One change at a time. Finish it, test it, explain it, then move to the next.
- Save every change as its own commit with a clear message, so it can be rolled back.
- Use sample data only while testing. Never ask for or store real personal data, card numbers or bank details.
- Keep everything in the single `index.html`: no build step, no external libraries.
- Keep the page Arabic and right to left, and test it on a phone-sized screen.
- Escape every value that comes from the database or a user before putting it on the page.
- Never weaken the database access rules in `SPEC.md` section 4.
- Code comments in Arabic.
- Run the acceptance tests in `SPEC.md` section 8 before saying a change is done.
