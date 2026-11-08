# Shared stash rune quantities

Manually transcribed from all four screenshots in `vendor/d2s/examples/misc/sharedStashRunes`. Each numbered PNG matches the D2I with the same number. The small save fixtures are copied unchanged into `vendor/d2s/examples/stash/rune-stacks`; the machine-readable expectations are in `scripts/fixtures/shared-stash-runes.json`, in rune order El through Zod.

The first three rows show runes 1–27, left to right. The remaining slots are Lo and Sur at the left of row 4, Ber and Jah at the right of row 4, Cham at bottom left, and Zod at bottom right. In screenshot 1, dark slots without numbers are zero; Sur has 3. All 33 icons in screenshots 2, 3 and 4 show 99, 98 and 1 respectively.

| Rune | 1.png | 2.png | 3.png | 4.png |
| --- | ---: | ---: | ---: | ---: |
| El | 21 | 99 | 98 | 1 |
| Eld | 13 | 99 | 98 | 1 |
| Tir | 53 | 99 | 98 | 1 |
| Nef | 40 | 99 | 98 | 1 |
| Eth | 47 | 99 | 98 | 1 |
| Ith | 47 | 99 | 98 | 1 |
| Tal | 97 | 99 | 98 | 1 |
| Ral | 79 | 99 | 98 | 1 |
| Ort | 67 | 99 | 98 | 1 |
| Thul | 57 | 99 | 98 | 1 |
| Amn | 84 | 99 | 98 | 1 |
| Sol | 73 | 99 | 98 | 1 |
| Shael | 46 | 99 | 98 | 1 |
| Dol | 32 | 99 | 98 | 1 |
| Hel | 17 | 99 | 98 | 1 |
| Io | 31 | 99 | 98 | 1 |
| Lum | 21 | 99 | 98 | 1 |
| Ko | 15 | 99 | 98 | 1 |
| Fal | 16 | 99 | 98 | 1 |
| Lem | 6 | 99 | 98 | 1 |
| Pul | 8 | 99 | 98 | 1 |
| Um | 8 | 99 | 98 | 1 |
| Mal | 5 | 99 | 98 | 1 |
| Ist | 4 | 99 | 98 | 1 |
| Gul | 3 | 99 | 98 | 1 |
| Vex | 0 | 99 | 98 | 1 |
| Ohm | 0 | 99 | 98 | 1 |
| Lo | 0 | 99 | 98 | 1 |
| Sur | 3 | 99 | 98 | 1 |
| Ber | 0 | 99 | 98 | 1 |
| Jah | 0 | 99 | 98 | 1 |
| Cham | 0 | 99 | 98 | 1 |
| Zod | 0 | 99 | 98 | 1 |
| **Total** | **893** | **3,267** | **3,234** | **33** |
| **Types present** | **26** | **33** | **33** | **33** |

## Encoding findings

- v105 item tails have a presence bit followed by an optional 8-bit stack count. Previously the parser skipped that byte. Read it into `quantity` for simple items and preserve it when writing.
- Inventory position fields are unreliable for quantity. In pair 2 they contain slot coordinates, and in pair 3 they still contain 99 while the current tail quantity is 98. Pair 1 happens to have matching position/count values.
- Pair 2 also has quest materials with an optional 9-bit value before the property list. Handle this only for quest items on the materials page (`alt_position_id === 5`); the same flag on ordinary equipment must retain its existing interpretation.
- v105 sector type 0 contains regular items, type 1 contains materials, and type 2 contains metadata. Follow sector sizes and skip metadata; reading the metadata as items fails. This replaces the application's six-section extraction workaround.
- The app keeps one record per stack and sums quantities for rune totals, unused counts, save chips, crafting availability and save summaries. Socketed runes always count as one, including when their encoded quantity is zero; empty stash stacks still count as zero. Individual runes without a quantity default to one. Grail completion still counts distinct rune types.
- Screenshot quantities describe unused stacks. Stash 1 also contains three socketed runes (Thul, Shael and Lem), which add to totals but not unused counts.

## Verification

Run `node --preserve-symlinks --preserve-symlinks-main scripts/test-shared-stash-runes.cjs` from the repository root. This checks each of the 132 screenshot quantities against the parser and actual application scan methods, item serialization, mixed stacks/socketed runes, individual runes, legacy shared stashes and existing v105 characters.
