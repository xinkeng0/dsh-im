# Product host channel selection

The host accepts an optional `enabledChannels` array, for example
`{ enabledChannels: ['weixin'] }`. It starts and registers only the named
channel consumers; an absent selection retains the upstream default of all
channels. Empty, repeated and unknown names fail before host registration.
Channel names are the host configuration keys, including `wecomApp`.

This selection does not disable shared delivery, update, language, or other
host services and does not provide user, environment, or credential isolation.
An embedding product must enforce its own authorization and validate those
shared services before using this fork in production.

Run `node --test test/host.test.mjs` after installing the locked dependencies.
