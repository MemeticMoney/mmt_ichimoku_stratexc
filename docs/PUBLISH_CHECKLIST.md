# Publish Checklist

Use this checklist before pushing the public repo to GitHub.

## Content Scope

- Include only Pine scripts and public-facing documentation.
- Include only the public `MMT Ichi Workflow` script family.
- Exclude private research notes, source materials, screenshots, local scripts, and automation tooling.
- Exclude `MMFE` scripts, intermarket regime research, and private validation notes.
- Exclude third-party vendored repositories unless they are intentionally being published as independent subprojects.

## Scrub Review

- Confirm there are no absolute local filesystem paths.
- Confirm there are no usernames, machine names, or local install paths.
- Confirm there are no screenshots or exported UI captures.
- Confirm there are no API keys, tokens, cookies, or session data.
- Confirm there are no private notes or internal-only setup instructions.

## Attribution

- Confirm `MemeticMoney` is named in the README.
- Confirm the license says `Copyright (c) 2026 MemeticMoney`.
- Confirm the TradingView script titles match the public branding you want.
- Confirm the public release set for the specific update. Current source-included scripts are the base overlay/strategy, profile overlay/strategy, and the separate 2D overlay/strategy pair.

## Final Validation

- Compile all public scripts in TradingView.
- Verify the overlay, strategy, and overlay profiles scripts all load on a clean chart.
- Verify the metrics dashboard text is readable on desktop and laptop layouts.
- Verify the default settings match the intended public defaults.
- Verify the profiles overlay shows the expected profile label on a covered ticker.
- Verify the 2D scripts show `2D OK` on a `2D` chart and a warning away from `2D`.
- Verify there are no `MMFE` files in the public tree and any `MMFE` text is limited to exclusion guardrails.

## GitHub Release

- Review the repo while it is still private, if possible.
- Review the rendered README and file tree on GitHub.
- Double-check that no unwanted files were included.
- Only then switch the repository visibility to public.
