# Security policy · 安全说明

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | yes |

## Reporting a vulnerability

Please do **not** open a public issue for a vulnerability that could expose
credentials. Use GitHub's private vulnerability reporting on the repository that
hosts this package. Include the version, platform, and a minimal reproduction.

## Threat model

### Protected against

- Another OS user reading the vault file.
- The vault file being copied, synced, or included in a backup without its
  machine/user-bound key (Windows DPAPI / macOS Keychain / Linux Secret Service).
- Accidental plaintext disclosure through the file itself: the document is
  AES-256-GCM ciphertext and contains no record fields in clear text.
- An agent reading a record the user marked **manual only** (`get`, `save`,
  `delete`, `used` are refused; notes are omitted from list/search).
- An agent reading a record when **Allow the agent to use records** is off.
- An agent reading a password when **Show passwords to the agent** is off.
- Automatic capture when **Capture credentials from chat** is off (the default).
- Anonymous browser access to the RPC route: it is registered on the Harness
  connection layer, which authenticates the browser peer.

### Not protected against

- **A compromised OS account.** Any process running as the same user — including
  the agent's own shell — can call the same DPAPI/Keychain/Secret-Service API and
  decrypt the vault. File encryption is not a boundary against the user account.
- **Malicious plugin code.** DSH plugins run with the user's permissions; a
  hostile plugin can read the vault like any other file or call the same OS APIs.
- **A compromised DSH session.** The `info_records` tool deliberately returns
  credentials to the model. A `get` result, including the password, becomes part
  of that session's log. Turn off "Show passwords to the agent" when a session
  log must never contain one.
- **Memory inspection / cold-boot attacks.** The decrypted payload is held in the
  Host process memory while the plugin is loaded.
- **A lost key.** DPAPI and OS keychains bind the data key to the current user and
  machine. There is no portable export yet; losing the OS account or keychain
  entry can make the vault unrecoverable.
- **A malicious page in the same browser origin.** The route is same-origin and
  authenticated by the Harness connection; it does not add a second CSRF token.

## Operational recommendations

- Enable full-disk encryption (BitLocker / FileVault / LUKS).
- Keep the DSH profile and its data directory on an account you control.
- Use **manual only** for banking, government, and other high-value accounts.
- Keep **Capture credentials from chat** off unless you actually want it.
- Review plugin updates before installing them; this plugin has no telemetry and
  makes no network requests.

## Data location and deletion

`<DSH home>/info-records/store.json` (ciphertext) and, only for the fallback key
protection, `<DSH home>/info-records/vault.key`. Uninstalling the plugin does not
delete these files. Delete the `info-records` directory to remove the vault.

## No telemetry

The plugin makes no outbound network requests. It does not read other plugins'
DOM, styles, or private state.
