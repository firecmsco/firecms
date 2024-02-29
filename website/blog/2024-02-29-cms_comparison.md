---
slug: cms_comparison_2024
title: Picking a CMS in 2024
author: Francesco Gatti
image: /img/avatars/francesco_avatar.jpg
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
* By access to data APIs (GraphQL, REST, SDKs)
* Cloud based or self-hosted


> We are building this guide to help you pick the right CMS for your project.
> We will be updating it regularly, so make sure to check back often.
>
> One of the motivations for this guide is to help users understand the
> differences between CMSs. Despite creating FireCMS, we are not trying to
> promote it as the best solution for everyone. We are just trying to help
> people understand the trade-offs of different solutions.
> This is the same thing we say to our users when they ask us for advice on
> what solution to use.

## General purpose or web oriented

The first thing to consider is whether you need a general purpose CMS or a
web-oriented one. A general purpose CMS is a tool that can be used to manage
content for any kind of project (apps, desktop, web), while a web-oriented CMS
is a tool that is designed to manage content for websites.

**Web oriented CMSs** are built with the assumption that the content will be
displayed on a website, and they usually provide a **web editor** to edit the
content. This is not the case for **general purpose CMSs**, which can be used
to manage content for any kind of project, including **mobile apps**, **desktop
apps**, etc.

Web oriented CMSs are usually simpler to use, but they are also more limited in
terms of features and integrations. They provide built-in support for
pages, headers, footers, navigation menus, and other common website features,
but they are not as flexible as general purpose CMSs. Also, they will typically
have a `published` flag (or equivalent) for each entity. Of course, nothing
stops you from using a general purpose CMS to manage content for a website.

Do you need a **blog**? A web-oriented CMS will likely have a built-in blog
solution, while a general purpose CMS will not.

