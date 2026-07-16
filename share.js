/* ============================
   Keyfetti - Sharing
   ============================

   The viral loop, such as it is: a parent shares their child's score, the link
   carries the score as ?c=<n>, and whoever opens it lands on a challenge to beat.
   No backend, no accounts, no analytics — the only thing that ever leaves the
   device is a single number, and only when someone taps Share.

   Kept out of main.js because none of this needs the game state: it's string and
   URL building plus one browser-API call, and main.js is long enough already. */

// One square per word, cycling the game's rainbow. There is no teal square emoji,
// so this is the six-colour subset of the --color1..7 palette rather than all seven.
const SQUARES = ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪'];

// A good round shouldn't paste a wall of blocks into someone's chat. Past this
// many the remainder is summarised as "+N".
const MAX_SQUARES = 24;

export function buildSquares(score) {
  const shown = Math.min(score, MAX_SQUARES);
  let out = '';
  for (let i = 0; i < shown; i++) out += SQUARES[i % SQUARES.length];
  return score > shown ? `${out} +${score - shown}` : out;
}

// Built from the live origin rather than a hardcoded domain so the link a tester
// copies on localhost points at localhost, and a Netlify preview build shares
// itself rather than production. The OG tags in index.html are the only place the
// real domain is spelled out, because crawlers need it absolute.
export function buildShareUrl(score) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('c', String(score));
  return url.toString();
}

export function buildShareText(score, challengeTarget) {
  const words = score === 1 ? '1 word' : `${score} words`;

  // When the round answered someone else's challenge, the result is the story —
  // "I beat your 12" travels further than a bare score.
  let headline;
  if (challengeTarget != null && score > challengeTarget) {
    headline = `I beat ${challengeTarget} with ${words} in 60 seconds!`;
  } else if (challengeTarget != null && score === challengeTarget) {
    headline = `Dead heat — ${words} in 60 seconds!`;
  } else {
    headline = `${words} in 60 seconds`;
  }

  return [
    'Keyfetti 🎊',
    headline,
    buildSquares(score),
    '',
    'Can you beat it?',
    buildShareUrl(score)
  ].join('\n');
}

// Returns 'shared' when the native sheet handled it, 'copied' when we fell back to
// the clipboard, and 'cancelled' when the user dismissed the sheet — the caller
// needs to tell those apart to decide whether to flash "Copied!" at anyone.
export async function shareOrCopy(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (err) {
      // Dismissing the share sheet rejects with AbortError. That's a decision, not
      // a failure, so it must not fall through to silently copying instead.
      if (err && err.name === 'AbortError') return 'cancelled';
      // Anything else (no matching target, share unavailable in this context) is
      // worth recovering from — fall through to the clipboard.
    }
  }

  await navigator.clipboard.writeText(text);
  return 'copied';
}
