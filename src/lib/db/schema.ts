import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export const meetingStatusEnum = pgEnum("meeting_status", [
  "upcoming",
  "active",
  "completed",
  "cancelled",
]);

export const meetingSentimentEnum = pgEnum("meeting_sentiment", [
  "productive",
  "neutral",
  "tense",
]);

export const agentPersonaEnum = pgEnum("agent_persona", [
  "scribe",           // focused on accurate notes
  "devil_advocate",   // challenges assumptions
  "timekeeper",       // warns when agenda items overrun
  "decision_tracker", // highlights and logs every decision
  "custom",           // user-defined system prompt
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "past_due",
  "trialing",
]);

export const integrationTypeEnum = pgEnum("integration_type", [
  "slack",
  "notion",
  "google_calendar",
]);

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// (Better Auth manages auth — this extends the user profile)
// ─────────────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),                         // matches Better Auth user id
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTIONS
// (Polar webhook populates this — never trust the client for billing state)
// ─────────────────────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  polarSubscriptionId: text("polar_subscription_id").unique(),
  polarCustomerId: text("polar_customer_id"),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  planName: text("plan_name"),                         // "starter", "pro", "team"
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// AGENTS
// (AI agents users create — each has a persona and custom system prompt)
// ─────────────────────────────────────────────────────────────────────────────

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  persona: agentPersonaEnum("persona").notNull().default("scribe"),
  systemPrompt: text("system_prompt").notNull(),       // the actual AI instructions
  description: text("description"),
  isDefault: boolean("is_default").default(false),     // one default agent per user
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// MEETINGS
// ─────────────────────────────────────────────────────────────────────────────

export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => agents.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    status: meetingStatusEnum("status").notNull().default("upcoming"),
    streamCallId: text("stream_call_id").unique(),     // Stream's call identifier
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    durationSeconds: integer("duration_seconds"),
    recordingUrl: text("recording_url"),               // Stream recording URL
    rawTranscript: text("raw_transcript"),             // full plain-text transcript
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("meetings_user_id_idx").on(table.userId),
    index("meetings_status_idx").on(table.status),
    index("meetings_created_at_idx").on(table.createdAt),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// MEETING INTELLIGENCE
// (The core differentiator — AI-generated structured report for every meeting)
// This is populated by an Inngest background job after the call ends.
// ─────────────────────────────────────────────────────────────────────────────

export const meetingIntelligence = pgTable("meeting_intelligence", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id")
    .notNull()
    .unique()                                          // one report per meeting
    .references(() => meetings.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  sentiment: meetingSentimentEnum("sentiment"),

  // Stored as JSONB — flexible, queryable, no separate tables needed
  actionItems: jsonb("action_items")                  // { owner, task, dueDate }[]
    .$type<{ owner: string; task: string; dueDate?: string }[]>()
    .default([]),

  decisions: jsonb("decisions")                       // string[]
    .$type<string[]>()
    .default([]),

  keyTopics: jsonb("key_topics")                      // string[]
    .$type<string[]>()
    .default([]),

  talkTime: jsonb("talk_time")                        // { participantName: percentage }
    .$type<Record<string, number>>()
    .default({}),

  followUpEmail: text("follow_up_email"),             // ready-to-send email draft

  // Processing state — Inngest updates this as the pipeline runs
  processingStartedAt: timestamp("processing_started_at"),
  processingCompletedAt: timestamp("processing_completed_at"),
  processingError: text("processing_error"),          // null = success

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTION ITEMS (denormalized for dashboard queries)
// Extracted from meeting_intelligence.action_items for fast cross-meeting queries
// ─────────────────────────────────────────────────────────────────────────────

export const actionItems = pgTable(
  "action_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    task: text("task").notNull(),
    owner: text("owner"),                              // participant name (free text)
    dueDate: timestamp("due_date"),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("action_items_user_id_idx").on(table.userId),
    index("action_items_meeting_id_idx").on(table.meetingId),
    index("action_items_completed_idx").on(table.completed),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE EMBEDDINGS
// (pgvector — enables semantic search across all meeting transcripts)
// Requires: CREATE EXTENSION vector; in Supabase SQL editor
// ─────────────────────────────────────────────────────────────────────────────

export const meetingEmbeddings = pgTable(
  "meeting_embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),               // the text chunk that was embedded
    embedding: vector("embedding", { dimensions: 1536 }), // OpenAI text-embedding-3-small
    chunkIndex: integer("chunk_index").notNull(),     // order within the meeting
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("embeddings_meeting_id_idx").on(table.meetingId),
    index("embeddings_user_id_idx").on(table.userId),
    // Note: the HNSW vector index is created manually in SQL:
    // CREATE INDEX ON meeting_embeddings USING hnsw (embedding vector_cosine_ops);
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATIONS
// (Slack, Notion, Google Calendar connections per user)
// ─────────────────────────────────────────────────────────────────────────────

export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: integrationTypeEnum("type").notNull(),
  enabled: boolean("enabled").default(true),
  config: jsonb("config").$type<Record<string, string>>().default({}),
  // e.g. { slackWebhookUrl, notionPageId, calendarId }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// (Drizzle's typed joins — use these instead of raw SQL joins)
// ─────────────────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  agents: many(agents),
  meetings: many(meetings),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  integrations: many(integrations),
  actionItems: many(actionItems),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  user: one(users, {
    fields: [meetings.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [meetings.agentId],
    references: [agents.id],
  }),
  intelligence: one(meetingIntelligence, {
    fields: [meetings.id],
    references: [meetingIntelligence.meetingId],
  }),
  embeddings: many(meetingEmbeddings),
  actionItems: many(actionItems),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  meetings: many(meetings),
}));

export const meetingIntelligenceRelations = relations(
  meetingIntelligence,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [meetingIntelligence.meetingId],
      references: [meetings.id],
    }),
  })
);

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  meeting: one(meetings, {
    fields: [actionItems.meetingId],
    references: [meetings.id],
  }),
  user: one(users, {
    fields: [actionItems.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// TYPE EXPORTS
// (Use these everywhere instead of inferring manually)
// ─────────────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type MeetingIntelligence = typeof meetingIntelligence.$inferSelect;
export type ActionItem = typeof actionItems.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Integration = typeof integrations.$inferSelect;

// Composed types for common query patterns
export type MeetingWithIntelligence = Meeting & {
  intelligence: MeetingIntelligence | null;
  agent: Agent | null;
};

export type MeetingWithAll = MeetingWithIntelligence & {
  actionItems: ActionItem[];
};