# LARP Outfitter: Montreal & Québec (Hackathon Demo)

A bilingual (French/English) in-app shop for LARP players living in Montreal and the rest of Quebec, centred on LARP events in Quebec. Players see AI previews of themselves in costumes, makeup and weapons from a selfie, then buy everything in one checkout.

## Who it's for
- LARP players who live in Montreal or elsewhere in Quebec and are getting ready for an event in Quebec.
- Newcomers who are not sure what character to play or what to buy.
- Hackathon judges and the team, who want to compare two shopping flows: "pick items myself" and "get interviewed and receive recommendations".

## Core features and experience
- **French and English**: A FR/EN switch is always visible. The app opens in French by default, or in English if the browser is set to English, and remembers the choice. All screens, the AI interview, recommendations, event descriptions and order confirmations follow the chosen language.
- **Sign in with Google**: Each person has their own saved profile, selfie, looks, cart and orders.
- **Player profile**: City or region in Quebec, plus gender, height, weight and budget (CAD), entered once and editable. These details shape recommendations and the AI preview (body type and fit).
- **Quebec only**: During setup, players confirm they live in Quebec. Checkout accepts only Quebec shipping addresses, and anyone outside Quebec sees a friendly "Quebec only for now" message.
- **Event finder**: A list of LARP events in Quebec within roughly 3 to 4 hours' drive of Montreal (for example the Laurentians, Eastern Townships, Québec City and Mauricie). Each event shows name, dates, location, distance from Montreal, genre, a short description and the organizer link. AI searches the web in French and English to find events. Each event shows a "last checked" date and a source link, and a "Refresh events" action runs a new search.
- **Our shop**: Every item is sold directly in the app, across four categories: camping gear, costumes, makeup and weapons (LARP-safe foam/latex). Each item has an image, name and description in both languages, and a price that matches what the same item typically costs from other retailers.
- **Cart and checkout**: Items from any look go into one cart. Players pay with a card through Stripe in test mode, with Quebec sales taxes (GST + QST) added at checkout, then see an order confirmation and order history. No real money moves in the demo.
- **Selfie upload and AI look preview**: AI creates a realistic image of the player wearing their chosen costume, makeup and weapon. Camping gear is listed with the look but is not drawn on the person. Previews are saved to a personal gallery.
- **Flow A: Build your look**: Pick an event (optional), choose categories, add items, see the running total against the budget, create the preview, then add everything to the cart.
- **Flow B: Character interview**: A short AI chat in the player's language asks about the character type, role (fighter, mage, healer, rogue...), the event's genre and tone, and preferences. It then suggests a character concept with a full set of shop items within budget. The player can swap items, create the preview and add the set to the cart.
- **Gear list per event**: A checklist of everything in the look plus camping items, with the total cost and a single "Add all to cart" button.

## User flow
1. Choose French or English, sign in with Google, confirm you live in Quebec, then fill in the profile (city/region, gender, height, weight, budget) and upload a selfie.
2. Browse LARP events in Quebec and optionally attach one to the current look.
3. Choose **Build your look** or **Character interview**.
4. Pick or receive items across the selected categories, staying within budget.
5. Create the AI preview, then regenerate or swap items as needed.
6. Add the look to the cart, check out with Stripe (test card, Quebec address), and see the order confirmation.

## UI/UX feel
A dark, atmospheric "adventurer's outfitter" style: parchment and leather textures, ember-coloured accents, bold display type for headings and clean readable body text. Layouts leave room for French text, which is longer. The site works on phones first. Two clear entry cards side by side give the two flows equal weight. Previews and product images are shown large, and the cart is always one tap away.

## Implementation phases
**Phase 1 (MVP, built now)**
- French/English throughout, including the AI content.
- Google sign-in, Quebec residency check, player profile and selfie upload.
- AI-searched LARP events in Quebec, with a refresh action and source links.
- In-app shop with bilingual sample items across the 4 categories.
- Flow A (build your look) and Flow B (AI character interview with recommendations).
- AI selfie preview and a saved looks gallery.
- Cart, Stripe checkout in test mode limited to Quebec addresses, order confirmation and order history.

**Phase 2**
- Admin page to manage products, prices and stock, approve AI-found events, and view orders.
- Usage comparison between Flow A and Flow B (starts, finished previews, items added to cart, completed purchases).
- Shipping options, local pickup in Montreal, and delivery tracking.

**Phase 3**
- Gear rentals for one-off events, and bundles per event.
- Sharing looks with a LARP group.
- Expanding beyond Quebec.

## Assumptions
- "Only people in Montreal and Quebec" means players confirm they live in Quebec, shipping is limited to Quebec addresses, and only events in Quebec are listed. Events across the border in Ontario or the US are excluded even if they are within 3 to 4 hours.
- Residency is confirmed by the player during setup and enforced by the shipping address at checkout. Location is not detected automatically.
- French is the default language, and English is one tap away. The AI replies in whichever language is selected.
- This is a demo. Stripe runs in test mode, so payments use test cards and no real money is charged or goods shipped. The team can claim the Stripe account later to go live.
- Stripe calculates GST and QST at checkout, for about 0.5% per transaction, and the team files the returns. A no-tax-help option is also available. Full tax handling by Stripe is not offered because the goods are physical.
- Prices are in CAD and set to match typical prices from other retailers. The product list is a starting set of realistic sample items that can be edited. Stock is not tracked, and there is no delivery fee in the demo.
- AI-found events may be incomplete or out of date, so each event shows its source link and last-checked date.
- Each player has one selfie, which can be replaced. Height and weight shape the body in the preview only when the player has given them.
- Profile details are private to each user.
- AI features use the Emergent universal key, with no keys needed from the team.
