# Hestia Community Edition

**Work in progress.** Marketplace and HACS installation are pending verification.

A Home Assistant dashboard card for organizing devices by room. This development snapshot covers discovery, selection, room display names and a responsive room overview. The card uses the authenticated Home Assistant context and requires no token entry.

## Local development

Run `npm ci`, `npm test` and `npm run build` with Node.js 22 or newer. The build produces `dist/hestia-community.js`. See [validation and publication status](docs/validation.md).

On a disposable Home Assistant installation, place the bundle under `config/www` and add it as a JavaScript module resource. Add the Hestia Community Edition card, edit it, select devices and room labels, click **Apply setup**, and use Home Assistant’s **Save** action. The room selection lives in the card’s Lovelace configuration. [Example card configuration](examples/card.yaml)

The planned public package will distribute the bundle as a Marketplace and legacy HACS release asset. Installation through those channels is pending verification. The flow currently runs in the Lovelace card editor. The full onboarding wizard, floor-plan editor, optional feature modules and release workflow remain in development.

## License

[MIT](LICENSE)
