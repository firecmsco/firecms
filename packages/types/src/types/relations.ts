
/**
 * Represents a one() relation - equivalent to Drizzle's one() function
 * Used for one-to-one and many-to-one relationships
 * @group Models
 */
export interface OneRelation {
    type: "one";
    /**
     * Target collection this relation points to
     */
    target: string;
    /**
     * Configuration for the foreign key relationship
     */
    fields: string[];
    references: string[];
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}

/**
 * Represents a many() relation - equivalent to Drizzle's many() function
 * Used for one-to-many relationships (WITHOUT intermediate table)
 * @group Models
 */
export interface ManyRelation {
    type: "many";
    /**
     * Target collection this relation points to
     */
    target: string;
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}

/**
 * Represents a many-to-many relation through an intermediate/junction table
 * This is the most complex relation type covering junction table scenarios
 * @group Models
 */
export interface ManyToManyRelation {
    type: "manyToMany";
    /**
     * Target collection this relation points to
     */
    target: string;
    /**
     * Junction/intermediate table configuration
     */
    through: {
        /**
         * Junction table collection reference
         */
        table: string;
        /**
         * Foreign key in junction table that references this collection
         */
        sourceKey: string;
        /**
         * Foreign key in junction table that references the target collection
         */
        targetKey: string;
    };
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}

/**
 * Self-referencing relation for hierarchical data (e.g., categories, comments)
 * Handles parent-child relationships within the same table
 * @group Models
 */
export interface SelfRelation {
    type: "self";
    /**
     * The foreign key field that references the parent record
     */
    parentKey: string;
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
    /**
     * Whether this is a one-to-many (parent has many children) or many-to-one (child has one parent)
     */
    direction: "parentToChildren" | "childToParent";
}

/**
 * Polymorphic relation - relates to multiple different table types
 * Common in CMS systems (e.g., comments that can belong to posts, pages, products)
 * @group Models
 */
export interface PolymorphicRelation {
    type: "polymorphic";
    /**
     * Array of possible target collections
     */
    targets: Array<{
        /**
         * Target collection reference
         */
        target: string;
        /**
         * Value that identifies this target type in the type discriminator field
         */
        typeValue: string;
    }>;
    /**
     * Field that stores the foreign key ID
     */
    foreignKey: string;
    /**
     * Field that stores the type discriminator (which table the foreign key points to)
     */
    typeKey: string;
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}

/**
 * Conditional relation - relation that depends on a condition/filter
 * Useful for soft deletes, status-based relations, etc.
 * @group Models
 */
export interface ConditionalRelation {
    type: "conditional";
    /**
     * Target collection this relation points to
     */
    target: string;
    /**
     * Configuration for the foreign key relationship
     */
    fields: string[];
    references: string[];
    /**
     * Condition that must be met for the relation to be active
     */
    where: {
        /**
         * Field to check the condition on
         */
        field: string;
        /**
         * Operator for the condition
         */
        operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "IN" | "NOT IN" | "IS NULL" | "IS NOT NULL";
        /**
         * Value to compare against (not needed for NULL checks)
         */
        value?: any;
    };
    /**
     * Whether this is a one-to-many or many-to-one relationship
     */
    cardinality: "one" | "many";
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}

/**
 * Composite key relation - for tables with composite primary keys
 * Handles relations where multiple fields form the foreign key
 * @group Models
 */
export interface CompositeRelation {
    type: "composite";
    /**
     * Target collection this relation points to
     */
    target: string;
    /**
     * Array of field mappings for composite keys
     */
    keys: Array<{
        /**
         * Local field name
         */
        local: string;
        /**
         * Foreign field name
         */
        foreign: string;
    }>;
    /**
     * Whether this is a one-to-many or many-to-one relationship
     */
    cardinality: "one" | "many";
    /**
     * Optional relationship name for explicit naming
     */
    relationName?: string;
}

/**
 * Base relation type that covers ALL PostgreSQL relation patterns
 * @group Models
 */
export type BaseRelation =
    | OneRelation
    | ManyRelation
    | ManyToManyRelation
    | SelfRelation
    | PolymorphicRelation
    | ConditionalRelation
    | CompositeRelation;

/**
 * FireCMS-specific UI extensions for relations
 * This extends the base relation with UI configuration
 * @group Models
 */
export interface RelationConfig {
    /**
     * Display name for this relation in the UI
     */
    name?: string;
    /**
     * Singular name for entities in this relation
     */
    singularName?: string;
    /**
     * Icon to display for this relation
     */
    icon?: string | React.ReactNode;
    /**
     * How to render this relation in the UI
     */
    widget?: "select" | "subcollection";
    /**
     * Properties from the target collection to display in previews
     */
    previewProperties?: string[];
    /**
     * Additional filters to apply when loading related entities
     */
    additionalFilter?: Record<string, any>;
    /**
     * Default sort order for related entities
     */
    defaultSort?: [string, "asc" | "desc"];
    /**
     * Whether this relation should be displayed as a tab in the entity view
     */
    displayAsTab?: boolean;
    /**
     * Position of this relation in the entity view
     */
    position?: "start" | "end";
    /**
     * Whether this relation is hidden from the UI
     */
    hidden?: boolean;
    /**
     * Custom description for this relation
     */
    description?: string;
    /**
     * Permissions for this relation
     */
    permissions?: {
        read?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
        link?: boolean;   // For many-to-many: can link existing entities
        unlink?: boolean; // For many-to-many: can unlink entities
    };
    /**
     * Whether users can create new related entities directly from this relation view
     */
    allowCreate?: boolean;
    /**
     * Whether users can edit related entities directly from this relation view
     */
    allowEdit?: boolean;
    /**
     * Whether users can delete related entities directly from this relation view
     */
    allowDelete?: boolean;
    /**
     * Custom validation for this relation
     */
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
    };
    /**
     * For hierarchical/self relations: how deep to load the tree
     */
    maxDepth?: number;
    /**
     * For polymorphic relations: custom labels for each target type
     */
    typeLabels?: Record<string, string>;
}

/**
 * Extended relation that combines base relation with FireCMS UI config
 * @group Models
 */
export type ExtendedRelation = BaseRelation & {
    /**
     * FireCMS-specific UI configuration
     */
    ui?: RelationConfig;
};

/**
 * Collection relations object - comprehensive relation definitions
 * @group Models
 */
export type CollectionRelations = Record<string, ExtendedRelation>;
