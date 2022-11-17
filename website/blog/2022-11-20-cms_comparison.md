---
slug: cms_comparison_2023
title: Picking a CMS in 2023
author: Francesco Gatti
image: /img/francesco_avatar.jpg
author_url: https://www.linkedin.com/in/fgatti675
author_image_url: https://avatars.githubusercontent.com/u/5120271?v=4
---

![CMSs](../static/img/cmss_cloud.png)

If you are working on any kind of public-facing digital project —no matter if
it's a website, a web app, a mobile app or desktop app — you will likely need a
Content Management System.
There are a lot of options to chose from, and different solutions are better
suited for some needs than others.
We can distinguish some categories straight away:

* General purpose or web oriented
* Headless or traditional
* By the APIs provided (GraphQL, REST, SDKs)
* Cloud based or self-hosted

> We are building this guide to help you pick the right CMS for your project.
> We will be updating it regularly, so make sure to check back often.
> If you have any suggestions or want to contribute, please reach out to us.
>
>
> **Disclaimer**: I am the founder of FireCMS, a Firebase/Firestore-based CMS,
> so I will not be making any assessments about the CMS solutions described in
> the article.
> We will focus on providing a list of features that each CMS provides, so the
> reader can pick what's best for them.

## General purpose or web oriented

The first thing to consider is whether you need a general purpose CMS or a
web-oriented one. A general purpose CMS is a tool that can be used to manage
content for any kind of project, while a web-oriented CMS is a tool that is
designed to manage content for websites and web apps.

**Web oriented CMSs** are built with the assumption that the content will be
displayed on a website, and they usually provide a **web editor** to edit the
content. This is not the case for **general purpose CMSs**, which can be used
to manage content for any kind of project, including **mobile apps**, **desktop
apps**, etc.

Web oriented CMSs are usually simpler to use, but they are also more limited in
terms of features and integrations. They provide built-in support for
pages, headers, footers, navigation menus, and other common website features,
but they are not as flexible as general purpose CMSs. Also, they will typically
have a `published` flag for each entity.

