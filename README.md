# Digital Ocean Passport — Laut Sahabat Kita

A responsive, installable prototype for a three-island Laut Sahabat Kita pilot: Gili Bidara, Gili Range, and Gili Sarang.

## Run locally

Serve the folder with any static web server, for example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

The prototype stores changes in browser `localStorage`. Use the role switch at the bottom of the desktop sidebar, or tap the profile in the top-right corner on mobile, to move between the student experience and teacher dashboard. Run `localStorage.clear()` in the browser console to reset the demo.

## Prototype scope

- Student Digital Ocean Passport and longitudinal profile
- Online and field-learning routes across three islands
- Photo/reflection evidence submission
- Pending badge state and teacher approval workflow
- Responsive teacher overview, review queue, and student monitoring
- Offline shell caching as a Progressive Web App

The activity copy is representative pilot content derived from the supplied learning-journey brief. It is structured so final Guide Book and Activity Book text can replace it without changing the interaction model.
