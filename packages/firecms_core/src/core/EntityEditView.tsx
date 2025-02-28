import React, { useEffect, useMemo, useState } from "react";
import { Entity, EntityCollection, EntityCustomView, EntityStatus, FireCMSPlugin, FormContext, User } from "../types";

import { CircularProgressCenter, EntityCollectionView, EntityView, ErrorBoundary } from "../components";
import { canEditEntity, removeInitialAndTrailingSlashes, resolveDefaultSelectedView, resolveEntityView } from "../util";

import {
    useAuthController,
    useCustomizationController,
    useEntityFetch,
    useFireCMSContext,
    useLargeLayout
} from "../hooks";
import { CircularProgress, cls, defaultBorderMixin, Tab, Tabs, Typography } from "@firecms/ui";
import { getEntityFromCache } from "../util/entity_cache";
import { EntityForm, EntityFormProps, FormLayoutInner } from "../form";
import { EntityEditViewFormActions } from "./EntityEditViewFormActions";

const MAIN_TAB_VALUE = "main_##Q$SC^#S6";

export type OnUpdateParams = {
    entity: Entity<any>,
    status: EntityStatus,
    path: string,
    entityId?: string;
    selectedTab?: string;
    collection: EntityCollection<any>
};

export type OnTabChangeParams<M extends Record<string, any>> = {
    path: string;
    entityId?: string;
    selectedTab?: string;
    collection: EntityCollection<M>;
};

export interface EntityEditViewProps<M extends Record<string, any>> {
    path: string;
    collection: EntityCollection<M>;
    entityId?: string;
    databaseId?: string;
    copy?: boolean;
    selectedTab?: string;
    parentCollectionIds: string[];
    onValuesModified?: (modified: boolean) => void;
    onSaved?: (params: OnUpdateParams) => void;
    onTabChange?: (props: OnTabChangeParams<M>) => void;
    layout?: "side_panel" | "full_screen";
    barActions?: React.ReactNode;
    formProps?: Partial<EntityFormProps<M>>
}

/**
 * This is the default view that is used as the content of a side panel when
 * an entity is opened.
 */
export function EntityEditView<M extends Record<string, any>, USER extends User>({
                                                                                     entityId,
                                                                                     ...props
                                                                                 }: EntityEditViewProps<M>) {

    const {
        entity,
        dataLoading,
        // eslint-disable-next-line no-unused-vars
        dataLoadingError
    } = useEntityFetch<M, USER>({
        path: props.path,
        entityId: entityId,
        collection: props.collection,
        databaseId: props.databaseId,
        useCache: false
    });

    const cachedValues = entityId
        ? getEntityFromCache(props.path + "/" + entityId)
        : getEntityFromCache(props.path + "#new");

    const authController = useAuthController();

    const initialStatus = props.copy ? "copy" : (entityId ? "existing" : "new");
    const [status, setStatus] = useState<EntityStatus>(initialStatus);

    const canEdit = useMemo(() => {
        if (status === "new" || status === "copy") {
            return true;
        } else {
            return entity ? canEditEntity(props.collection, authController, props.path, entity ?? null) : undefined;
        }
    }, [authController, entity, status]);

    if ((dataLoading && !cachedValues) || (!entity || canEdit === undefined) && (status === "existing" || status === "copy")) {
        return <CircularProgressCenter/>;
    }

    if (entityId && !entity && !cachedValues) {
        console.error(`Entity with id ${entityId} not found in collection ${props.path}`);
    }

    if (!canEdit) {
        return <div className={"flex flex-col"}>
            <Typography className={"mt-16 mb-8 mx-8"} variant={"h4"}>
                {props.collection.singularName ?? props.collection.name}
            </Typography>
            <EntityView
                className={"px-8"}
                entity={entity as Entity<M>}
                path={props.path}
                collection={props.collection}/>
        </div>
    }

    return <EntityEditViewInner<M> {...props}
                                   entityId={entityId}
                                   entity={entity}
                                   cachedDirtyValues={cachedValues as Partial<M>}
                                   dataLoading={dataLoading}
                                   status={status}
                                   setStatus={setStatus}
    />;
}

function SecondaryForm<M extends object>({
                                             collection,
                                             className,
                                             customView,
                                             entity,
                                             formContext,
                                             forceActionsAtTheBottom,
                                         }: {
    className?: string,
    customView: EntityCustomView,
    formContext: FormContext<M>,
    collection: EntityCollection<M>,
    forceActionsAtTheBottom?: boolean,
    entity: Entity<M> | undefined,
}) {

    if (!customView.Builder) {
        console.error("customView.Builder is not defined");
        return null;
    }

    return <FormLayoutInner
        className={className}
        forceActionsAtTheBottom={forceActionsAtTheBottom}
        formContext={formContext}
        EntityFormActionsComponent={EntityEditViewFormActions}>
        <ErrorBoundary>
            {formContext && <customView.Builder
                collection={collection}
                entity={entity}
                modifiedValues={formContext.formex.values ?? entity?.values}
                formContext={formContext}
            />}
        </ErrorBoundary>
    </FormLayoutInner>;
}

