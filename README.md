## Project description

Tip O' The Hat: Pool Tips, Fund Awesomeness - A community initiative on Farcaster to promote & reward exceptional casts by pooling tips & conferring them to deserving creators incentivising quality & community.

Three stages: nomination, voting, distribution.

1. Users can nominate one cast per day. Nomination power is tripled for power badge holders.

2. The top five nominated casts proceed to voting. Power badge holders (only) can vote once per day.

3. Tips go to the cast creator. If the creator tags others, the tip is split equally. Roadmap: allow casters to specify percentage splits.

## What's next?

- A central hub to see historical TOTH recipients/projects + nominations + votes received (could imagine this being used as a builder score of some kind i.e. "the community loved this thing i made, i nearly won TOTH")

- splits feature e.g. a team effort product being rewarded, the caster could auto split any tips for that cast between certain wallets/FID’s involved in exact percentages aligned with contributions

- autosubscribe real tips, not tip allocations. where casters dedicate a certain amount of degen per day/week/month to go to TOTH. They can set certain criteria for where the tips are, and are not, allowed to go e.g. exclusively to FRAMES, or exclusively to ART. Any TOTH in a category other than that selection would be skipped automatically.

## Variations to test

The frame itself runs on a clock.
This means that nominations can only happen from 12AM UTC to 6PM UTC. There will be a 6 window gap where nominations cannot happen.

- Nomination window: 12AM-6PM UTC (16 h)
- Voting: 6PM-6PM UTC next day (24 h)
- Nomination and voting can happen at the same time. Where nominations will be for the next round and voting for the previous nomination round.

## Installation

You will need your own Neynar and Airstack API keys. You will need to add them on a new file called `.env`.

You can also use the following test values:

```
NEYNAR_API_KEY=NEYNAR_API_DOCS
AIRSTACK_API_KEY='you-airstack-api-key'
CONFIG=DEV
```

### Steps to install locally

```
npm install
npm run dev
npx frog dev
```
