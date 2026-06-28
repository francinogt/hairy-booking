import { relations } from "drizzle-orm";
import {
  boolean,
  datetime,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Schema fuer hairy-booking (Single-Tenant pro Firma).
 *
 * Konventionen:
 * - Fachliche Zeitpunkte als `datetime` im `string`-Modus (naive Ortszeit in der
 *   Firmen-Zeitzone, keine implizite TZ-Konvertierung durch Node/mysql2).
 * - Audit-Felder als `timestamp` (defaultNow / onUpdateNow).
 * - Geld als `decimal(10,2)` (nie float; Drizzle liefert string).
 * - Spaltennamen explizit in snake_case.
 */

export const USER_ROLES = ["owner", "admin", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** Rollen, die per Einladung vergeben werden koennen (kein owner). */
export const INVITE_ROLES = ["admin", "customer"] as const;
export type InviteRole = (typeof INVITE_ROLES)[number];

/** Aktive Belegungen, die bei der Slot-Berechnung als "besetzt" zaehlen. */
export const ACTIVE_APPOINTMENT_STATUSES = ["pending", "confirmed"] as const;

export const USER_GENDERS = ["male", "female", "diverse"] as const;
export type UserGender = (typeof USER_GENDERS)[number];

export const BODY_VIEWS = ["front", "back"] as const;
export type BodyView = (typeof BODY_VIEWS)[number];

export const BOOKING_REQUEST_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "cancelled",
] as const;
export type BookingRequestStatus = (typeof BOOKING_REQUEST_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "booking_request_new",
  "booking_request_confirmed",
  "booking_request_declined",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ---------------------------------------------------------------------------
// settings — Single-Row (id = 1): Firmen-Konfiguration + Branding
// ---------------------------------------------------------------------------
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),

  // Firma
  companyName: varchar("company_name", { length: 120 }).notNull().default("Mein Studio"),
  shortName: varchar("short_name", { length: 24 }).notNull().default("Studio"),
  industry: varchar("industry", { length: 50 }).notNull().default("tattoo"),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 40 }),
  addressLine: varchar("address_line", { length: 160 }),
  postalCode: varchar("postal_code", { length: 16 }),
  city: varchar("city", { length: 80 }),
  countryCode: varchar("country_code", { length: 2 }).notNull().default("CH"),

  // Lokalisierung & Buchungsregeln
  timezone: varchar("timezone", { length: 64 }).notNull().default("Europe/Zurich"),
  locale: varchar("locale", { length: 10 }).notNull().default("de-CH"),
  currency: varchar("currency", { length: 3 }).notNull().default("CHF"),
  slotIntervalMin: int("slot_interval_min").notNull().default(15),
  leadTimeMin: int("lead_time_min").notNull().default(60),
  bookingHorizonDays: int("booking_horizon_days").notNull().default(60),
  minPriceAmount: decimal("min_price_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),

  // Branding (vor dem Persistieren validieren — wird roh in <style> injiziert)
  logoPath: varchar("logo_path", { length: 255 }),
  colorNavbarBg: varchar("color_navbar_bg", { length: 9 }).notNull().default("#111827"),
  colorNavbarText: varchar("color_navbar_text", { length: 9 }).notNull().default("#ffffff"),
  colorPageBg: varchar("color_page_bg", { length: 9 }).notNull().default("#ffffff"),
  colorText: varchar("color_text", { length: 9 }).notNull().default("#171717"),
  colorAccent: varchar("color_accent", { length: 9 }).notNull().default("#2563eb"),
  colorFooterBg: varchar("color_footer_bg", { length: 9 }).notNull().default("#111827"),
  colorFooterText: varchar("color_footer_text", { length: 9 }).notNull().default("#9ca3af"),
  fontHeading: varchar("font_heading", { length: 40 }).notNull().default("geist"),
  fontBody: varchar("font_body", { length: 40 }).notNull().default("geist"),
  pwaThemeColor: varchar("pwa_theme_color", { length: 9 }).notNull().default("#111827"),
  pwaBackgroundColor: varchar("pwa_background_color", { length: 9 }).notNull().default("#ffffff"),
  brandingExtra: json("branding_extra"),
  agbText: text("agb_text"),

  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
});

