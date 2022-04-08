---
id: use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Get the context that includes the internal controllers and contexts used by the app.
Some controllers and context included in this context can be accessed
directly from their respective hooks.

The props provided by this context are:

* `dateTimeFormat`?: Format of the dates in the CMS.
  Defaults to 'MMMM dd, yyyy, HH:mm:ss'

* `locale`?: Locale of the CMS, currently only affecting dates

* `dataSource`:Connector to your database, e.g. your Firestore database

* `storageSource`: Used storage implementation

* `schemaRegistryController`: This controller is in charge of resolving the entity schemas from a given
  path. It takes into account the `navigation` prop set in the main level of the
  CMSApp as well as the `schemaResolver` in case you want to override schemas
  to specific entities.

* `navigationContext`: Context that includes the resolved navigation and utility methods and
  attributes.

* `sideEntityController`: Controller to open the side dialog displaying entity forms

* `authController`: Used auth controller

* `entityLinkBuilder`?: Builder for generating utility links for entities
