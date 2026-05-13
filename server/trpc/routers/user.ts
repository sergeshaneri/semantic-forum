import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  comments,
  entities,
  follows,
  interpretations,
  notifications,
  theories,
  theoryObjects,
  userInfluences,
  userSchools,
  users,
} from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../init";

export const userRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
        columns: {
          id: true,
          username: true,
          name: true,
          image: true,
          bio: true,
          roles: true,
          mentorAvailable: true,
          mentorSeeking: true,
          createdAt: true,
        },
        with: {
          links: true,
        },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      // load schools and influences
      const schoolsRows = await ctx.db
        .select({
          id: userSchools.schoolId,
        })
        .from(userSchools)
        .where(eq(userSchools.userId, user.id));
      const schoolsList = schoolsRows.length
        ? await ctx.db.query.schools.findMany({
            where: (s, { inArray }) =>
              inArray(s.id, schoolsRows.map((r) => r.id)),
            columns: { id: true, slug: true, name: true, language: true },
          })
        : [];

      const influencesRows = await ctx.db.query.userInfluences.findMany({
        where: eq(userInfluences.userId, user.id),
        with: {
          influencerUser: {
            columns: { id: true, username: true, name: true },
          },
        },
      });
      const influences = influencesRows.map((i) => ({
        id: i.id,
        externalName: i.externalName,
        note: i.note,
        influencer: i.influencerUser
          ? {
              username: i.influencerUser.username ?? "",
              name: i.influencerUser.name ?? "",
            }
          : null,
      }));

      const userId = user.id;
      const viewerId = ctx.session?.user?.id ?? null;

      const [counters] = await Promise.all([
        ctx.db
          .select({
            interpretations: sql<number>`(select count(*)::int from ${interpretations} where ${interpretations.authorId} = ${userId})`,
            comments: sql<number>`(select count(*)::int from ${comments} where ${comments.authorId} = ${userId})`,
            entities: sql<number>`(select count(*)::int from ${entities} where ${entities.createdBy} = ${userId})`,
            theories: sql<number>`(select count(*)::int from ${theories} where ${theories.authorId} = ${userId})`,
            followers: sql<number>`(select count(*)::int from ${follows} where ${follows.followingId} = ${userId})`,
            following: sql<number>`(select count(*)::int from ${follows} where ${follows.followerId} = ${userId})`,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
          .then((r) => r[0]!),
      ]);

      const karmaRows = await ctx.db.execute<{ karma: number }>(sql`
        SELECT COALESCE(SUM(v.value), 0)::int AS karma
        FROM votes v
        WHERE (v.target_type = 'interpretation'
                AND v.target_id IN (SELECT id FROM interpretations WHERE author_id = ${userId}))
           OR (v.target_type = 'comment'
                AND v.target_id IN (SELECT id FROM comments WHERE author_id = ${userId}))
      `);
      const karma = Number(karmaRows[0]?.karma ?? 0);

      let viewerIsFollowing = false;
      if (viewerId && viewerId !== userId) {
        const [f] = await ctx.db
          .select({ x: follows.followerId })
          .from(follows)
          .where(
            and(
              eq(follows.followerId, viewerId),
              eq(follows.followingId, userId),
            ),
          )
          .limit(1);
        viewerIsFollowing = Boolean(f);
      }

      const topInterp = await ctx.db.query.interpretations.findFirst({
        where: eq(interpretations.authorId, userId),
        orderBy: [desc(interpretations.score)],
        with: {
          entity: { columns: { id: true, slug: true, title: true } },
          theory: { columns: { id: true, slug: true, name: true } },
          theoryObject: {
            columns: { id: true, slug: true, name: true, metadata: true },
          },
        },
      });

      const controversial = await ctx.db.query.interpretations.findFirst({
        where: eq(interpretations.authorId, userId),
        orderBy: [
          desc(
            sql`${interpretations.votesUp} * ${interpretations.votesDown}`,
          ),
        ],
        with: {
          entity: { columns: { id: true, slug: true, title: true } },
          theory: { columns: { id: true, slug: true, name: true } },
          theoryObject: {
            columns: { id: true, slug: true, name: true, metadata: true },
          },
        },
      });

      const objectStats = await ctx.db
        .select({
          theoryObjectId: interpretations.theoryObjectId,
          c: count(),
        })
        .from(interpretations)
        .where(eq(interpretations.authorId, userId))
        .groupBy(interpretations.theoryObjectId)
        .orderBy(desc(count()))
        .limit(3);

      const favoriteObjects = await Promise.all(
        objectStats.map(async (s) => {
          const obj = await ctx.db.query.theoryObjects.findFirst({
            where: eq(theoryObjects.id, s.theoryObjectId),
            with: {
              theory: { columns: { slug: true, name: true } },
            },
          });
          if (!obj) return null;
          return {
            id: obj.id,
            slug: obj.slug,
            name: obj.name,
            metadata: obj.metadata as Record<string, unknown> | null,
            theory: obj.theory
              ? { slug: obj.theory.slug, name: obj.theory.name }
              : null,
            count: Number(s.c),
          };
        }),
      );

      const theoryStats = await ctx.db
        .select({
          theoryId: interpretations.theoryId,
          c: count(),
        })
        .from(interpretations)
        .where(eq(interpretations.authorId, userId))
        .groupBy(interpretations.theoryId)
        .orderBy(desc(count()))
        .limit(1);

      let favoriteTheory: {
        slug: string;
        name: string;
        count: number;
      } | null = null;
      if (theoryStats.length > 0) {
        const t = await ctx.db.query.theories.findFirst({
          where: eq(theories.id, theoryStats[0]!.theoryId),
          columns: { slug: true, name: true },
        });
        if (t) {
          favoriteTheory = {
            slug: t.slug,
            name: t.name,
            count: Number(theoryStats[0]!.c),
          };
        }
      }

      const recentInterpretations = await ctx.db.query.interpretations.findMany({
        where: eq(interpretations.authorId, userId),
        orderBy: [desc(interpretations.createdAt)],
        limit: 10,
        with: {
          entity: { columns: { slug: true, title: true } },
          theory: { columns: { slug: true, name: true } },
          theoryObject: {
            columns: { slug: true, name: true, metadata: true },
          },
        },
      });

      const userTheories = await ctx.db.query.theories.findMany({
        where: eq(theories.authorId, userId),
        columns: { id: true, slug: true, name: true, description: true },
        with: { forks: { columns: { id: true } } },
        limit: 5,
      });

      return {
        user: {
          id: user.id,
          username: user.username ?? "",
          name: user.name ?? "",
          image: user.image ?? null,
          bio: user.bio ?? "",
          roles: (user.roles ?? []) as string[],
          mentorAvailable: user.mentorAvailable,
          mentorSeeking: user.mentorSeeking,
          createdAt: user.createdAt,
        },
        links: user.links.map((l) => ({
          id: l.id,
          kind: l.kind,
          label: l.label,
          url: l.url,
        })),
        schools: schoolsList.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          language: s.language,
        })),
        influences,
        isSelf: viewerId === userId,
        viewerIsFollowing,
        karma,
        counters: {
          interpretations: Number(counters.interpretations),
          comments: Number(counters.comments),
          entities: Number(counters.entities),
          theories: Number(counters.theories),
          followers: Number(counters.followers),
          following: Number(counters.following),
        },
        topInterpretation: topInterp
          ? {
              id: topInterp.id,
              score: topInterp.score,
              votesUp: topInterp.votesUp,
              votesDown: topInterp.votesDown,
              body: topInterp.body,
              entity: topInterp.entity,
              theory: topInterp.theory,
              theoryObject: topInterp.theoryObject
                ? {
                    id: topInterp.theoryObject.id,
                    slug: topInterp.theoryObject.slug,
                    name: topInterp.theoryObject.name,
                    metadata: topInterp.theoryObject.metadata as
                      | Record<string, unknown>
                      | null,
                  }
                : null,
            }
          : null,
        controversialInterpretation:
          controversial &&
          controversial.id !== topInterp?.id &&
          controversial.votesUp > 0 &&
          controversial.votesDown > 0
            ? {
                id: controversial.id,
                score: controversial.score,
                votesUp: controversial.votesUp,
                votesDown: controversial.votesDown,
                body: controversial.body,
                entity: controversial.entity,
                theory: controversial.theory,
                theoryObject: controversial.theoryObject
                  ? {
                      id: controversial.theoryObject.id,
                      slug: controversial.theoryObject.slug,
                      name: controversial.theoryObject.name,
                      metadata: controversial.theoryObject.metadata as
                        | Record<string, unknown>
                        | null,
                    }
                  : null,
              }
            : null,
        favoriteObjects: favoriteObjects.filter(
          (x): x is NonNullable<typeof x> => x !== null,
        ),
        favoriteTheory,
        recentInterpretations: recentInterpretations.map((i) => ({
          id: i.id,
          body: i.body,
          score: i.score,
          createdAt: i.createdAt,
          entity: i.entity,
          theory: i.theory,
          theoryObject: i.theoryObject
            ? {
                slug: i.theoryObject.slug,
                name: i.theoryObject.name,
                metadata: i.theoryObject.metadata as
                  | Record<string, unknown>
                  | null,
              }
            : null,
        })),
        theoriesAuthored: userTheories.map((t) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          description: t.description ?? "",
          forkCount: t.forks.length,
        })),
      };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(128),
        bio: z.string().max(1000).optional(),
        image: z.string().url().max(500).optional().or(z.literal("")),
        roles: z.array(z.string().min(1).max(80)).max(8).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          name: input.name,
          bio: input.bio && input.bio.trim() ? input.bio.trim() : null,
          image: input.image && input.image.length > 0 ? input.image : null,
          roles: input.roles,
        })
        .where(eq(users.id, ctx.userId));
      return { ok: true as const };
    }),

  follow: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
        columns: { id: true },
      });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });
      if (target.id === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Нельзя подписаться на себя",
        });
      }
      try {
        await ctx.db.insert(follows).values({
          followerId: ctx.userId,
          followingId: target.id,
        });
        // notify the followed user
        await ctx.db.insert(notifications).values({
          recipientId: target.id,
          actorId: ctx.userId,
          type: "follow",
          targetType: "user",
          targetId: ctx.userId,
          url: null,
          message: "подписался на тебя",
        });
      } catch {
        // already following — ignore
      }
      return { ok: true as const };
    }),

  unfollow: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
        columns: { id: true },
      });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, ctx.userId),
            eq(follows.followingId, target.id),
          ),
        );
      return { ok: true as const };
    }),

  onboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select({
        dismissedAt: users.onboardingDismissedAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);
    return {
      dismissed: Boolean(row?.dismissedAt),
      dismissedAt: row?.dismissedAt ?? null,
      accountCreatedAt: row?.createdAt ?? null,
    };
  }),

  dismissOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(users)
      .set({ onboardingDismissedAt: new Date() })
      .where(eq(users.id, ctx.userId));
    return { ok: true as const };
  }),

  resetOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(users)
      .set({ onboardingDismissedAt: null })
      .where(eq(users.id, ctx.userId));
    return { ok: true as const };
  }),

  checklistProgress: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const [profile] = await ctx.db
      .select({
        bio: users.bio,
        image: users.image,
        roles: users.roles,
        checklistDismissedAt: users.checklistDismissedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!profile) {
      return {
        dismissed: false,
        steps: {
          profileFilled: false,
          interpretationPublished: false,
          commented: false,
          voted: false,
          followed: false,
          authored: false,
        },
      };
    }

    const result = await ctx.db.execute<{
      has_interpretation: boolean;
      has_comment: boolean;
      has_vote: boolean;
      has_follow: boolean;
      has_authored: boolean;
    }>(sql`
      SELECT
        EXISTS (
          SELECT 1 FROM interpretations WHERE author_id = ${userId}
        ) AS has_interpretation,
        EXISTS (
          SELECT 1 FROM comments WHERE author_id = ${userId}
        ) AS has_comment,
        EXISTS (
          SELECT 1 FROM votes WHERE user_id = ${userId}
        ) AS has_vote,
        EXISTS (
          SELECT 1 FROM follows WHERE follower_id = ${userId}
        ) AS has_follow,
        (
          EXISTS (SELECT 1 FROM publications WHERE author_id = ${userId}) OR
          EXISTS (SELECT 1 FROM questions WHERE author_id = ${userId}) OR
          EXISTS (SELECT 1 FROM polls WHERE created_by = ${userId}) OR
          EXISTS (SELECT 1 FROM groups WHERE owner_id = ${userId}) OR
          EXISTS (SELECT 1 FROM theories WHERE author_id = ${userId})
        ) AS has_authored
    `);
    const row = result[0];

    const bioFilled = Boolean(profile.bio && profile.bio.trim().length > 0);
    const rolesFilled =
      Array.isArray(profile.roles) && profile.roles.length > 0;
    const imageFilled = Boolean(profile.image);
    const profileFilled = bioFilled || (rolesFilled && imageFilled);

    return {
      dismissed: Boolean(profile.checklistDismissedAt),
      steps: {
        profileFilled,
        interpretationPublished: Boolean(row?.has_interpretation),
        commented: Boolean(row?.has_comment),
        voted: Boolean(row?.has_vote),
        followed: Boolean(row?.has_follow),
        authored: Boolean(row?.has_authored),
      },
    };
  }),

  dismissChecklist: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(users)
      .set({ checklistDismissedAt: new Date() })
      .where(eq(users.id, ctx.userId));
    return { ok: true as const };
  }),

  mentorList: publicProcedure
    .input(
      z.object({
        kind: z.enum(["available", "seeking"]),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const flagCol =
        input.kind === "available" ? "mentor_available" : "mentor_seeking";
      const rows = await ctx.db.execute<{
        user_id: string;
        username: string;
        name: string;
        image: string | null;
        bio: string | null;
        roles: string[] | null;
        karma: number;
      }>(sql`
        SELECT
          u.id AS user_id,
          u.username AS username,
          u.name AS name,
          u.image AS image,
          u.bio AS bio,
          u.roles AS roles,
          COALESCE((
            SELECT SUM(v.value)::int
            FROM votes v
            WHERE
              (v.target_type = 'interpretation' AND v.target_id IN (
                SELECT id FROM interpretations WHERE author_id = u.id
              ))
              OR (v.target_type = 'comment' AND v.target_id IN (
                SELECT id FROM comments WHERE author_id = u.id
              ))
          ), 0) AS karma
        FROM users u
        WHERE u.username IS NOT NULL AND u.${sql.raw(flagCol)} = true
        ORDER BY karma DESC, u.created_at DESC
        LIMIT ${input.limit}
      `);

      const userIds = rows.map((r) => r.user_id);
      const schoolsByUser = new Map<
        string,
        { id: string; slug: string; name: string; language: string }[]
      >();
      if (userIds.length > 0) {
        const userSchoolRows = await ctx.db.query.userSchools.findMany({
          where: (us, { inArray }) => inArray(us.userId, userIds),
          with: {
            school: {
              columns: {
                id: true,
                slug: true,
                name: true,
                language: true,
              },
            },
          },
        });
        for (const us of userSchoolRows) {
          if (!us.school) continue;
          const arr = schoolsByUser.get(us.userId) ?? [];
          arr.push({
            id: us.school.id,
            slug: us.school.slug,
            name: us.school.name,
            language: us.school.language,
          });
          schoolsByUser.set(us.userId, arr);
        }
      }

      return rows.map((r) => ({
        id: r.user_id,
        username: r.username,
        name: r.name,
        image: r.image,
        bio: r.bio,
        roles: (r.roles ?? []) as string[],
        karma: Number(r.karma),
        schools: schoolsByUser.get(r.user_id) ?? [],
      }));
    }),

  feed: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, ctx.userId));
    const ids = rows.map((r) => r.followingId);
    if (ids.length === 0) return [];

    const feed = await ctx.db.query.interpretations.findMany({
      where: (i, { inArray }) => inArray(i.authorId, ids),
      orderBy: [desc(interpretations.createdAt)],
      limit: 15,
      with: {
        entity: { columns: { slug: true, title: true } },
        theory: { columns: { slug: true, name: true } },
        theoryObject: {
          columns: { slug: true, name: true, metadata: true },
        },
        author: { columns: { username: true, name: true } },
      },
    });

    return feed.map((i) => ({
      id: i.id,
      body: i.body,
      score: i.score,
      createdAt: i.createdAt,
      entity: i.entity,
      theory: i.theory,
      theoryObject: i.theoryObject
        ? {
            slug: i.theoryObject.slug,
            name: i.theoryObject.name,
            metadata: i.theoryObject.metadata as
              | Record<string, unknown>
              | null,
          }
        : null,
      author: i.author
        ? { username: i.author.username ?? "", name: i.author.name ?? "" }
        : null,
    }));
  }),
});
