import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { merchantLocations } from "./merchant-locations";
import { staff } from "./staff";
import { users } from "../../../db/schema";
import { items, customizationGroups, customizationOptions } from "./menus";

// =============================================================================
// ENUMS
// =============================================================================

export const tableStatusEnum = pgEnum("table_status", [
  "available",
  "occupied",
  "reserved",
  "unavailable",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
]);

export const orderTypeEnum = pgEnum("order_type", [
  "dine_in",
  "pickup",
  "delivery",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "partial",
  "paid",
  "refunded",
]);

export const paymentTimingEnum = pgEnum("payment_timing", [
  "pay_first",
  "pay_later",
]);

export const orderItemStatusEnum = pgEnum("order_item_status", [
  "pending",
  "preparing",
  "ready",
  "served",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "cash",
  "mobile",
  "other",
]);

export const paymentTransactionStatusEnum = pgEnum("payment_transaction_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

// =============================================================================
// TABLE 1: TABLES (Physical restaurant tables)
// =============================================================================

export const tables = pgTable(
  "tables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => merchantLocations.id, { onDelete: "cascade" }),
    tableNumber: varchar("table_number", { length: 20 }).notNull(),
    seats: integer("seats"),
    status: tableStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    locationIdIdx: index("tables_location_id_idx").on(table.locationId),
    locationTableNumberUnique: uniqueIndex("tables_location_table_number_unique").on(
      table.locationId,
      table.tableNumber,
    ),
  }),
);

// =============================================================================
// TABLE 2: CUSTOMERS
// =============================================================================

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id), // nullable (guest)
    locationId: uuid("location_id")
      .notNull()
      .references(() => merchantLocations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    locationIdIdx: index("customers_location_id_idx").on(table.locationId),
    userIdIdx: index("customers_user_id_idx").on(table.userId),
  }),
);

// =============================================================================
// TABLE 3: RESERVATIONS
// =============================================================================

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => merchantLocations.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id),
    tableId: uuid("table_id").references(() => tables.id),
    partySize: integer("party_size").notNull(),
    reservationDate: date("reservation_date").notNull(),
    reservationTime: varchar("reservation_time", { length: 10 }).notNull(), // TIME as VARCHAR
    status: reservationStatusEnum("status").notNull().default("pending"),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }),
    customerEmail: varchar("customer_email", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    locationIdIdx: index("reservations_location_id_idx").on(table.locationId),
    reservationDateIdx: index("reservations_reservation_date_idx").on(
      table.reservationDate,
    ),
    statusIdx: index("reservations_status_idx").on(table.status),
  }),
);

// =============================================================================
// TABLE 4: ORDERS
// =============================================================================

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => merchantLocations.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id),
    tableId: uuid("table_id").references(() => tables.id),
    reservationId: uuid("reservation_id").references(() => reservations.id),
    assignedStaffId: uuid("assigned_staff_id").references(() => staff.id),
    orderNumber: varchar("order_number", { length: 20 }).notNull(),
    orderType: orderTypeEnum("order_type").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("unpaid"),
    paymentTiming: paymentTimingEnum("payment_timing").notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    serviceCharge: decimal("service_charge", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    tipAmount: decimal("tip_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    total: decimal("total", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    notes: text("notes"),
    estimatedReadyAt: timestamp("estimated_ready_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    locationIdIdx: index("orders_location_id_idx").on(table.locationId),
    customerIdIdx: index("orders_customer_id_idx").on(table.customerId),
    statusIdx: index("orders_status_idx").on(table.status),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  }),
);

// =============================================================================
// TABLE 5: ORDER_ITEMS
// =============================================================================

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").references(() => items.id, { onDelete: "set null" }),
    itemName: varchar("item_name", { length: 255 }).notNull(), // snapshot
    itemPrice: decimal("item_price", { precision: 10, scale: 2 }).notNull(), // snapshot
    quantity: integer("quantity").notNull().default(1),
    customizationsTotal: decimal("customizations_total", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0.00"),
    lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    status: orderItemStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
  }),
);

// =============================================================================
// TABLE 6: ORDER_ITEM_CUSTOMIZATIONS
// =============================================================================

export const orderItemCustomizations = pgTable(
  "order_item_customizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    groupId: uuid("group_id").references(() => customizationGroups.id, {
      onDelete: "set null",
    }),
    optionId: uuid("option_id").references(() => customizationOptions.id, {
      onDelete: "set null",
    }),
    groupName: varchar("group_name", { length: 255 }).notNull(), // snapshot
    optionName: varchar("option_name", { length: 255 }).notNull(), // snapshot
    optionPrice: decimal("option_price", { precision: 10, scale: 2 }).notNull(), // snapshot
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orderItemIdIdx: index("order_item_customizations_order_item_id_idx").on(
      table.orderItemId,
    ),
  }),
);

