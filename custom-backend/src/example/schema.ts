import { customType, decimal, index, integer, jsonb, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Define enums for status fields
export const machineryStatusEnum = pgEnum("machinery_status", ["available", "rented", "maintenance", "retired"]);
export const offerStatusEnum = pgEnum("offer_status", ["draft", "sent", "accepted", "rejected", "expired"]);
export const rentalStatusEnum = pgEnum("rental_status", ["active", "completed", "cancelled", "overdue"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "partial", "overdue"]);

const customDecimal = customType<{ data: number; driverData: string }>({
    dataType() {
        return "decimal";
    },
    // Get value from database and convert it to a number
    fromDriver(value: string): number {
        return parseFloat(value);
    },
    // Send value to the database (optional but good practice)
    toDriver(value: number): string {
        return String(value);
    },
});

// Customers table
export const customers = pgTable("customers", {
    id: integer("id").primaryKey(),
    name: varchar("name").notNull(),
    contactPerson: varchar("contact_person"),
    email: varchar("email").notNull(),
    phoneNumber: varchar("phone_number"),
    address: jsonb("address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
}, (table) => ({
    emailIdx: index("customers_email_idx").on(table.email)
}));

// Machinery table
export const machinery = pgTable("machinery", {
    id: integer("id").primaryKey(),
    name: varchar("name").notNull(),
    brand: varchar("brand"),
    model: varchar("model"),
    serialNumber: varchar("serial_number").notNull(),
    acquisitionDate: timestamp("acquisition_date", { withTimezone: true }),
    status: machineryStatusEnum("status").notNull(),
    dailyRate: customDecimal("daily_rate").notNull(),
    specifications: jsonb("specifications"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
}, (table) => ({
    statusIdx: index("machinery_status_idx").on(table.status),
    serialNumberIdx: index("machinery_serial_number_idx").on(table.serialNumber)
}));

// Machinery images table (sub-collection)
export const machineryImages = pgTable("machinery_images", {
    order: integer("_order").notNull(),
    parentId: integer("_parent_id").notNull(),
    id: varchar("id").primaryKey(),
    url: varchar("url")
});

// Maintenance history table
export const maintenanceHistory = pgTable("maintenance_history", {
    id: integer("id").primaryKey(),
    machineryId: integer("machinery_id").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    description: varchar("description").notNull(),
    cost: customDecimal("cost"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
}, (table) => ({
    machineryIdIdx: index("maintenance_machinery_id_idx").on(table.machineryId)
}));

// Media table
export const media = pgTable("media", {
    id: integer("id").primaryKey(),
    alt: varchar("alt").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    url: varchar("url"),
    thumbnailUrl: varchar("thumbnail_u_r_l"),
    filename: varchar("filename"),
    mimeType: varchar("mime_type"),
    filesize: customDecimal("filesize"),
    width: customDecimal("width"),
    height: customDecimal("height"),
    focalX: customDecimal("focal_x"),
    focalY: customDecimal("focal_y")
});

// Offers table
export const offers = pgTable("offers", {
    id: integer("id").primaryKey(),
    offerId: varchar("offer_id").notNull(),
    customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
    machineryId: integer("machinery_id").notNull(),
    offerDate: timestamp("offer_date", { withTimezone: true }).notNull(),
    expirationDate: timestamp("expiration_date", { withTimezone: true }),
    price: customDecimal("price").notNull(),
    status: offerStatusEnum("status").notNull(),
    relatedRentalId: integer("related_rental_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
}, (table) => ({
    customerIdIdx: index("offers_customer_id_idx").on(table.customerId),
    machineryIdIdx: index("offers_machinery_id_idx").on(table.machineryId),
    statusIdx: index("offers_status_idx").on(table.status)
}));

// Payment history table
export const paymentHistory = pgTable("payment_history", {
    id: integer("id").primaryKey(),
    rentalId: integer("rental_id").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    amount: customDecimal("amount").notNull(),
    paymentMethod: varchar("payment_method"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
}, (table) => ({
    rentalIdIdx: index("payment_rental_id_idx").on(table.rentalId)
}));

// Rentals table
export const rentals = pgTable("rentals", {
    id: integer("id").primaryKey(),
    rentalId: varchar("rental_id").notNull(),
    customerId: integer("customer_id").notNull(),
    machineryId: integer("machinery_id").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    status: rentalStatusEnum("status").notNull(),
    totalPrice: customDecimal("total_price").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull(),
    contractDocumentUrl: varchar("contract_document_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
}, (table) => ({
    customerIdIdx: index("rentals_customer_id_idx").on(table.customerId),
    machineryIdIdx: index("rentals_machinery_id_idx").on(table.machineryId),
    statusIdx: index("rentals_status_idx").on(table.status),
    startDateIdx: index("rentals_start_date_idx").on(table.startDate)
}));

// Users table (for authentication)
export const users = pgTable("users", {
    id: integer("id").primaryKey(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    email: varchar("email").notNull(),
    resetPasswordToken: varchar("reset_password_token"),
    resetPasswordExpiration: timestamp("reset_password_expiration", { withTimezone: true }),
    salt: varchar("salt"),
    hash: varchar("hash"),
    loginAttempts: customDecimal("login_attempts"),
    lockUntil: timestamp("lock_until", { withTimezone: true })
}, (table) => ({
    emailIdx: index("users_email_idx").on(table.email)
}));

// User sessions table (sub-collection)
export const usersSessions = pgTable("users_sessions", {
    order: integer("_order").notNull(),
    parentId: integer("_parent_id").notNull(),
    id: varchar("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});