Examples of web-oriented CMSs are [Wordpress](https://wordpress.com/),
[Prismic](https://prismic.io/) or [Storyblok](https://www.storyblok.com/).
Those are the way to go if your main goal is to build a website and a
web editor is useful to you.

## Headless or traditional

Traditional CMSs are the ones that provide a web editor to edit the content,
and they will be responsible for rendering the content on the website. So
the admin interface and the website are tightly coupled.

Headless CMSs are the opposite: they provide an API to manage the content,
and they are not responsible for rendering the content on the website. The
website is responsible for rendering the content, and it can be built with
any technology.

Headless CMSs are more flexible than traditional CMSs, but they require more
work to build the website. The benefit is that you can build the website
with any technology you want.

Note that a CMS can be **web-oriented** and **headless** at the same time. In
this case, the CMS will provide a web editor to edit the content, but it will
not be responsible for rendering it on the website. Examples of this are
[Prismic](https://prismic.io/) or [Contentful](https://www.contentful.com/).

Examples of headless and general purpose CMSs are [Strapi](https://strapi.io/),
[GraphCMS](https://graphcms.com/) or [Sanity](https://www.sanity.io/)

[FireCMS](https://firecms.co/) is a **headless** and general purpose CMS.
It is a general purpose CMS that can be used to manage content
for any kind of project, including websites, web apps, mobile apps, desktop
apps, etc.

## APIs provided

The next thing to consider is the APIs provided by the CMS. The most common
APIs are **REST** and **GraphQL**. REST APIs are the most common, but they
are not as flexible as GraphQL APIs. GraphQL APIs are more flexible, but
they are a bit harder to use.

Some CMSs provide **SDKs** to make it easier to use their APIs. SDKs are
usually available for the most common languages, like JavaScript, Java, Python,
PHP, etc.

FireCMS uses Firestore as a backend, so it benefits from all the native SDKs
provided by Google. This is a big advantage, because it means that you can
use the same SDKs to access the CMS and to access the Firestore database.
At the same time, having Firebase as a backend means that you can use all the
Firebase features, like authentication, hosting, functions, etc. No other CMS
can offer this.

Check the comparison table below to see which APIs are provided by each CMS.

## Cloud based or self-hosted

The last thing to consider is whether you want a cloud based CMS or a
self-hosted one. Cloud based CMSs are hosted by the CMS provider, and you
don't need to worry about hosting and maintenance. Self-hosted CMSs are
installed on your own servers, and have a little more overhead, but also
better flexibility.

## CMSs comparison

| CMS                   | Open Source | Cloud Service | On Premises Installation | Cloud Service Hosted in Europe | Commercial Support Available? | Web builder | Real time support | GraphQL: API | REST: API | Search: Full Text Search | Image: Manipulation | CDN Support | Backup Feature | Import/Export | CLI   | SDK: Java | SDK: C# | SDK: PHP | SDK: JavaScript | SDK: React | SDK: AngularJS | SDK: TypeScript | Web Hooks | Eventbus | Client Side Forms | Plugin System | Customizable UI | User Management | Role Based Permissions | Document Level Permissions | OAuth 2.0 Support | Content Trees | Content Relations: Support for nesting fields/elements | Versioning |
|-----------------------|-------------|---------------|--------------------------|--------------------------------|-------------------------------|-------------|-------------------|--------------|-----------|--------------------------|---------------------|-------------|----------------|---------------|-------|-----------|---------|----------|-----------------|------------|----------------|-----------------|-----------|----------|-------------------|---------------|-----------------|-----------------|------------------------|----------------------------|-------------------|---------------|--------------------------------------------------------|------------|
| FireCMS               |     ✓    | WIP           |           ✓           |              ✓              |              ✓             |    ✕    |        ✓       |     ✕    |    ✓   |           ✓           |         ✓        |     ✓    |      ✓      |      ✓     | ✕ |    ✓   |   ✓  |   ✓   |       ✓      |    ✓    |      ✓      |       ✓      |    ✓   |   ✓   |        ✓       |      ✓     |       ✓      |       ✓      |          ✓          |            ✓            |        ✓       |      ✓     |                          ✓                          |    ✓    |
| Agility CMS           |    ✕    |      ✓     |           ✕          |              ✕             |              ✓             |    ✕    |       ✕       |     ✓     |    ✓   |           ✓           |         ✓        |     ✓    | ~          |      ✓     | ✕ |   ✕   |   ✓  |   ✕  |       ✓      |    ✓    |      ✕     |      ✕      |    ✓   | ~    |        ✓       |      ✓     |       ✓      |       ✓      |          ✓          |            ✓            |        ✓       |      ✓     |                          ✓                          |    ✓    |
| ButterCMS             |    ✕    |      ✓     |           ✕          | ~                          |              ✓             |    ✕    |       ✕       |     ✓     |    ✓   |           ✓           |         ✓        |     ✓    |      ✕     |      ✓     | ✕ |   ✕   |   ✓  |   ✓   |       ✓      |    ✓    |      ✓      |      ✕      |    ✓   |   ✕  |       ✕       |     ✕     |      ✕      |      ✕      |          ✓          |            ✕           |       ✕       |     ✕     |                          ✓                          |    ✕   |
| Contentful            |    ✕    |      ✓     |           ✕          |              ✕             |              ✓             |    ✕    |       ✕       |     ✓     |    ✓   |           ✓           |         ✓        |     ✓    |      ✕     |      ✓     |  ✓ |    ✓   |   ✓  |   ✓   |       ✓      |    ✕   |      ✕     |       ✓      |    ✓   |   ✕  |       ✕       |     ✕     |       ✓      |      ✕      |          ✓          |            ✕           |        ✓       |     ✕     |                          ✓                          |    ✓    |
| Ghost                 |     ✓    |      ✓     |           ✓           | ~                          |              ✓             |     ✓    |       ✕       |     ✕    |    ✓   | ~                    | ~               | ~       | ~          | ~         |  ✓ | ~     | ~   | ~    |       ✓      | ~      | ~          | ~           |    ✓   | ~    | ~             |     ✕     | ~           |      ✕      |          ✓          |            ✕           | ~             | ~         | ~                                                  |    ✕   |
| GraphCMS              |    ✕    |      ✓     |           ✕          |              ✓              |              ✓             |    ✕    |       ✕       |     ✓     |    ✓   |           ✓           |         ✓        |     ✓    |      ✓      |      ✓     | ✕ |   ✕   |  ✕  |   ✕  |       ✓      |    ✓    |      ✓      |       ✓      |    ✓   |   ✕  |        ✓       |     ✕     |      ✕      |      ✕      |          ✓          |            ✕           |       ✕       |     ✕     |                          ✕                         |    ✕   |
| Keystone JS           |     ✓    |     ✕     |           ✕          |              ✕             |             ✕             |    ✕    |       ✕       |     ✓     |   ✕   |           ✕          |                     |    ✕    |      ✕     |      ✓     |  ✓ |   ✕   |  ✕  |   ✕  |      ✕      |    ✕   |      ✕     |      ✕      |   ✕   |   ✕  |        ✓       |      ✓     |       ✓      |       ✓      |          ✓          |            ✓            |        ✓       |     ✕     |                                                        |    ✕   |
| Prismic               |    ✕    |      ✓     |           ✕          | ~                          |              ✓             |     ✓    |       ✕       |     ✓     |    ✓   |           ✓           |         ✓        |     ✓    |      ✕     |      ✓     |  ✓ |    ✓   |   ✓  |   ✓   |       ✓      |    ✕   |      ✕     |      ✕      |    ✓   |   ✕  |       ✕       |     ✕     |      ✕      |      ✕      |          ✓          |            ✕           |       ✕       |     ✕     |                          ✕                         |    ✓    |
| Sanity                |     ✓    |      ✓     |           ✕          |              ✓              |              ✓             |    ✕    |       ✕       |     ✓     |    ✓   |           ✓           |         ✓        |     ✓    |      ✕     |      ✓     |  ✓ |   ✕   |   ✓  |   ✓   |       ✓      |    ✓    |      ✕     |       ✓      |    ✓   |   ✓   |        ✓       |      ✓     |       ✓      |       ✓      |          ✓          |            ✓            |        ✓       |     ✕     |                          ✓                          |    ✓    |
| Storyblok             |    ✕    |      ✓     |           ✓           |              ✓              |              ✓             |     ✓    |       ✕       |     ✓     |    ✓   |           ✓           |         ✓        |     ✓    |      ✓      |      ✓     |  ✓ |    ✓   |  ✕  |   ✓   |       ✓      |    ✓    |      ✓      |       ✓      |    ✓   |   ✓   |       ✕       |      ✓     |       ✓      |       ✓      |          ✓          |            ✓            |        ✓       |      ✓     |                          ✓                          |    ✓    |
| Strapi                |     ✓    |     ✕     |           ✓           | ~                          |              ✓             |    ✕    |       ✕       |     ✓     |    ✓   |           ✓           |         ✓        |     ✓    |      ✕     |     ✕     |  ✓ |   ✕   |  ✕  |   ✕  |       ✓      |    ✕   |      ✕     |      ✕      |    ✓   |   ✕  |        ✓       |      ✓     |       ✓      |       ✓      |          ✓          |            ✓            |        ✓       |     ✕     |                          ✓                          |    ✕   |
| Wordpress - unite cms |     ✓    |      ✓     |           ✓           |              ✓              |              ✓             |     ✓    |       ✕       |     ✓     |    ✓   | ~                    | ~               |     ✓    |      ✕     |      ✓     |  ✓ |   ✕   |  ✕  |   ✕  |      ✕      |    ✕   |      ✕     |      ✕      |    ✓   |   ✕  |       ✕       |     ✕     |       ✓      |      ✕      |          ✓          |            ✓            | ~             | ~         |                          ✓                          |    ✓    |
