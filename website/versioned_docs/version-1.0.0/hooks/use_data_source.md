---
id: use_data_source
title: useDataSource
sidebar_label: useDataSource
---

Use this hook to get the datasource being used.

This controller allows you to fetch and save data from the datasource (such
as Firestore) using the abstraction of collection and entities created by FireCMS.

* `fetchCollection`: Fetch data from a collection
* `listenCollection`: Listen to a entities in a given path.
* `fetchEntity`: Retrieve an entity given a path and a schema
* `listenEntity`: Get realtime updates on one entity.
* `saveEntity`: Save entity to the specified path
* `deleteEntity`: Delete an entity
* `checkUniqueField`: Check if the given property is unique in the given collection
