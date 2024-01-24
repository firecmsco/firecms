---
slug: local_text_search
title: Building in browser text search for Firebase with a Lean mindset
image: /img/avatars/marian_avatar.jpeg
author_name: Marian Moldovan
author_url: https://www.linkedin.com/in/marianmoldovan/
author_image_url: https://media.licdn.com/dms/image/C4E03AQFCD4YD1c8Uuw/profile-displayphoto-shrink_800_800/0/1655896232142?e=1710979200&v=beta&t=EckecOc3z-7s_6AaWW7rehbAOzrs4KTgOn73IivyLOA
---

Nowadays, search is a basic feature in a public online tool. It’s a commodity, a feature that you expect to be there.
Can you imagine using a database manager and not being able to search through your records? What happens when you have
500 rows?

### Text Search is not that easy at scale

Now, if you are familiar with our tech stack, particularly Firebase and Firestore, you would know that it’s not such an
easy task. In the past versions of
FireCMS, [we recommended using Algolia](https://firecms.co/docs/collections/text_search) as an external plugin. Or any
other compatible solutions, since you are in charge of everything, as in any open source product.

But what happens when you need it in a SaaS formulation. Recently, we
launched [FireCMS Cloud](https://app.firecms.co/p/hey-hoy-letsgo-cm3hx). We still allow customers to host their own
Google Cloud project resources, but the app used for managing the data is on our side. So, we are in charge of the CMS,
you don’t need to worry about that. Okay, great. We help you manage the app, rolling updates, support, and everything
else.

But, how can you build text search features for every project without indexing each one of your records? Well, there are
many responses, from using an external platform, such as Algolia, having our own Elasticsearch cluster or if you want to
be fancy, even using a [Vector store](https://www.elastic.co/what-is/vector-search), where you could have real semantic
search.

### Lean Solution

Okay, but that requires some work and we are not 100% sure that’s something all our customers want. In fact, we have
very little feature requests regarding this feature. So, we decided to go for a Lean solution. Start with something
small, but powerful enough to provide a solution meanwhile we think for a better solution. But still, something that can
help us validate that this will be helpful.

So we decided to implement in-browser search. Storing a local cache in the browser. It’s not the best solution in the
market, it’s probably a little slow for big collections. But it’s something that works right away. And solves the search
for most of our customers.

And what’s the best thing? You can activate it right away in your FireCMS Cloud project. We just rolled it out for
everyone.

![text_search_dialog.png](..%2Fstatic%2Fimg%2Fblog%2Ftext_search_dialog.png)

Now, our customers from [Botanica Madrid](https://botanicamadrid.com/) can find any exotic named plant, such as a
Zamioculca.

![botanica_search.png](..%2Fstatic%2Fimg%2Fblog%2Fbotanica_search.png)

Go try it and tell us what you think.

### Conclusion

So, when your team is small, sometimes it's helpful to build and release fast. Test, measure, and check if the
development effort may satisfy a problem your customers are having.

Anyway, if you need a hand setting up a project, you have any issue, or you need help building a feature, reach us out
at hello@firecms.co.[2023-09-19-openai_code_migration.md](2023-09-19-openai_code_migration.md)
