# Matteapp — Project Instructions

## Om prosjektet
En matteapp for barn (Lineus, Lily og Kian) med et lekent design.
Startsiden ønsker barna velkommen og har en startknapp til oppgavesiden.
Oppgavesiden lar brukeren justere vanskelighetsgrad og generere matteoppgaver.

## Tech stack
- Next.js (App Router) with React
- pnpm for package management
- Jest for testing
- Styling: Tailwind CSS
- Language: Norwegian (UI text in Norwegian)

## Responsive design
The app must work in desktop and mobile browsers.

## Code guidelines
- Write and run tests incrementally (TDD) — tests should fail before implementing functionality. Use Jest.
- Prefer reasonably short functions.
- Avoid duplicated code.
- Prefer good variable and function/component names over comments. Use comments to explain concepts.

## Review process (after implementing 1–5 passing tests for a coherent concept)

### Phase 1: Look for errors and potential problems
Review the code for bugs. Follow the testing guidelines above.

### Phase 2: Refactor
This should not change behavior — run tests to verify.
- Factor out code duplication.
- Improve naming of concepts.
- Break up code into more manageable pieces.

# Commit after implementing a prompt
- The commit message should start with a short summary of what has been done
- The prompt should be included at the end of the commit message
- Never change the git history
