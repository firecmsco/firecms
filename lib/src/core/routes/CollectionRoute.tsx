import React from "react";

import { Route } from "react-router-dom";

import { EntityCollection } from "../../models";
import { useNavigationContext } from "../../hooks";
import { EntityCollectionView } from "../components";
import { BreadcrumbUpdater } from "./BreadcrumbUpdater";

export function CollectionRoute({ collection }: { collection: EntityCollection }) {
    const navigation = useNavigationContext();
    const urlPath = navigation.buildUrlCollectionPath(collection.alias ?? collection.path);
    return <Route path={urlPath + "/*"}
                  element={
                      <BreadcrumbUpdater
                          path={urlPath}
                          title={collection.name}>
                          <EntityCollectionView
                              fullPath={collection.path}
                              collection={collection}/>
                      </BreadcrumbUpdater>
                  }/>;
}
