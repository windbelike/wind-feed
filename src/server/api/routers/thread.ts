import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const threadRouter = createTRPCRouter({
  infiniteFeed: publicProcedure.input(
    z.object({
      limit: z.number().optional(),
      cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
    })
  ).query(async ({ input: { limit = 10, cursor }, ctx }) => {
    const currUserId = ctx.session?.user.id
    const data = await ctx.prisma.thread.findMany({
      take: limit + 1,
      cursor: cursor ? { createdAt_id: cursor } : undefined,
      orderBy: [{ id: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        content: true,
        createdAt: true,
        _count: { select: { likes: true } },
        // likes by myself
        likes: currUserId == null
          ? false
          : { where: { userId: currUserId } },
        user: {
          select: { name: true, id: true, image: true }
        }
      }
    })

    let nextCursor: typeof cursor | undefined
    if (data.length > limit) {
      const nextItem = data.pop()
      if (nextItem != null) {
        nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt }
      }
    }

    return {
      threads: data.map(thread => {
        return {
          id: thread.id,
          content: thread.content,
          createdAt: thread.createdAt,
          likeCount: thread._count.likes,
          user: thread.user,
          likedByMe: thread.likes?.length > 0
        }
      }), nextCursor
    }
  }),
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const createThreadResult = await ctx.prisma.thread.create({
        data: {
          content,
          userId: ctx.session.user.id
        }
      })

      return createThreadResult
    }),
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opt) => {
      const data = { threadId: opt.input.id, userId: opt.ctx.session.user.id }
      const existingLike = await opt.ctx.prisma.like.findUnique({
        where: { threadId_userId: data }
      })
      if (existingLike == null) {
        await opt.ctx.prisma.like.create({ data })
        return { addedLike: true }
      } else {
        await opt.ctx.prisma.like.delete({
          where: { threadId_userId: data }
        })
        return { addedLike: false }
      }
    })
});
