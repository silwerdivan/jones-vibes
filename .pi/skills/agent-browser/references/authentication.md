# Authentication

Use this reference when `agent-browser` tasks need login state.

## Choose The Simplest Safe Option

1. Use `--auto-connect` to import auth from the user's already-running Chrome when the task is one-off and the user is already signed in.
2. Use `--profile <path>` when the same site will be automated repeatedly from the same machine.
3. Use `--session-name <name>` when you want lightweight saved cookies and local storage without managing files manually.
4. Use `state save` and `state load` when the task needs an explicit portable state file.
5. Use `auth save` and `auth login` only when the CLI's encrypted credential flow is already part of the user's setup.

## Common Patterns

Import auth from a running browser:

```bash
agent-browser --auto-connect state save ./.auth/example.json
agent-browser --state ./.auth/example.json open https://app.example.com/dashboard
```

Use a persistent profile:

```bash
agent-browser --profile ./.agent-browser/example open https://app.example.com/login
```

Use a named session:

```bash
agent-browser --session-name example open https://app.example.com/login
agent-browser close
agent-browser --session-name example open https://app.example.com/dashboard
```

Save and reload explicit state:

```bash
agent-browser state save ./.auth/example.json
agent-browser state load ./.auth/example.json
```

## Security Rules

1. Treat saved state files as secrets because they can contain usable session material.
2. Store auth artifacts in ignored workspace paths such as `./.auth/` when possible.
3. Do not paste credentials into chat if a local session or state file can be used instead.
4. Mention plainly when a site requires manual CAPTCHA, MFA, device approval, or security prompts.
