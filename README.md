# bid-bench
This repository contains the latest version of the bid-o-matic app
**Bid Bench** — a reusable RFP builder for focus group bids, with a form on the left and a live proposal document on the right.

How it's organized:

- **Your Company** — letterhead info (name, tagline, preparer, contact) that stays the same across bids
- **Client & Project** — client company, contact, project title, background/objectives
- **Methodology** — study type (in-person/online/hybrid/IDIs), number of groups, respondents per group, session length, markets
- **Sample & Recruiting** — target audience, screening criteria, incidence rate, recruitment method, over-recruit %, honorarium
- **Facility & Logistics** — facility type, locations, viewing room, recording, translation
- **Timeline** — add/remove milestones with dates
- **Deliverables** — checklist (topline, full report, video highlights, transcripts, banners, recordings, debrief, presentation)
- **Investment** — itemized or lump-sum pricing with add/remove line items, auto-totaled
- **Terms** — payment terms, cancellation policy, quote validity
- **Output Style** — three document themes (Formal Navy, Modern Teal, Minimal Mono) plus toggles for which sections show up in the final doc (cover page, terms, about-us appendix)

The right-hand preview updates live as you type, formatted like an actual client-ready proposal. "Copy text" grabs a plain-text version for pasting into email, and "Download document" saves a styled standalone HTML file you can open in a browser and print to PDF or hand off to whoever finalizes it.

It's reusable — hit "New bid" to reset for the next RFP while keeping your company info pattern intact (you'll just re-enter it, or you could hardcode your letterhead as the default if you want it to persist automatically every time you open it).

A couple of things worth deciding since I made assumptions: I defaulted the placeholder company to a fictional "Meridian Field Research" — swap that for your actual company details, and let me know if you'd rather it start blank instead of pre-filled with sample copy.
