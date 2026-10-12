# QuickTyre reference layout

Direction comes from the screenshots and seven original images supplied by the user.

- Palette: charcoal #272727, light gray #ebebeb, medium gray #d9d9d9, and brand orange #ff6500. Orange on light surfaces uses a darker shade to keep small text readable.
- Typography: Barlow matches the reference's narrow, rounded sans serif body and headings. Poppins extra bold italic matches the oversized wordmark and expert banner.
- Layout: full viewport photo hero; 65.75/34.25 split journey; three flat photographic service columns; spacious charcoal testimonials; full width expert photograph; split form and portrait photograph; three column footer.
- Image overlays provide the darkened photographs visible in the reference and maintain heading contrast.
- Arrows reproduce the reference's directional service and quote links. The orange tire symbol repeats the supplied tire brand motif.
- Square corners, underlined inputs, no decorative shadows on page content. Dialog shadows indicate the elevated interaction surface.
- ENERGY 4 / RHYTHM 4 / MOTION 1. Photography and oversized italic type provide the energy; the varied split and full width sections set the rhythm. Motion is limited to hover feedback and optional smooth anchor scrolling, respecting reduced motion.
- Copy, reviews, names, contact details, and section order are transcribed from the user's screenshots.

The shared form validates required fields and posts requests to FormSubmit at the user's recipient, quicktyreltd@gmail.com. Sending, success and retry states remain on the page. Provider activation requires confirmation from the recipient's inbox.

## Services reference

- `/services` follows the supplied Services screenshots; the existing homepage and its anchors remain available.
- ENERGY 3 / RHYTHM 2 / MOTION 1: workshop photography carries the visual energy; the catalogue is regular, followed by a split contact section and the established footer.
- The white three-column catalogue and repeated square Contact Us buttons intentionally match the reference and give each tire category equal prominence (R-05, R-14).
- Barlow preserves the narrow reference body typography; upright Poppins bold matches the oversized OUR SERVICES heading (R-06).
- Charcoal navigation/footer and a light gray contact section reproduce the supplied fixed theme; orange identifies the current page and emergency number (R-01, R-21, R-29).
- Desktop spacing, landscape photo crops, and the 65.75/34.25 contact split follow the reference proportions. Tablet uses two catalogue columns; phone uses one (R-03, R-31).
- The header becomes solid when scrolling to keep the reference navigation readable over white content; anchors reserve its height (R-25, R-32).
- A subtle black header gradient keeps photo-backed navigation readable over bright image areas; emergency orange is #b34300 on light gray for AA text contrast (R-01, R-25).
- Globe and chevron identify the phone country selector; menu and close icons operate the mobile navigation. Existing dialog copy/check icons communicate clipboard action and success (R-04).
- Only hover/tap feedback and reduced-motion-aware anchor scrolling provide motion (R-19). Dialog shadows distinguish the existing elevated interaction surface (R-12).
- All nine headings and descriptions are verbatim from the screenshots, including the repeated Loader/Forklift description. No service claims or sections were added (R-38).
- Supplied originals are reused without image edits. The orange-lit workshop scene is used for the banner because the red-lit screenshot variant was not supplied; this remains a documented visual mismatch.

## Our Works reference

- `/our-works` follows the supplied gallery screenshots; `/ourworks` is also accepted. Original `/#our-work` remains available on the homepage.
- ENERGY 3 / RHYTHM 2 / MOTION 1: large photography and bold title lead into a short italic brand banner, split contact form and established footer.
- The gallery begins with the grader, blue tanker and white water truck shown in the reference. The center frame is full size, and adjacent frames scale to 85% following the user's refinement. All thirteen supplied photographs remain reachable; no captions or project claims are invented (R-23, R-38).
- Three portrait frames, approximately 549x740px at 1893px, have the reference's rounded corners. The larger center composition continues through tablet; phone shows one full-size photo. Cropping uses object-fit without changing the originals (R-03, R-11).
- Circular chevrons operate previous/next scrolling. Repeated photo cycles let either end advance one frame into the next cycle; after settling, the track resets instantly to identical frames. Copies are hidden from assistive technology, and the centered photo is announced. Arrow keys and native touch scrolling offer equivalent access (R-04, R-26, R-32).
- Gallery motion occurs only after a control action, respecting reduced motion. No autoplay competes with the photos (R-19).
- Contact proportions and form spacing are scaled to the new reference, retaining the shared 65.75/34.25 split, existing copy and quote workflow. Footer link spacing matches the screenshot while mobile targets retain 44px minimums (R-03, R-31).
- The italic banner text is transcribed exactly. Its dark image overlay maintains white-text contrast (R-06, R-25).
- The latest footer reference uses 22px body links, 28px headings, a 390px logo and 20px copyright at 1893px. Viewport-relative sizing scales the whole footer down on laptops, including its image, type and spacing. Services and Our Works share these proportions; mobile returns to readable 18px body text and 44px link targets (R-03, R-31).

## Scroll navigation reference

- All pages share a fixed, full-width navbar. After 30px of scrolling, a flat charcoal background follows the supplied reference and the request to remove its white top highlight (R-01, R-25, R-31).
- The upward offset follows scroll distance from 30px to the midpoint of the second visible content block: Our Journey on Home, and the title band on Services/Our Works. The bar is fully out of view at that midpoint. Beyond it, downward movement hides the bar and 160px upward travel restores it (R-19).
- A 360ms easing softens scroll-driven movement, while a 300ms overlay fade transitions the photo-backed bar into the supplied charcoal style. Reduced motion removes transition durations. ENERGY 3 / RHYTHM 2 / MOTION 1 remain the page direction (R-19).

## Smaller contact form refinement