// =============================================================================
// TABLE 7: ORDER_TIMELINE
// =============================================================================

export const orderTimeline = pgTable(
  "order_timeline",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    changedByStaffId: uuid("changed_by_staff_id").references(() => staff.id),
    changedByUserId: text("changed_by_user_id").references(() => users.id),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("order_timeline_order_id_idx").on(table.orderId),
  }),
);

// =============================================================================
// TABLE 8: PAYMENTS
// =============================================================================

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    tipAmount: decimal("tip_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    method: paymentMethodEnum("method").notNull(),
    status: paymentTransactionStatusEnum("status")
      .notNull()
      .default("pending"),
    provider: varchar("provider", { length: 50 }), // e.g., 'stripe', 'mollie'
    providerTransactionId: varchar("provider_transaction_id", { length: 255 }),
    providerResponse: jsonb("provider_response"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("payments_order_id_idx").on(table.orderId),
    statusIdx: index("payments_status_idx").on(table.status),
  }),
);

// =============================================================================
// TABLE 9: ORDER_DELIVERY
// =============================================================================

export const orderDelivery = pgTable(
  "order_delivery",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    deliveryInstructions: text("delivery_instructions"),
    deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    estimatedDeliveryAt: timestamp("estimated_delivery_at", {
      withTimezone: true,
    }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("order_delivery_order_id_idx").on(table.orderId),
    orderIdUnique: uniqueIndex("order_delivery_order_id_unique").on(
      table.orderId,
    ),
  }),
);

// =============================================================================
// RELATIONS
// =============================================================================

export const tablesRelations = relations(tables, ({ one, many }) => ({
  location: one(merchantLocations, {
    fields: [tables.locationId],
    references: [merchantLocations.id],
  }),
  reservations: many(reservations),
  orders: many(orders),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  location: one(merchantLocations, {
    fields: [customers.locationId],
    references: [merchantLocations.id],
  }),
  reservations: many(reservations),
  orders: many(orders),
}));

export const reservationsRelations = relations(
  reservations,
  ({ one, many }) => ({
    location: one(merchantLocations, {
      fields: [reservations.locationId],
      references: [merchantLocations.id],
    }),
    customer: one(customers, {
      fields: [reservations.customerId],
      references: [customers.id],
    }),
    table: one(tables, {
      fields: [reservations.tableId],
      references: [tables.id],
    }),
    orders: many(orders),
  }),
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  location: one(merchantLocations, {
    fields: [orders.locationId],
    references: [merchantLocations.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
  reservation: one(reservations, {
    fields: [orders.reservationId],
    references: [reservations.id],
  }),
  assignedStaff: one(staff, {
    fields: [orders.assignedStaffId],
    references: [staff.id],
  }),
  orderItems: many(orderItems),
  timeline: many(orderTimeline),
  payments: many(payments),
  delivery: one(orderDelivery, {
    fields: [orders.id],
    references: [orderDelivery.orderId],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  item: one(items, {
    fields: [orderItems.itemId],
    references: [items.id],
  }),
  customizations: many(orderItemCustomizations),
}));

export const orderItemCustomizationsRelations = relations(
  orderItemCustomizations,
  ({ one }) => ({
    orderItem: one(orderItems, {
      fields: [orderItemCustomizations.orderItemId],
      references: [orderItems.id],
    }),
    group: one(customizationGroups, {
      fields: [orderItemCustomizations.groupId],
      references: [customizationGroups.id],
    }),
    option: one(customizationOptions, {
      fields: [orderItemCustomizations.optionId],
      references: [customizationOptions.id],
    }),
  }),
);

export const orderTimelineRelations = relations(orderTimeline, ({ one }) => ({
  order: one(orders, {
    fields: [orderTimeline.orderId],
    references: [orders.id],
  }),
  changedByStaff: one(staff, {
    fields: [orderTimeline.changedByStaffId],
    references: [staff.id],
  }),
  changedByUser: one(users, {
    fields: [orderTimeline.changedByUserId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const orderDeliveryRelations = relations(orderDelivery, ({ one }) => ({
  order: one(orders, {
    fields: [orderDelivery.orderId],
    references: [orders.id],
  }),
}));

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type OrderItemCustomization =
  typeof orderItemCustomizations.$inferSelect;
export type NewOrderItemCustomization =
  typeof orderItemCustomizations.$inferInsert;

export type OrderTimeline = typeof orderTimeline.$inferSelect;
export type NewOrderTimeline = typeof orderTimeline.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type OrderDelivery = typeof orderDelivery.$inferSelect;
export type NewOrderDelivery = typeof orderDelivery.$inferInsert;
