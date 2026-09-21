# Contributing

Thanks for helping build EquiFlow. This page explains how the team works together in this repository.

## Set up

```bash
git clone https://github.com/MinhMQ1711/Horse-Training-Club.git
cd Horse-Training-Club
npm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

See the [README](README.md#getting-started) for demo accounts and configuration.

## Branches

| Branch | Purpose |
|---|---|
| `main` | Always working. **Never commit to it directly.** |
| `fe1/<topic>` | Work by the FE1 pair, for example `fe1/horses` |
| `fe2/<topic>` | Work by the FE2 pair, for example `fe2/training` |
| `chore/<topic>` | Tooling, docs and restructuring |

Create your branch from an up-to-date `main`, push it, then open a **pull request** into `main`.

```bash
git checkout main && git pull
git checkout -b fe1/horses
# ... work, commit ...
git push -u origin fe1/horses
```

## Commit messages

GitHub shows the **first line** of the last commit next to every file, so write it as a short, clear sentence in English. Format: `type(scope): what changed`.

| Type | Use it for | Example |
|---|---|---|
| `feat` | A new screen or behaviour | `feat(horses): add horse list with breed filter` |
| `fix` | A bug fix | `fix(auth): keep the OTP countdown after refresh` |
| `refactor` | Code change with no visible effect | `refactor: move lib and mock into shared` |
| `docs` | README, docs, comments | `docs(api): add horse endpoints` |
| `style` | Formatting only | `style: align table column widths` |
| `chore` | Config, dependencies, tooling | `chore(lint): ignore dist output` |
| `ci` | GitHub Actions | `ci: cache npm between runs` |

Rules of thumb:

- Keep the first line under about 50 characters so it is not cut off in the file list.
- Use the present tense: "add", not "added".
- One commit should do one thing. Put the reason in the body, after a blank line.
- Do not commit `node_modules/`, `dist/` or `.env.local`. They are git-ignored, but check `git status` before committing.

## Before you open a pull request

- [ ] `npm run build` finishes without errors
- [ ] `npm run lint` shows no new errors
- [ ] Every new screen has **loading, empty, error and permission-blocked** states
- [ ] Every new screen has mock data, so it runs without the backend
- [ ] Colours, font sizes, radii and shadows come from `src/shared/styles/tokens.css`, with no hard-coded hex values
- [ ] Existing components in `src/shared/components/` were reused instead of writing a second copy
- [ ] Access rules were added to `src/shared/lib/permissions.ts`, not scattered inside pages
- [ ] Text on screen is in English
- [ ] No new library was added without asking the team

## Where things go

| I want to… | Put it in |
|---|---|
| Add a page | Write it in `src/features/<flow>/pages/`, then add one `{ path, element }` line for it to the route table in `src/app/router.tsx` |
| Call a new API | `src/features/<flow>/api.ts` (uses `src/shared/lib/api.ts`) |
| Add a menu item or change who may open a page | `src/shared/lib/permissions.ts` |
| Add a reusable button, table or modal | `src/shared/components/ui/` |
| Add fake data for a new page | `src/shared/mock/` |
| Change a colour or spacing value | `src/shared/styles/tokens.css` |

The full explanation of each folder is in [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md) (Vietnamese) and the diagrams are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Two rules that keep the code simple

1. **Layers only point downwards:** `app` → `features` → `shared`.
2. **Features never import each other.** If two features need the same thing, move it to `shared/`.

## Reviewing

A reviewer checks the list above, opens the branch locally, and tries the screen with at least two different roles. A pull request is merged only after one teammate has approved it.
