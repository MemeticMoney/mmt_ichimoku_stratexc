# Publish Checklist

Use this checklist before pushing the public repo to GitHub.

## Content Scope

- Include only Pine scripts and public-facing documentation.
- Exclude private research notes, transcripts, screenshots, local scripts, and automation tooling.
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

## Final Validation

- Compile both scripts in TradingView.
- Verify the overlay and strategy both load on a clean chart.
- Verify the metrics dashboard text is readable on desktop and laptop layouts.
- Verify the default settings match the intended public defaults.

## GitHub Release

- Push to the private GitHub repo first.
- Review the rendered README and file tree on GitHub.
- Double-check that no unwanted files were included.
- Only then switch the repository visibility to public.
