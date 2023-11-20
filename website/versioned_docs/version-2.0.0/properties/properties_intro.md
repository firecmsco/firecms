---
id: properties_intro
title: Properties
---

Properties define each **field** in a form or column in a collection included in an
entity collection. 

You can build properties by creating the object directly or by
using the helper method `buildProperty` (just the identity function that uses
the Typescript type system to validate the input).

You may also want to update properties **dynamically**, based on the entityId, the
path or the current values. Check
the [conditional fields section](conditional_fields.md)
