/**
 * CMS Property types.
 * 
 * Since Field and Preview are now part of BaseProperty in @rebasepro/types,
 * the CMS types are simply re-exports of the core types.
 * This file exists so that CMS consumers can import from @rebasepro/cms.
 */
export type {
    Property,
    Properties,
    StringProperty,
    NumberProperty,
    BooleanProperty,
    DateProperty,
    GeopointProperty,
    ReferenceProperty,
    RelationProperty,
    ArrayProperty,
    MapProperty,
} from "@rebasepro/types";