- Contact typography and fields are reduced on all three pages at the user's request. Internal-page desktop heading scales to 60px maximum, body to 21px, labels to 17px, inputs to 50px and message to 112px. Mobile body/labels remain 16px and controls remain at least 44px tall. The shared Home form also uses smaller type and fields (R-03, R-25, R-31, R-32).

## Contact page reference

- `/contact` follows the supplied workshop banner, Get in Touch heading, full-width gray form and compact shared footer. Header/footer Contact links and all nine Services Contact Us buttons open this route; Home quote links still reach its own form (R-24, R-31).
- The form uses the screenshot's optional name/phone fields, required email/message, field placeholders and half-width Submit button. On phones, fields and button stack. FormSubmit provides real submission with pending, success and retry states (R-03, R-26, R-27, R-32).
- The supplied larger PNG replaces the footer logo on all pages. CSS crops its transparent vertical margins to preserve the existing footer footprint; the original file is unchanged (R-23, R-31).
- ENERGY 3 / RHYTHM 2 / MOTION 1: workshop photography, a clear heading and a flat full-width form follow the established palette and typography. The shared navbar scroll behavior applies here as well; its second section is the contact form.
- Keyboard focus reveals the bar and prevents it hiding while navigation has visible focus. The open mobile drawer also holds it visible; mobile sizes preserve content space and anchors reserve header height (R-03, R-32).

## Scroll layering, reveals and country selector

- The Home hero is pinned while Our Journey covers it. The testimonials remain pinned while the Certified Experts photo covers them. Each pair has its own wrapper, so sections stop pinning after the next section covers them. Taller sections pin at their bottom to retain access to all text (R-03, R-19).
- Text slides upward 24px while fading once on viewport entry; photos fade without shifting their crops. Controls retain their normal geometry. Reduced motion shows all content immediately and disables the overlap behavior. No autoplay was added (R-19, R-32).
- Home hero text follows the user's latest refinement: it travels 40px from left to right while fading with ease-in timing. Other sections retain upward reveals, and keyboard focus bypasses transitions (R-19, R-32).
- The user's animation request changes MOTION to 2. Current dials are Home ENERGY 4 / RHYTHM 4 / MOTION 2 and internal pages ENERGY 3 / RHYTHM 2 / MOTION 2; these supersede the earlier motion direction.
- The country dropdown follows the supplied light-gray panel, italic bold list, flags and search field. Country names come from Intl.DisplayNames and dialing codes from libphonenumber-js; local SVG flags come from country-flag-icons with its license. Search supports names, codes and dialing prefixes; keyboard arrows, Enter and Escape operate the list. Dropdown shadow indicates its temporary elevated surface (R-04, R-06, R-12, R-23, R-26, R-32).
- Footer Facebook links use the exact user-supplied business URL. The footer logo uses the user's higher-resolution original; no new visual identity was generated.

## Home hierarchy and Journey fit refinement

- Reading this as a mobile tire-service homepage for drivers and fleet operators, with the established photographic charcoal/orange identity: ENERGY 3 / RHYTHM 3 / MOTION 2. These values use the skill's three-level scale and supersede the earlier out-of-range Home values.
- Proximity groups the brand, service headline and quote action in one block; common left alignment guides reading from name to service to action (R-05, R-31).
- The service message becomes the page's primary heading and largest text. The smaller italic name retains the existing brand voice without competing with the message (R-06, R-20).
- An asymmetric composition keeps the text left and the original wheel photograph visible on the right. A stronger dark overlay behind the copy provides figure-ground separation and text contrast (R-01, R-25).
- Larger space around the group separates it from navigation; smaller gaps within it express the relationship between the headline and quote link. Phone layouts use the available width and wrap naturally (R-03, R-31).
- Journey copy uses smaller type, closer heading/body spacing and reduced padding. Its gray row sizes to the text rather than a percentage, keeping the complete paragraph inside its own surface at all widths (R-03, R-25).
- All supplied words and photographs remain in use. The requested left-to-right ease-in hero reveals and scroll layering remain active, with reduced-motion support (R-19, R-23, R-38).

## Home hero restoration

- The user's latest instruction restores the previous hero: oversized italic Quicktyre at the lower left, service message and quote link on the right, and the original uniform photo shading. This supersedes the grouped hero arrangement above (R-31).
- Phone layouts restore the service message above the bottom wordmark. Left-to-right ease-in reveals remain active; the Journey content-sizing and smaller spacing fix remains in place (R-03, R-19).
- Home retains ENERGY 3 / RHYTHM 3 / MOTION 2: original bold brand typography, photographic split sections and requested scroll motion.

## Centered Home wordmark

- The latest request centers Quicktyre in the hero photograph, retaining its original large italic type. The service text sits below the wordmark to keep the two blocks separate (R-03, R-31).
- On short desktop viewports, smaller service text and closer quote spacing reserve room below the centered wordmark. Phones retain their smaller wordmark and left-aligned service copy (R-03).
- CSS transform handles centering independently of the existing left-to-right ease-in translate animation; reduced motion retains the centered position (R-19, R-32).

## Separate submission emails

- Each FormSubmit request sends a subject containing a UTC timestamp and short random identifier. Distinct subjects keep independent new submissions from being grouped as one Gmail conversation. Existing conversations are unaffected; recipient and message fields remain the same (R-26, R-31).
- The latest request makes Message optional on every form and removes the earlier generated quote sentence. An empty textarea submits an empty message; the Contact label no longer has a required asterisk. Email validation remains required (R-26, R-27, R-38).
- The latest recipient change sends Contact Submit and all Get a Quote requests to quicktyreltd@gmail.com. Both FormSubmit endpoints and the submission-error email link use this business address (R-24, R-26).
