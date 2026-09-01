---
description: Write the weekly family step report for WhatsApp (pt-BR)
allowed-tools: Bash(node scripts/weekly-report.mjs:*)
---

Write Leo's weekly step-competition announcement for his family's WhatsApp group.

## Step 1 — get the facts

Run `node scripts/weekly-report.mjs --json $ARGUMENTS` from the repo root.
With no arguments it reports the most recently completed week for the family
group. Useful flags: `--group todos` (everyone, not just family), `--week N`
(a specific week number).

## Step 2 — write the announcement

**Every number you print must come from that JSON.** Do not compute, estimate,
or infer figures yourself — not sums, not differences, not "weeks ago". The
script exists precisely so the arithmetic is never guessed, and a wrong number
in a family announcement is worse than a dull one, because someone will check.
If you want a comparison the JSON doesn't contain, say so rather than deriving
it. The one thing you may do is round for readability, and say you rounded.

Then use judgment on everything else:

- **Lead with whatever is genuinely most interesting this week.** Some weeks it
  is a photo finish (`margin.allTimeRank` near the top), some weeks a comeback
  (`history[].prevWinBeforeThis` with a big `weeksAgo`), a personal record
  (`setPersonalRecord`), a podium run ending (`podiumRunEndedThisWeek`), a
  perfect week, or a long streak. Rank the stories yourself; do not walk the
  JSON top to bottom.
- **Skip what did not happen.** A dull week gets a short report. Padding it
  with non-events is what makes a template feel like a template.
- **Vary the shape week to week.** Different opening, different section order,
  different emphasis. If a recent report is visible in this conversation, do
  not reuse its structure.
- **Look for the odd thing.** The best line in the first edition of this report
  was noticing one person appeared in all three tightest finishes ever. Nothing
  in the JSON flags that. Go looking.

## Format

- Brazilian Portuguese, warm and playful — it is family, not a press release.
- WhatsApp markup: `*bold*`, `_italic_`. Emoji as section markers, sparingly.
- Numbers in pt-BR format (`103.854`), which the JSON values need formatting into.
- Names exactly as the JSON gives them: Mãe, Pai, Joana, Ivana, Leo, Elisabeth,
  Laurent.
- Output the message in a copy-paste block, and nothing else after it.

## Judgement calls

- Teasing is fine and expected — droughts, falls, near-misses. Keep it fond.
  Do not make someone the joke of the whole message.
- Elisabeth's numbers are usually the lowest. Mention her when she has
  something positive; do not use her as the punchline.
- When `month.complete` is true and `month.awardsTrophy` is true, the trophy is
  decided — announce the winner. When it is false, the race is live: use it as
  the closing tease with the gap to the leader.
