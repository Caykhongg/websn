---
name: birthday-wish-orchestrator
description: "Birthday Wish platform team orchestrator. Coordinates frontend UI, backend API, and QA agents for the birthday wish website. Also for: partial fix, feature add, bug hunt, improvement request, review request, or any birthday-wish modification."
---

# Birthday Wish Orchestrator

Coordinates a team of 3 agents (frontend-ui-engineer, backend-api-engineer, qa-inspector) to build, fix, and improve the birthday wish platform.

Tech stack: React 19 + Vite 6 + TypeScript + Tailwind CSS 4 | Express 5 + better-sqlite3 + multer | Render deployment

## Execution Mode: Sub-agents (parallel via task tool)

## Agent Configuration

| Agent | Type | Role | Agent File | Output |
|-------|------|------|-----------|--------|
| frontend-ui-engineer | general | React components, animations, UI | `.claude/agents/frontend-ui-engineer.md` | Modified `src/` files |
| backend-api-engineer | general | Express API, SQLite, uploads | `.claude/agents/backend-api-engineer.md` | Modified `backend/` files |
| qa-inspector | general | Validation, regression, quality gate | `.claude/agents/qa-inspector.md` | `_workspace/qa_report.md` |

## Workflow

### Phase 0: Context Check

1. Does `_workspace/` exist?
2. Decision:
   - **No `_workspace/`** → Initial run. Proceed to Phase 1
   - **`_workspace/` exists + modification** → Check existing artifacts, only redo affected agents
   - **Full rebuild** → Archive old `_workspace/` to `_workspace_{timestamp}/`

### Phase 1: Preparation
1. Analyze user request — identify which layers are affected (frontend, backend, or both)
2. Determine which agents to invoke based on affected layers
3. Read relevant files for context (read current state before spawning agents)
4. Save input to `_workspace/00_input/`

### Phase 2: Parallel Execution

If only frontend changes:
```
task(frontend-ui-engineer) → modifies src/
task(qa-inspector) → _workspace/qa_report.md (after frontend done)
```

If only backend changes:
```
task(backend-api-engineer) → modifies backend/
task(qa-inspector) → _workspace/qa_report.md (after backend done)
```

If both change:
```
task(frontend-ui-engineer) → modifies src/
task(backend-api-engineer) → modifies backend/
Wait for both → task(qa-inspector) → _workspace/qa_report.md
```

### Phase 3: QA Gate

1. Read `_workspace/qa_report.md`
2. If qa-inspector reports failures:
   - Fix reported issues (or re-invoke affected agent)
   - Re-run build to verify fix
3. If all PASS: confirm green

### Phase 4: Final Verification
1. Run `npm run build` — ensure tsc + vite succeed
2. Report summary to user

## Error Handling

| Situation | Strategy |
|-----------|----------|
| 1 agent fails | Retry once. If still fails, note omission in report |
| Build fails after changes | Report exact errors, re-invoke frontend-ui-engineer |
| User wants partial redo | Check _workspace/, only redo affected agents |

## Project Reference

### File Map
- `src/pages/CreateWish.tsx` — Create form with photo upload, emoji picker, effects/presentation selector
- `src/pages/ViewWish.tsx` — Presentation rendering + info card + celebration effects
- `src/components/GiftBox.tsx` — 3D SVG gift box with lid off animation
- `src/components/Cake.tsx` — Cake with candle lighting + firework explosion
- `src/components/BalloonPresentation.tsx` — Single balloon (pull string / tap pop)
- `src/components/Firework.tsx` — Single rocket fly + converge + white explosion
- `src/components/ui/gooey-background.tsx` — Gooey effect + background image
- `src/lib/api.ts` — Frontend API module (fetch /api/wishes)
- `src/lib/store.ts` — localStorage CRUD fallback
- `src/lib/encoding.ts` — base64url encode/decode for URL hash
- `src/lib/types.ts` — WishData, WishFormData, EffectType, PresentationType
- `backend/server.js` — Express server with SQLite + multer + API routes
- `render.yaml` — Render deploy config

### Key Lessons (see AGENTS.md for details)
- Gooey SVG filter: use `insertAdjacentHTML` into body, not React SVG
- Pinterest images: use oEmbed API for extraction
- Portrait BG: use `bg-contain bg-center bg-no-repeat` with dark overlay
- Express 5 catch-all: use `app.use((req,res) => ...)` not `app.get("*", ...)`
- FormData with multer: effects field comes as JSON string, needs parsing
- Pointer events: use `window.addEventListener` not `element.addEventListener` to avoid TS strict errors