Examples of web-oriented CMSs are [Wordpress](https://wordpress.com/),
[Prismic](https://prismic.io/) or [Storyblok](https://www.storyblok.com/).
Those are the way to go if your main goal is to build a website and a
web editor is useful to you.

General purpose CMSs can be used to manage any type of content. Think of things
like the menu of a restaurant or a delivery app. Or the exercises and videos of
a fitness app. Or the podcasts in a podcast app.
If you are working on a mobile app or a web app where you need to manage any
content related to your business, [FireCMS](https://firecms.co) is a great
option. It has all the advantages of other general purpose CMSs, but it uses
Firebase as a backend, so you have access to all the robustness, extensibility
and features of Google Cloud.

## Headless or traditional

Traditional CMSs are the ones that provide a web editor to edit the content,
and they will be responsible for rendering it on the website. So
the admin interface and the website are tightly coupled.

Headless CMSs are the opposite: they are not coupled to the rendering of the
website and are in charge of managing the content exclusively.
CMS and website are different software components in this case.
They provide an API to access the content. The
website is responsible for rendering the content, and it can be built with
any technology.

Headless CMSs are more flexible than traditional CMSs, but they require more
work to build the website. The benefit is that you can build it
with any technology you want.

Note that a CMS can be **web-oriented** and **headless** at the same time. In
this case, the CMS will provide a web editor to edit the content, but it will
not be responsible for rendering it on the website. Examples of this are
[Prismic](https://prismic.io/), [Contentful](https://www.contentful.com/)
or [Agility CMS](https://agilitycms.com/).

Examples of headless and general purpose CMSs are [Strapi](https://strapi.io/),
[GraphCMS](https://graphcms.com/) or [Sanity](https://www.sanity.io/)

[FireCMS](https://firecms.co/) is a **headless** and general purpose CMS.
It is a general purpose CMS that can be used to manage content
for any kind of project, including websites, web apps, mobile apps, desktop
apps, etc.

## Access to data APIs

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

## Cloud based or self-hosted

The last thing to consider is whether you want a cloud based CMS or a
self-hosted one. Cloud based CMSs are hosted by the CMS provider, and you
don't need to worry about hosting and maintenance. Self-hosted CMSs are
installed on your own servers, and have a little more overhead, but also
better flexibility.

## Other considerations

### Main user type

If your main user type is a content editor, you should consider a CMS that
allows them to edit the content without having to write code. Also, you want to
make sure that the CMS is easy to use, and that it provides a good user
experience, as well as preventing users from making mistakes, that could
potentially break the apps linked to the underlying database.

### Data portability

If you are planning to use a CMS for a long time, you should consider the
data portability. You want to make sure that you can easily export the data
from the CMS, and that you can easily import it in another CMS.

Also, you want to check the license of the CMS. Some CMSs are open source,
while others are proprietary.

## CMSs comparison

Check the comparison table below to see which APIs are provided by each CMS.

| NAME                           | FireCMS | Agility CMS | ButterCMS | Contentful | Ghost | GraphCMS | Keystone JS | Prismic | Sanity | Storyblok | Strapi | Wordpress - unite cms |
|:------------------------------:|:-------:|:-----------:|:---------:|:----------:|:-----:|:--------:|:-----------:|:-------:|:------:|:---------:|:------:|:---------------------:|
| **Installation**               |         |             |           |            |       |          |             |         |        |           |        |                       |
| Open Source                    | ✅       | ❌           | ❌         | ❌          | ✅     | ❌        | ✅           | ❌       | ✅      | ❌         | ✅      | ✅                     |
| Cloud Service                  | WIP     | ✅           | ✅         | ✅          | ✅     | ✅        | ❌           | ✅       | ✅      | ✅         | ❌      | ✅                     |
| On Premises Installation       | ✅       | ❌           | ❌         | ❌          | ✅     | ❌        | ❌           | ❌       | ❌      | ✅         | ✅      | ✅                     |
| Cloud Service Hosted in Europe | ✅       | ❌           | ~         | ❌          | ~     | ✅        | ❌           | ~       | ✅      | ✅         | ~      | ✅                     |
| Commercial Support Available?  | ✅       | ✅           | ✅         | ✅          | ✅     | ✅        | ❌           | ✅       | ✅      | ✅         | ✅      | ✅                     |
| **Users**                      |         |             |           |            |       |          |             |         |        |           |        |                       |
| User Management                | ✅       | ✅           | ❌         | ❌          | ❌     | ❌        | ✅           | ❌       | ✅      | ✅         | ✅      | ❌                     |
| Role Based Permissions         | ✅       | ✅           | ✅         | ✅          | ✅     | ✅        | ✅           | ✅       | ✅      | ✅         | ✅      | ✅                     |
| Document Level Permissions     | ✅       | ✅           | ❌         | ❌          | ❌     | ❌        | ✅           | ❌       | ✅      | ✅         | ✅      | ✅                     |
| **Features**                   |         |             |           |            |       |          |             |         |        |           |        |                       |
| Web builder                    | ❌       | ❌           | ❌         | ❌          | ✅     | ❌        | ❌           | ✅       | ❌      | ✅         | ❌      | ✅                     |
| Real time support              | ✅       | ❌           | ❌         | ❌          | ❌     | ❌        | ❌           | ❌       | ❌      | ❌         | ❌      | ❌                     |
| Search: Full Text Search       | ✅       | ✅           | ✅         | ✅          | ~     | ✅        | ❌           | ✅       | ✅      | ✅         | ✅      | ~                     |
| Eventbus                       | ✅       | ~           | ❌         | ❌          | ~     | ❌        | ❌           | ❌       | ✅      | ✅         | ❌      | ❌                     |
| Client Side Forms              | ✅       | ✅           | ❌         | ❌          | ~     | ✅        | ✅           | ❌       | ✅      | ❌         | ✅      | ❌                     |
| Plugin System                  | ✅       | ✅           | ❌         | ❌          | ❌     | ❌        | ✅           | ❌       | ✅      | ✅         | ✅      | ❌                     |
| Customizable UI                | ✅       | ✅           | ❌         | ✅          | ~     | ❌        | ✅           | ❌       | ✅      | ✅         | ✅      | ✅                     |
| Content Trees                  | ✅       | ✅           | ❌         | ❌          | ~     | ❌        | ❌           | ❌       | ❌      | ✅         | ❌      | ~                     |
| Nesting fields/elements        | ✅       | ✅           | ✅         | ✅          | ~     | ❌        |             | ❌       | ✅      | ✅         | ✅      | ✅                     |
| Image: Manipulation            | ✅       | ✅           | ✅         | ✅          | ~     | ✅        |             | ✅       | ✅      | ✅         | ✅      | ~                     |
| **Technical**                  |         |             |           |            |       |          |             |         |        |           |        |                       |
| OAuth 2.0 Support              | ✅       | ✅           | ❌         | ✅          | ~     | ❌        | ✅           | ❌       | ✅      | ✅         | ✅      | ~                     |
| CDN Support                    | ✅       | ✅           | ✅         | ✅          | ~     | ✅        | ❌           | ✅       | ✅      | ✅         | ✅      | ✅                     |
| Backup Feature                 | ✅       | ~           | ❌         | ❌          | ~     | ✅        | ❌           | ❌       | ❌      | ✅         | ❌      | ❌                     |
| Import/Export                  | ✅       | ✅           | ✅         | ✅          | ~     | ✅        | ✅           | ✅       | ✅      | ✅         | ❌      | ✅                     |
| CLI                            | ❌       | ❌           | ❌         | ✅          | ✅     | ❌        | ✅           | ✅       | ✅      | ✅         | ✅      | ✅                     |
| Web Hooks                      | ✅       | ✅           | ✅         | ✅          | ✅     | ✅        | ❌           | ✅       | ✅      | ✅         | ✅      | ✅                     |
| Versioning                     | ✅       | ✅           | ❌         | ✅          | ❌     | ❌        | ❌           | ✅       | ✅      | ✅         | ❌      | ✅                     |
| **Data**                       |         |             |           |            |       |          |             |         |        |           |        |                       |
| GraphQL: API                   | ❌       | ✅           | ✅         | ✅          | ❌     | ✅        | ✅           | ✅       | ✅      | ✅         | ✅      | ✅                     |
| REST: API                      | ✅       | ✅           | ✅         | ✅          | ✅     | ✅        | ❌           | ✅       | ✅      | ✅         | ✅      | ✅                     |
| SDK: Java                      | ✅       | ❌           | ❌         | ✅          | ~     | ❌        | ❌           | ✅       | ❌      | ✅         | ❌      | ❌                     |
| SDK: C#                        | ✅       | ✅           | ✅         | ✅          | ~     | ❌        | ❌           | ✅       | ✅      | ❌         | ❌      | ❌                     |
| SDK: PHP                       | ✅       | ❌           | ✅         | ✅          | ~     | ❌        | ❌           | ✅       | ✅      | ✅         | ❌      | ❌                     |
| SDK: JavaScript                | ✅       | ✅           | ✅         | ✅          | ✅     | ✅        | ❌           | ✅       | ✅      | ✅         | ✅      | ❌                     |
| SDK: React                     | ✅       | ✅           | ✅         | ❌          | ~     | ✅        | ❌           | ❌       | ✅      | ✅         | ❌      | ❌                     |
| SDK: AngularJS                 | ✅       | ❌           | ✅         | ❌          | ~     | ✅        | ❌           | ❌       | ❌      | ✅         | ❌      | ❌                     |
| SDK: TypeScript                | ✅       | ❌           | ❌         | ✅          | ~     | ✅        | ❌           | ❌       | ✅      | ✅         | ❌      | ❌                     |

:::tip
Picking a CMS is a very personal decision, and there is no one-size-fits-all
solution.
You should consider your team's experience, the project's requirements and
your budget.
:::
