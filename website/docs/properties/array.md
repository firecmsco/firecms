---
id: array
title: Array
sidebar_label: Array
---

##  `of`

The property of this array.

You can specify any property (except another Array property, since
Firestore does not support it)
You can leave this field empty only if you are providing a custom field,
otherwise an error will be thrown.

## `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.
* `min` Set the minimum length allowed.
* `max` Set the maximum length allowed.

