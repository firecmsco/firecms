---
slug: rebase_open_source_at_heart
title: Rebase - Our Commitment to Open Source
description: Rebase remains open source at heart - learn about our commitment to the open source community.
pubDate: 2024-12-04
image: /img/blog/rebase_open_source.jpg
authors: marian
---

![Open Source](/img/blog/rebase_open_source.jpg)

## Rebase: Open Source at Heart

> Soon we will release an updated CLI that will make it easier to start a new project, in the different flavors of Rebase.

**Rebase** was born as an **open-source** software project, and our plans are to **keep it that way**. We believe in
the power of open source and the community surrounding it. We are committed to building a product that is not only
useful but also transparent and accessible to everyone.

We want to take a moment to share our plans regarding licensing, open source, and next steps.

## The Rebase Multiverse

From the first version up to today, we have been working on **different versions** of providing services based on
Rebase. You may be familiar with the Pro or Cloud versions. Also, most of our code is public, but not all of it is open
source, as some packages use a different license.

Yes, we experience fragmentation, similar to Android. Let's take a look at these versions and clarify them. Basically,
**Rebase 3.0 comes in several flavors.**

### Rebase Community

The **core** of **Rebase** has an **MIT** license. Use it as you wish, with the freedom to modify and distribute. This
is how we started, and we will keep it that way.

A TypeScript library built on top of React to manage data in Firestore forms the foundation of all other versions.

<!-- truncate -->

That's not all you need to start, but you get the idea. We are working to update the CLI to make it easier to start a
new project.

You host it, you work on it, and you own it. Build whatever you need on top of it. You will get the baseline for the
CMS, the same fancy UI, and the same data management capabilities as always. Collections, entities, subcollections—it's
all there.

Some of the other packages that are part of the Community version, also with an MIT license, are:

- `@rebasepro/firebase`
- `@rebasepro/ui`
- `@rebasepro/mongodb`

Wait... [MongoDB](https://www.mongodb.com/)?

Yes, we designed the code to work with different backends. We released a MongoDB version compatible
with [Atlas](https://www.mongodb.com/lp/cloud/atlas/), and you can build your own adaptation.

### Rebase Cloud

**Rebase Cloud** is a fully managed SaaS. You don't need to worry about hosting, scaling, or maintaining the CMS. You
can **start a new project in seconds** and get a CMS up and running in no time.

How do you get started? Go to [app.rebase.pro](https://app.rebase.pro) and create a new project.

Even though it is a cloud-managed version, we allow you to extend the CMS with your own views, form fields, and other
components. You can build and compile your own views, form fields, and other components, and upload them to your
project. These will run in our infrastructure. You still own the data and the Google Cloud Project, but we take care of
the rest.

If you want to delve into the code and adapt anything, you can try: `npx create-rebase-app` and start from there.

### Rebase PRO

The new kid on the block. After building Rebase Cloud, we decided to create a version that is self-hosted but includes
some of the features of the Cloud version. You can obtain the same advanced features as the Cloud version but host it
yourself.

This approach is similar to what other projects like [Material UI](https://mui.com/) or [Redis](https://redis.io/) have
done.

Our goal is to provide more features and be able to work on them and sustain the project. This means we have some
extended features, including:

- User management and permissions
- Data import/export
- UI-based Collection Editor
- AI-based generative features
- And more

Start quickly: `npx create-rebase-app --pro`.

The features of this version use the **BSL (Business Source License)**. This means that you can use it for free, but if
you are using it for a commercial purpose, you need to pay a license fee.

### Open Source

We are **committed to open source**. We believe in the power of open source and the community surrounding it. We are
dedicated to building a product that is not only useful but also transparent and accessible to everyone.

And we still need the **community** to make it a better product, whether it's **notifying issues**, **contributing code
**, or just using it and giving **feedback**. We welcome any help,
from [Sponsors](https://github.com/sponsors/rebaseco) to Pull Requests.

## Final Words

Our promise is to **make Rebase** the **platform** on which you can **build anything**, from a Firebase CMS to a
real-time Dashboard. We intend to keep its core as open source with an MIT License.

We are thrilled to **build in public**, and we would make the same decision **all over again**. Seeing what you build
with Rebase is what keeps us going.

In the past years, we have loved how startups have built core parts of their products with Rebase, from blogs to
internal dashboards.

We are excited to see what you build next.
