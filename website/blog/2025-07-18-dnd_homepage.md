---
slug: dnd_homepage
title: Adding Drag-and-Drop to the FireCMS Homepage, and how AI has helped
authors: francesco
---

<video class="demo" loop autoplay muted width="100%">
  <source src="/img/dnd.webm" type="video/mp4"/>
</video>

We have a new FireCMS feature: **drag-and-drop reordering of home screen navigation cards.**

A couple thoughts on relying on AI to build this...

As a preface, we avoided learning a given DnD library's quirks, focusing on integrating new code with our existing
codebase.

Drag and drop is notoriously tricky, even if it looks simple. We've implemented reordering cards, moving them between
groups, reordering groups, and creating new groups by dropping in a special area. That's two nested DnD levels plus a
special one.

<!-- truncate -->

Every interaction needs appropriate animation. We also want groups to collapse while dragged; large elements feel clunky
when dragged. And search must still work!

We'd long wanted this feature but postponed it due to complexity. We also had to change our DnD library (to `dnd-kit`
from `@hello-pangea/dnd`) as the old one wouldn't allow the complex nested interactions we needed.

FireCMS has DnD logic in three other places, so we started there. We used a mix of LLMs, mostly Gemini 2.5 Pro and
Claude 3.7, but also o3.

Replacing existing code worked surprisingly well, with just a few prompts. Code quality was good and functionally
identical to the previous version.

After replacing the existing code, we tackled the home screen! That was a whole different complexity level. It took one
developer one week, from first prompt to production.

I wouldn't have thought this possible a couple of years ago.

It's not just building the feature, but integrating with a complex CMS. Our plugin system allows core behavior
modification, so we must ensure changes don't affect any plugin implementation. It's tricky!

Our flow:

- Ask LLM to build part of the feature
- Iterate...
- Change LLM if stuck
- Go to o3 if others fail
- Ask AI to write tests
- Continue with next part
- Ensure everything works.

After LLMs deliver a working (or near-working) version, the developer adjusts arbitrary choices. For example:

- Removing unnecessary LLM-generated code/type duplication already present.
- Applying correct project code "taste."
- Applying correct styling. It's usually easier for me to apply desired styles than to ask AI to get it right.

LLMs are amazing at building specific functions and are a massive help. They aren't yet ready for super big-scale apps,
missing too much context. But where will we be in a couple of years?
