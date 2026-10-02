# Internal content and design audit

Source: original `index.html`, inspected 2026-10-02 before redesign.

## Factual content to preserve

- Identity: Raymond Iorliam, Full-stack developer; Abuja, Nigeria.
- Original hero eyebrow: “Full-stack & product-focused”. Name: “RAYMOND IORLIAM”.
- Original main hero text: “I design and ship elegant, responsive web experiences that help founders and teams present their work with polish and reliability. The goal is always thoughtful UX, clean engineering, and an outcome that feels premium.”
- Hero supporting copy: “I partner with product leads and founders to turn rough ideas into structured experiences: wireframes, UI, code, QA. Every engagement tracks scope, deliverables, and launch readiness.”
- Current focus: React, Node.js, Tailwind, AI APIs, Supabase.
- Existing stats: 5 product launches; 9 client touch points; 3+ years shipped. These are source claims, not independently verified.
- Resume: `./assets/docs/Iorliam Raymond Resume.pdf`.
- Education: B.Tech Software Engineering; Federal University Of Technology Minna; Ongoing. No education dates supplied in original source; do not invent dates.
- Education description: Currently pursuing a Bachelor of Technology in Software Engineering; building foundations in computer science, software development life cycles, engineering principles, and applying them to real-world full-stack projects.
- Existing stack: React, Node.js, JavaScript, CSS3, HTML5, Figma, Vercel, Git, Next.js, React Native, Python, Framer. User requests CSS3 -> Google Cloud services and Framer -> AWS.

## Project inventory

| Original name | Image relative to assets/images | Live URL | Code URL |
| --- | --- | --- | --- |
| Adonis Software Website | ADONIS SCREENSHOT.png | https://adonisoftware.tech | https://github.com/raymondstudio/adonis |
| Lerna AI | EDUAGENT AI BANNER.jpg | https://uselerna.app | https://github.com/raymondstudio/Lerna |
| Atrixia: AI Shopping Agent | atrixia_cover.png | https://atrixia.vercel.app | https://github.com/raymondstudio/TeamAtrixia |
| E-Commerce Website | Sendoatelier.jpg | https://sendoatelier.netlify.app | https://github.com/raymondstudio/E-commerce-task |
| New World Science | NWS.png | https://newworldscience.netlify.app | https://github.com/raymondstudio/Science-Blog |
| ScamGuard AI | ScamGuardAI.png | Coming soon (no live URL) | https://github.com/raymondstudio/SCAM-GUARD-AI |
| MoodPIx AI | MoodPix.jpg | https://moodpixai.netlify.app | https://github.com/raymondstudio/MoodSnap-AI |
| AI Image Generator | PictureGenAI.jpg | https://masteryourtasks.netlify.app | https://github.com/raymondstudio/Picture-Generating-AI |
| Personal AI Chatbot | MoreAI.png | ./pages/more.html | https://github.com/raymondstudio/render |

Original AI Image Generator demo URL appears mismatched to its name. Preserve it unless verified replacement is found; do not invent a destination. Lerna copy calls itself EduAgent, so use Lerna consistently in refreshed copy while retaining screenshot.

## Contact destinations

- WhatsApp (floating and section): https://wa.link/ejtszu
- Email: mailto:contact@raymondstudio.dev
- GitHub: https://github.com/raymondstudio
- X: https://x.com/Raymond_Xr
- Contact form: POST https://formspree.io/f/xandkoya; fields name (required), email (required), subject, message (required).
- New user-provided booking destination: https://calendly.com/raymondstudio

## Kevin reference lessons

Reviewed `C:/Users/USER/Desktop/CODE PROJECTS/Kevin Portfolio/src/components/Hero.tsx` and related CSS. Its split door technique uses two identical full-width typographic compositions, clipped by adjacent half-width panels. Each panel translates outward horizontally, revealing a separate portrait/content scene. This preserves one continuous name across the seam. The doors belong exclusively to a sticky hero with a finite scroll range. At 14% progress doors begin opening, complete around 76%; interior content appears around 50–78%. Interior portrait scales .88 to 1 and rises 80px. Reduced-motion mode bypasses the doors entirely and exposes the scene statically. Hidden interior links are inert until reveal; a keyboard-operable reveal button moves to the open state and focuses the work CTA.

## Verification recommendations

- Confirm doors only animate within hero; scroll onward normally with no page-wide curtains.
- Check name seam alignment, header contrast, and zero horizontal overflow at 1440px, 1024px, 768px, 390px, and 320px; include short landscape viewport.
- Verify hero reveal completes before sticky region ends, has a keyboard route, and exposes all meaningful copy without motion enabled or JS available.
- Keep project images `object-fit: contain`, with interior padding and restrained outer corners; avoid clipping screenshot content.
- Desktop contact rail should float left, ease into a measurable section slot, stay page-bound while contact is in view, and release into the viewport rail after passing it in either direction. Check resize and fast scroll.
- Hover intent text must also appear on focus; touch layout needs visible names, reachable 44px controls, and no interference with right-side WhatsApp/Book Me buttons.
- Verify all nine project assets and destinations, resume, form labels and required fields, submission pending/success/error UI without actually contacting Formspree.
- Respect reduced motion for doors, contact docking, reveals, and smooth anchor scrolling; no permanent hidden content on reduced-motion/no-JS paths.