// ---------------------------------------------------------------------------
// users — alle Rollen in einer Tabelle
// ---------------------------------------------------------------------------
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    role: mysqlEnum("role", USER_ROLES).notNull().default("customer"),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 80 }).notNull(),
    lastName: varchar("last_name", { length: 80 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    gender: mysqlEnum("gender", USER_GENDERS),
    addressLine: varchar("address_line", { length: 160 }),
    houseNumber: varchar("house_number", { length: 16 }),
    postalCode: varchar("postal_code", { length: 16 }),
    city: varchar("city", { length: 80 }),
    countryCode: varchar("country_code", { length: 2 }).notNull().default("CH"),
    emailVerifiedAt: datetime("email_verified_at", { mode: "string" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
  },
  (t) => [uniqueIndex("uq_users_email").on(t.email), index("idx_users_role").on(t.role)],
);

// ---------------------------------------------------------------------------
// staff_profiles — 1:1 zu admin-users (buchbare Mitarbeiter)
// ---------------------------------------------------------------------------
export const staffProfiles = mysqlTable(
  "staff_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    bio: text("bio"),
    avatarUrl: varchar("avatar_url", { length: 255 }),
    specialty: varchar("specialty", { length: 120 }),
    isBookable: boolean("is_bookable").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    uniqueIndex("uq_staff_user").on(t.userId),
    uniqueIndex("uq_staff_slug").on(t.slug),
  ],
);

// ---------------------------------------------------------------------------
// service_categories — optionale Gruppierung von Dienstleistungen
// ---------------------------------------------------------------------------
export const serviceCategories = mysqlTable("service_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// services — pro Mitarbeiter angebotene Dienstleistungen
// ---------------------------------------------------------------------------
export const services = mysqlTable(
  "services",
  {
    id: int("id").autoincrement().primaryKey(),
    staffId: int("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    categoryId: int("category_id").references(() => serviceCategories.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    durationMin: int("duration_min").notNull(),
    bufferBeforeMin: int("buffer_before_min").notNull().default(0),
    bufferAfterMin: int("buffer_after_min").notNull().default(0),
    priceAmount: decimal("price_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    priceCurrency: varchar("price_currency", { length: 3 }).notNull().default("CHF"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("idx_services_staff_active").on(t.staffId, t.isActive)],
);

// ---------------------------------------------------------------------------
// working_hours — woechentlich wiederkehrende Arbeitszeiten pro Mitarbeiter
// (mehrere Zeilen pro Wochentag = Pausen)
// ---------------------------------------------------------------------------
export const workingHours = mysqlTable(
  "working_hours",
  {
    id: int("id").autoincrement().primaryKey(),
    staffId: int("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    weekday: mysqlEnum("weekday", WEEKDAYS).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [index("idx_working_hours_staff_weekday").on(t.staffId, t.weekday)],
);

// ---------------------------------------------------------------------------
// blocked_time — einmalige Sperren / Ferien pro Mitarbeiter
// ---------------------------------------------------------------------------
export const blockedTime = mysqlTable(
  "blocked_time",
  {
    id: int("id").autoincrement().primaryKey(),
    staffId: int("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    startAt: datetime("start_at", { mode: "string" }).notNull(),
    endAt: datetime("end_at", { mode: "string" }).notNull(),
    reason: varchar("reason", { length: 160 }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [index("idx_blocked_staff_range").on(t.staffId, t.startAt, t.endAt)],
);

// ---------------------------------------------------------------------------
// appointments — Buchungen
// ---------------------------------------------------------------------------
export const appointments = mysqlTable(
  "appointments",
  {
    id: int("id").autoincrement().primaryKey(),
    staffId: int("staff_id")
      .notNull()
      .references(() => staffProfiles.id),
    customerId: int("customer_id")
      .notNull()
      .references(() => users.id),
    serviceId: int("service_id").references(() => services.id),
    requestId: int("request_id").references(() => bookingRequests.id, {
      onDelete: "set null",
    }),
    startAt: datetime("start_at", { mode: "string" }).notNull(),
    endAt: datetime("end_at", { mode: "string" }).notNull(),
    status: mysqlEnum("status", APPOINTMENT_STATUSES).notNull().default("pending"),
    priceAmount: decimal("price_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    priceCurrency: varchar("price_currency", { length: 3 }).notNull().default("CHF"),
    customerNote: text("customer_note"),
    staffNote: text("staff_note"),
    cancelledAt: datetime("cancelled_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    index("idx_appt_staff_start").on(t.staffId, t.startAt),
    index("idx_appt_customer_start").on(t.customerId, t.startAt),
    index("idx_appt_status").on(t.status),
    index("idx_appt_request").on(t.requestId),
  ],
);

// ---------------------------------------------------------------------------
// sessions — DB-gestuetzte Sessions (id = sha256(token))
// ---------------------------------------------------------------------------
export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: datetime("expires_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    lastUsedAt: datetime("last_used_at", { mode: "string" }),
  },
  (t) => [index("idx_sessions_user").on(t.userId), index("idx_sessions_expires").on(t.expiresAt)],
);

// ---------------------------------------------------------------------------
// invitations — Einladungen (Owner laedt Admin/Kunde ein; Link mit Roh-Token)
// ---------------------------------------------------------------------------
export const invitations = mysqlTable(
  "invitations",
  {
    id: int("id").autoincrement().primaryKey(),
    token: varchar("token", { length: 64 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: mysqlEnum("role", INVITE_ROLES).notNull().default("customer"),
    firstName: varchar("first_name", { length: 80 }).notNull(),
    lastName: varchar("last_name", { length: 80 }).notNull(),
    displayName: varchar("display_name", { length: 120 }),
    invitedByUserId: int("invited_by_user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: datetime("expires_at", { mode: "string" }).notNull(),
    acceptedAt: datetime("accepted_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_invitations_token").on(t.token),
    index("idx_invitations_email").on(t.email),
  ],
);

// ---------------------------------------------------------------------------
// skills — owner-verwalteter Stil-/Art-Katalog (Schriftzug, Porträt, ...)
// ---------------------------------------------------------------------------
export const skills = mysqlTable(
  "skills",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    description: varchar("description", { length: 255 }),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
  },
  (t) => [uniqueIndex("uq_skills_slug").on(t.slug)],
);

// staff_skills — m:n Mitarbeiter <-> Skills
export const staffSkills = mysqlTable(
  "staff_skills",
  {
    staffId: int("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    skillId: int("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.staffId, t.skillId] }),
    index("idx_staff_skills_skill").on(t.skillId),
  ],
);

// staff_style_rates — Stundensatz pro Mitarbeiter & Stil (CHF/Std)
export const staffStyleRates = mysqlTable(
  "staff_style_rates",
  {
    id: int("id").autoincrement().primaryKey(),
    staffId: int("staff_id")
      .notNull()
      .references(() => staffProfiles.id, { onDelete: "cascade" }),
    skillId: int("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull().default("0.00"),
    currency: varchar("currency", { length: 3 }).notNull().default("CHF"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
  },
  (t) => [uniqueIndex("uq_staff_style").on(t.staffId, t.skillId)],
);

// ---------------------------------------------------------------------------
// booking_requests — Anfrage aus dem Buchungs-Wizard (Custom-Tattoo)
// ---------------------------------------------------------------------------
export const bookingRequests = mysqlTable(
  "booking_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customer_id")
      .notNull()
      .references(() => users.id),
    staffId: int("staff_id")
      .notNull()
      .references(() => staffProfiles.id),
    skillId: int("skill_id").references(() => skills.id, { onDelete: "set null" }),
    genderUsed: mysqlEnum("gender_used", USER_GENDERS),
    bodyView: mysqlEnum("body_view", BODY_VIEWS).notNull().default("front"),
    estimatedDurationMin: int("estimated_duration_min").notNull(),
    requestedStartAt: datetime("requested_start_at", { mode: "string" }),
    status: mysqlEnum("status", BOOKING_REQUEST_STATUSES).notNull().default("pending"),
    agbAcceptedAt: datetime("agb_accepted_at", { mode: "string" }).notNull(),
    customerNote: text("customer_note"),
    staffNote: text("staff_note"),
    priceAmount: decimal("price_amount", { precision: 10, scale: 2 }),
    priceCurrency: varchar("price_currency", { length: 3 }).notNull().default("CHF"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    index("idx_breq_staff_status").on(t.staffId, t.status),
    index("idx_breq_customer").on(t.customerId),
    index("idx_breq_staff_hold").on(t.staffId, t.status, t.requestedStartAt),
  ],
);

// booking_request_images — Referenzbilder + Platzierung auf der Figur
export const bookingRequestImages = mysqlTable(
  "booking_request_images",
  {
    id: int("id").autoincrement().primaryKey(),
    requestId: int("request_id")
      .notNull()
      .references(() => bookingRequests.id, { onDelete: "cascade" }),
    imagePath: varchar("image_path", { length: 255 }).notNull(),
    view: mysqlEnum("view", BODY_VIEWS).notNull(),
    x: decimal("x", { precision: 8, scale: 4 }).notNull().default("0.0000"),
    y: decimal("y", { precision: 8, scale: 4 }).notNull().default("0.0000"),
    scale: decimal("scale", { precision: 6, scale: 4 }).notNull().default("1.0000"),
    rotationDeg: int("rotation_deg").notNull().default(0),
    naturalWidth: int("natural_width").notNull(),
    naturalHeight: int("natural_height").notNull(),
    coveredParts: json("covered_parts"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [index("idx_breq_img_request").on(t.requestId)],
);

// ---------------------------------------------------------------------------
// notifications — In-App-Benachrichtigungen (Quelle der Wahrheit; Push = Zustellung)
// ---------------------------------------------------------------------------
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    recipientUserId: int("recipient_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: mysqlEnum("type", NOTIFICATION_TYPES).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    body: varchar("body", { length: 500 }),
    link: varchar("link", { length: 255 }),
    readAt: datetime("read_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [index("idx_notif_recipient_read").on(t.recipientUserId, t.readAt)],
);

// push_subscriptions — Web-Push-Abos pro Nutzer
export const pushSubscriptions = mysqlTable(
  "push_subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: varchar("endpoint", { length: 512 }).notNull(),
    p256dh: varchar("p256dh", { length: 255 }).notNull(),
    auth: varchar("auth", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_push_endpoint").on(t.endpoint),
    index("idx_push_user").on(t.userId),
  ],
);

// ---------------------------------------------------------------------------
// Relations (fuer die db.query.* Relational-API)
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ one, many }) => ({
  staffProfile: one(staffProfiles, {
    fields: [users.id],
    references: [staffProfiles.userId],
  }),
  appointments: many(appointments),
  sessions: many(sessions),
}));

export const staffProfilesRelations = relations(staffProfiles, ({ one, many }) => ({
  user: one(users, { fields: [staffProfiles.userId], references: [users.id] }),
  services: many(services),
  workingHours: many(workingHours),
  blockedTime: many(blockedTime),
  appointments: many(appointments),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  staff: one(staffProfiles, {
    fields: [services.staffId],
    references: [staffProfiles.id],
  }),
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  appointments: many(appointments),
}));

export const workingHoursRelations = relations(workingHours, ({ one }) => ({
  staff: one(staffProfiles, {
    fields: [workingHours.staffId],
    references: [staffProfiles.id],
  }),
}));

export const blockedTimeRelations = relations(blockedTime, ({ one }) => ({
  staff: one(staffProfiles, {
    fields: [blockedTime.staffId],
    references: [staffProfiles.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  staff: one(staffProfiles, {
    fields: [appointments.staffId],
    references: [staffProfiles.id],
  }),
  customer: one(users, {
    fields: [appointments.customerId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  invitedBy: one(users, {
    fields: [invitations.invitedByUserId],
    references: [users.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  staffSkills: many(staffSkills),
  bookingRequests: many(bookingRequests),
}));

export const staffSkillsRelations = relations(staffSkills, ({ one }) => ({
  staff: one(staffProfiles, { fields: [staffSkills.staffId], references: [staffProfiles.id] }),
  skill: one(skills, { fields: [staffSkills.skillId], references: [skills.id] }),
}));

export const staffStyleRatesRelations = relations(staffStyleRates, ({ one }) => ({
  staff: one(staffProfiles, { fields: [staffStyleRates.staffId], references: [staffProfiles.id] }),
  skill: one(skills, { fields: [staffStyleRates.skillId], references: [skills.id] }),
}));

export const bookingRequestsRelations = relations(bookingRequests, ({ one, many }) => ({
  customer: one(users, { fields: [bookingRequests.customerId], references: [users.id] }),
  staff: one(staffProfiles, {
    fields: [bookingRequests.staffId],
    references: [staffProfiles.id],
  }),
  skill: one(skills, { fields: [bookingRequests.skillId], references: [skills.id] }),
  images: many(bookingRequestImages),
}));

export const bookingRequestImagesRelations = relations(bookingRequestImages, ({ one }) => ({
  request: one(bookingRequests, {
    fields: [bookingRequestImages.requestId],
    references: [bookingRequests.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientUserId],
    references: [users.id],
  }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));

// Bequeme Typ-Aliase
export type Settings = typeof settings.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type StaffProfile = typeof staffProfiles.$inferSelect;
export type Service = typeof services.$inferSelect;
export type WorkingHour = typeof workingHours.$inferSelect;
export type BlockedTime = typeof blockedTime.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type StaffSkill = typeof staffSkills.$inferSelect;
export type StaffStyleRate = typeof staffStyleRates.$inferSelect;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type BookingRequestImage = typeof bookingRequestImages.$inferSelect;
export type AppNotification = typeof notifications.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
