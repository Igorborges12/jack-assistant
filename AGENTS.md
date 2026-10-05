<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Mock data seeds an in-memory session store (src/mocks/db.ts); services mutate it, pages read via useDb (select raw slices, derive outside selector) — keeps state across navigation and lets FastAPI replace services only.
- App-specific reusable UI lives in src/components/common (not ui/, which is shadcn) — avoids case-only filename clashes.
- Simulated chat replies live only in src/services/chatResponder.ts — single swap point for /api/chat.
