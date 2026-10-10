# Aster agent instructions

Read [.agents/00-start-here.md](.agents/00-start-here.md) before working in this
repo, then read the relevant area note listed in [.agents/README.md](.agents/README.md).
The area notes record design decisions, current commands, and known limits.
Check the current code and branch state before relying on historical status
entries. Update the relevant note and append a factual entry to
`.agents/90-worklog.md` after meaningful changes.

Never place API keys or tokens in the repo. User instructions for the current
task take precedence over historical workflow notes.


## Current free demo setup

The user requires free development and own-device testing. Both
`BUMP_API_BASE_URL` defaults are empty so the app uses local drafting, local
conversation starters and Multipeer transport. No xAI key is configured in this
checkout. Do not start paid AI calls or a public tunnel for the local demo.
The user plans to use a friend's MacBook for Xcode; see `ios/README.md` for
transfer, free Personal Team signing and device setup.

## Optional server URL (only for a separately requested server setup)

The backend can run on a Mac and be exposed through a Cloudflare quick tunnel.
The tunnel URL changes every time `cloudflared` restarts, and the app's
default server lives in the build setting `BUMP_API_BASE_URL`
(`ios/UWBBumpTest.xcodeproj/project.pbxproj`, Debug and Release).

For a cloud/relay demo explicitly requested by the user, when the server is
down or the tunnel has restarted:

1. Start both, each in its own terminal:
   ```sh
   cd backend && npm start
   cloudflared tunnel --protocol http2 --url http://localhost:8787
   ```
2. Copy the new `https://<name>.trycloudflare.com` URL the tunnel prints.
3. Replace BOTH `BUMP_API_BASE_URL` values in `project.pbxproj` with it.
4. Check it: `curl https://<name>.trycloudflare.com/healthz` should show
   `"grokConfigured":true,"relay":true`.
5. Tell the user to rebuild and reinstall (or set the Server URL override in
   Testing tools on each phone).

If configured, an xAI key belongs in `backend/.env` (git-ignored). Never commit it.