export function EntityEditViewInner<M extends Record<string, any>>({
                                                                       path,
                                                                       entityId,
                                                                       selectedTab: selectedTabProp,
                                                                       collection,
                                                                       parentCollectionIds,
                                                                       onValuesModified,
                                                                       onSaved,
                                                                       onTabChange,
                                                                       entity,
                                                                       cachedDirtyValues,
                                                                       dataLoading,
                                                                       layout = "side_panel",
                                                                       barActions,
                                                                       status,
                                                                       setStatus,
                                                                       formProps,
                                                                   }: EntityEditViewProps<M> & {
    entity?: Entity<M>,
    cachedDirtyValues?: Partial<M>, // dirty cached entity in memory
    dataLoading: boolean,
    status: EntityStatus,
    setStatus: (status: EntityStatus) => void,
}) {

    const context = useFireCMSContext();

    const [usedEntity, setUsedEntity] = useState<Entity<M> | undefined>(entity);

    useEffect(() => {
        if (entity)
            setUsedEntity(entity);
    }, [entity]);

    // Instead of using a ref (which does not trigger re-render), we use state for the form context.
    const [formContext, setFormContext] = useState<FormContext<M> | undefined>(undefined);

    const largeLayout = useLargeLayout();

    const customizationController = useCustomizationController();

    const defaultSelectedView = useMemo(() => resolveDefaultSelectedView(
        collection ? collection.defaultSelectedView : undefined,
        {
            status,
            entityId
        }
    ), []);

    const [selectedTab, setSelectedTab] = useState<string>(selectedTabProp ?? defaultSelectedView ?? MAIN_TAB_VALUE);

    useEffect(() => {
        if ((selectedTabProp ?? MAIN_TAB_VALUE) !== selectedTab) {
            setSelectedTab(selectedTabProp ?? MAIN_TAB_VALUE);
        }
    }, [selectedTabProp]);

    const mainViewVisible = selectedTab === MAIN_TAB_VALUE;

    const subcollections = (collection.subcollections ?? []).filter(c => !c.hideFromNavigation);
    const subcollectionsCount = subcollections?.length ?? 0;
    const customViews = collection.entityViews;
    const customViewsCount = customViews?.length ?? 0;
    const hasAdditionalViews = customViewsCount > 0 || subcollectionsCount > 0;

    const resolvedEntityViews = customViews ? customViews
            .map(e => resolveEntityView(e, customizationController.entityViews))
            .filter(Boolean) as EntityCustomView[]
        : [];

    const selectedEntityView = resolvedEntityViews.find(e => e.key === selectedTab);
    const actionsAtTheBottom = !largeLayout || layout === "side_panel" || selectedEntityView?.includeActions === "bottom";

    const secondaryForms: React.ReactNode[] | undefined = formContext && customViews && resolvedEntityViews
        .filter(e => e.includeActions)
        .map((customView) => {
            if (!customView || !formContext)
                return null;

            if (!customView.Builder) {
                console.error("customView.Builder is not defined");
                return null;
            }

            return <SecondaryForm key={`custom_view_${customView.key}`}
                                  className={selectedTab !== customView.key ? "hidden" : ""}
                                  customView={customView}
                                  formContext={formContext}
                                  collection={collection}
                                  forceActionsAtTheBottom={!largeLayout || layout === "side_panel" || customView.includeActions === "bottom"}
                                  entity={usedEntity}/>;

        }).filter(Boolean);

    const customViewsView: React.ReactNode[] | undefined = customViews && resolvedEntityViews
        .filter(e => !e.includeActions)
        .map((customView) => {
            if (!customView)
                return null;
            const Builder = customView.Builder;
            if (!Builder) {
                console.error("customView.Builder is not defined");
                return null;
            }

            return <div
                className={cls(defaultBorderMixin,
                    "relative flex-1 w-full h-full overflow-auto",
                    { "hidden": selectedTab !== customView.key }
                )}
                key={`custom_view_${customView.key}`}
                role="tabpanel">
                <ErrorBoundary>
                    {formContext && <Builder
                        collection={collection}
                        entity={usedEntity}
                        modifiedValues={formContext.formex.values ?? usedEntity?.values}
                        formContext={formContext}
                    />}
                </ErrorBoundary>
            </div>;
        }).filter(Boolean);

    const globalLoading = dataLoading && !usedEntity;

    const subCollectionsViews = subcollections && subcollections.map((subcollection) => {
        const subcollectionId = subcollection.id ?? subcollection.path;
        const fullPath = usedEntity ? `${path}/${usedEntity?.id}/${removeInitialAndTrailingSlashes(subcollectionId)}` : undefined;
        if (selectedTab !== subcollectionId) return null;
        return (
            <div
                className={"relative flex-1 h-full overflow-auto w-full"}
                key={`subcol_${subcollectionId}`}
                role="tabpanel">

                {globalLoading && <CircularProgressCenter/>}

                {!globalLoading &&
                    (usedEntity && fullPath
                        ? <EntityCollectionView
                            fullPath={fullPath}
                            parentCollectionIds={[...parentCollectionIds, collection.id]}
                            isSubCollection={true}
                            updateUrl={false}
                            {...subcollection}
                            openEntityMode={layout}/>
                        : <div className="flex items-center justify-center w-full h-full p-3">
                            <Typography variant={"label"}>
                                You need to save your entity before
                                adding additional collections
                            </Typography>
                        </div>)
                }

            </div>
        );
    }).filter(Boolean);

    const onSideTabClick = (value: string) => {
        setSelectedTab(value);
        if (status === "existing") {
            onTabChange?.({
                path,
                entityId,
                selectedTab: value === MAIN_TAB_VALUE ? undefined : value,
                collection
            });
        }
    };

    // Render the main entity form view (or a read-only view if the user cannot edit)
    const entityView = <EntityForm<M>
        collection={collection}
        path={path}
        entityId={entityId ?? usedEntity?.id}
        onValuesModified={onValuesModified}
        entity={entity}
        initialDirtyValues={cachedDirtyValues}
        openEntityMode={layout}
        forceActionsAtTheBottom={actionsAtTheBottom}
        initialStatus={status}
        className={cls(!mainViewVisible ? "hidden" : "", formProps?.className)}
        EntityFormActionsComponent={EntityEditViewFormActions}
        {...formProps}
        onEntityChange={(entity) => {
            setUsedEntity(entity);
            formProps?.onEntityChange?.(entity);
        }}
        onStatusChange={(status) => {
            setStatus(status);
            formProps?.onStatusChange?.(status);
        }}
        onFormContextReady={(formContext) => {
            setFormContext(formContext);
            formProps?.onFormContextReady?.(formContext);
        }}
        onSaved={(params) => {
            const res = {
                ...params,
                selectedTab: MAIN_TAB_VALUE === selectedTab ? undefined : selectedTab,
            };
            onSaved?.(res);
            formProps?.onSaved?.(res);
        }}
    />;

    const subcollectionTabs = subcollections && subcollections.map((subcollection) =>
        <Tab
            className="text-sm min-w-[120px]"
            value={subcollection.id}
            key={`entity_detail_collection_tab_${subcollection.name}`}>
            {subcollection.name}
        </Tab>
    );

    const customViewTabs = resolvedEntityViews.map((view) =>
        <Tab
            className="text-sm min-w-[120px]"
            value={view.key}
            key={`entity_detail_collection_tab_${view.name}`}>
            {view.name}
        </Tab>
    );

    const shouldShowTopBar = Boolean(barActions) || hasAdditionalViews;

    let result = <div className="relative flex flex-col h-full w-full bg-white dark:bg-surface-900">

        {shouldShowTopBar && <div
            className={cls("h-14 flex overflow-visible overflow-x-scroll w-full no-scrollbar h-14 border-b pl-2 pr-2 pt-1 flex items-end bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>

            {barActions}

            <div className={"flex-grow"}/>

            {globalLoading && <div className="self-center">
                <CircularProgress size={"small"}/>
            </div>}

            {hasAdditionalViews && <Tabs
                value={selectedTab}
                onValueChange={(value) => {
                    onSideTabClick(value);
                }}>

                <Tab
                    disabled={!hasAdditionalViews}
                    value={MAIN_TAB_VALUE}
                    className={"text-sm min-w-[120px]"}>
                    {collection.singularName ?? collection.name}
                </Tab>

                {customViewTabs}

                {subcollectionTabs}
            </Tabs>}
        </div>}

        {globalLoading
            ? <div className="w-full pt-12 pb-16 px-4 sm:px-8 md:px-10">
                <CircularProgressCenter/>
            </div>
            : entityView}

        {secondaryForms}

        {customViewsView}

        {subCollectionsViews}

    </div>;

    const plugins = customizationController.plugins;

    if (plugins) {
        plugins.forEach((plugin: FireCMSPlugin) => {
            if (plugin.form?.provider) {
                result = (
                    <plugin.form.provider.Component
                        status={status}
                        path={path}
                        collection={collection}
                        entity={usedEntity}
                        context={context}
                        formContext={formContext}
                        {...plugin.form.provider.props}>
                        {result}
                    </plugin.form.provider.Component>
                );
            }
        });
    }

    return result;
}

