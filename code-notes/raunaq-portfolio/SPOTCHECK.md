# Spot-check: raunaq-portfolio (2026-11-10)

Sonnet compared 36 randomly chosen notes with their code. 31 were correct, 5 had a minor issue, 0 were wrong. Share wrong: 0%. Share with any issue: 13%.

Minor issues (the note is right but incomplete or slightly off):
- `src/app/globals.css` section s111: Style description is right, but the claim about overriding an earlier no-wrap rule is not visible in this code.
- `src/components/vault/VaultScene.ts` section s12: onGraph fires before the room check; only the 3D build is skipped, and null is still reported.
- `src/components/PixelImage.tsx` section s4: List omits fieldLabel and naturalSize; mode is type-restricted, so the silent-behaviour claim is speculative.
- `home/index.html` section s16: On narrow screens the panel stacks under the walkthrough; the 3D corridor stays, just narrower.
- `home/index.html` section s25: Mask scales by HERO_MASK_W/H; the named image path is not in this code.
