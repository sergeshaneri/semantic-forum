import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { eventAttendees, events } from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../init";

const langSchema = z.enum(["ru", "en"]);
const kindSchema = z.enum(["online", "offline", "hybrid"]);
const rsvpSchema = z.enum(["going", "maybe", "interested"]);
const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const eventRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        language: langSchema,
        upcomingOnly: z.boolean().default(true),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const rows = await ctx.db.query.events.findMany({
        where: input.upcomingOnly
          ? and(eq(events.language, input.language), gte(events.startAt, now))
          : eq(events.language, input.language),
        orderBy: input.upcomingOnly
          ? [asc(events.startAt)]
          : [desc(events.startAt)],
        limit: input.limit,
        with: {
          organizer: { columns: { username: true, name: true } },
          attendees: { columns: { userId: true } },
        },
      });
      return rows.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        description: e.description,
        kind: e.kind,
        startAt: e.startAt,
        endAt: e.endAt,
        location: e.location,
        locationUrl: e.locationUrl,
        attendeeCount: e.attendees.length,
        organizer: e.organizer
          ? {
              username: e.organizer.username ?? "",
              name: e.organizer.name ?? "",
            }
          : null,
      }));
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: and(
          eq(events.slug, input.slug),
          eq(events.language, input.language),
        ),
        with: {
          organizer: {
            columns: { id: true, username: true, name: true, image: true },
          },
          attendees: {
            with: {
              user: {
                columns: { id: true, username: true, name: true, image: true },
              },
            },
          },
        },
      });
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });
      const viewerId = ctx.session?.user?.id ?? null;
      const myRsvp = viewerId
        ? event.attendees.find((a) => a.userId === viewerId)?.status ?? null
        : null;
      return {
        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          description: event.description,
          kind: event.kind,
          startAt: event.startAt,
          endAt: event.endAt,
          location: event.location,
          locationUrl: event.locationUrl,
          organizerId: event.organizerId,
        },
        organizer: event.organizer,
        attendees: event.attendees.map((a) => ({
          status: a.status,
          user: a.user
            ? {
                id: a.user.id,
                username: a.user.username ?? "",
                name: a.user.name ?? "",
                image: a.user.image ?? null,
              }
            : null,
        })),
        myRsvp,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(4).max(300),
        slug: slugSchema,
        description: z.string().min(20).max(10000),
        kind: kindSchema,
        startAt: z.string().datetime(),
        endAt: z.string().datetime().optional(),
        location: z.string().max(300).optional(),
        locationUrl: z.string().url().max(500).optional().or(z.literal("")),
        language: langSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dupe = await ctx.db
        .select({ id: events.id })
        .from(events)
        .where(
          and(
            eq(events.slug, input.slug),
            eq(events.language, input.language),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Событие с таким slug уже есть",
        });
      }
      const [inserted] = await ctx.db
        .insert(events)
        .values({
          title: input.title,
          slug: input.slug,
          description: input.description,
          kind: input.kind,
          startAt: new Date(input.startAt),
          endAt: input.endAt ? new Date(input.endAt) : null,
          location: input.location ?? null,
          locationUrl: input.locationUrl || null,
          language: input.language,
          organizerId: ctx.userId,
        })
        .returning({ id: events.id, slug: events.slug });
      return { id: inserted!.id, slug: inserted!.slug };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: events.id, organizerId: events.organizerId })
        .from(events)
        .where(eq(events.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.organizerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(events).where(eq(events.id, input.id));
      return { ok: true as const };
    }),

  rsvp: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        status: rsvpSchema.nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.status === null) {
        await ctx.db
          .delete(eventAttendees)
          .where(
            and(
              eq(eventAttendees.eventId, input.eventId),
              eq(eventAttendees.userId, ctx.userId),
            ),
          );
        return { ok: true as const };
      }
      const existing = await ctx.db
        .select()
        .from(eventAttendees)
        .where(
          and(
            eq(eventAttendees.eventId, input.eventId),
            eq(eventAttendees.userId, ctx.userId),
          ),
        )
        .limit(1);
      if (existing.length > 0) {
        await ctx.db
          .update(eventAttendees)
          .set({ status: input.status })
          .where(
            and(
              eq(eventAttendees.eventId, input.eventId),
              eq(eventAttendees.userId, ctx.userId),
            ),
          );
      } else {
        await ctx.db.insert(eventAttendees).values({
          eventId: input.eventId,
          userId: ctx.userId,
          status: input.status,
        });
      }
      return { ok: true as const };
    }),
});
