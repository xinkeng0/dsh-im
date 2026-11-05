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

Rebuild the tracked Host bundle with `node plugin-src/host/build.mjs` after
changing Host sources. Run `node --test test/host.test.mjs
test/host-product-bundle.test.mjs` after installing the locked dependencies;
the bundle test ensures the published entry enforces the selection as well.

Products that own their own channel lifecycle may import
`@xmanrui/dsh-im/workspace-commands`. They must provide a Host adapter that
authorizes every workspace, session list and binding before returning it; the
command helper does not provide account isolation or credential management.

The `@xmanrui/dsh-im/weixin-media` export exposes the existing encrypted-image
loader and byte-signature detector. An embedding Host must authorize the sender
before loading, enforce its own attachment limits, cancel on revocation and
submit images through its official attachment admission service.
The same export supplies bounded Weixin file sources; the embedding Host must
choose and disclose its file limits and pass the bytes through Host-owned file
upload receipts rather than writing arbitrary remote paths.
