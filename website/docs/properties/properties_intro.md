---
id: properties_intro
title: Properties
description: Learn about FireCMS Properties and how to expertly define fields for forms and collection columns within your entity collections. Utilize the flexible `buildProperty` helper for TypeScript validation or create properties directly to fit your custom requirements. Discover dynamic property updates based on entity IDs, paths, or current values, ensuring your CMS fields adapt to your real-time data needs. Delve into conditional fields for tailored content management solutions, enhancing the functionality and user experience of your FireCMS setup. Whether dealing with text, numbers, or bespoke data types, master the art of property definition with FireCMS Properties.
---

Properties define each **field** in a form or column in a collection included in an
entity collection. 

You can build properties by creating the object directly or by
using the helper method `buildProperty` (just the identity function that uses
the Typescript type system to validate the input).

You may also want to update properties **dynamically**, based on the entityId, the
path or the current values. Check
the [conditional fields section](conditional_fields.md)

Check the different fields available in the fields section, or the
different property configurations.
