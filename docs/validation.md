# Validation and publication status

The Community Edition tree starts from fresh Git history. It contains newly written code and synthetic examples. The existing private implementation remains the reference for future feature work. Review rights and third-party notices before copying any of its source or assets.

MIT is the proposed project license for straightforward reuse and redistribution with preservation of the copyright and license notice. Apache-2.0 adds an express patent grant and additional notice requirements. Confirm the intended copyright holder and license before adding a LICENSE file or publishing the project as open source. Rollup is a build dependency and the emitted bundle contains the project's source.

## Verified

- Unit tests cover configuration validation, duplicate bindings, no-area discovery and registry area precedence.
- Two local builds produced byte-identical bundles. The dependency audit reported zero known vulnerabilities. The source, docs, examples, tests and built bundle passed a targeted check for household entity IDs, credential patterns and private addresses.
- A loopback Home Assistant Core 2026.11.1 installation loaded the built asset. The graphical Lovelace editor discovered a synthetic temperature entity, applied the selection, and saved the card. A separately authenticated Chromium session with a narrow viewport showed the saved room and entity and the original neighboring card.
- A browser fixture exercised the missing-to-present state transition without losing the saved binding.

## Pending

Marketplace and legacy HACS installation and upgrades, additional browser engines, non-admin permissions, and feature coverage beyond the first room overview remain to be tested.

[Home Assistant custom card documentation](https://contributors.home-assistant.io/frontend/custom-ui/card/) · [Marketplace dashboard packaging](https://contributors.home-assistant.io/marketplace/guides/dashboard/)
