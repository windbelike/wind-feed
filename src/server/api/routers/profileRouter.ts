import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { pushNotification } from "./notification";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(
      z.object({ id: z.string() })
    ).query(async opt => {
      const id = opt.input.id
      const ctx = opt.ctx
      const currentUserId = ctx.session?.user.id
      const profile = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          name: true,
          image: true,
          _count: {
            select: {
              followers: true, follows: true, threads: {
                where: { status: 0 }
              }
            }
          },
          followers:
            currentUserId == null
              ? undefined
              : { where: { id: currentUserId } },
        },
      })

      if (profile == null) {
        return
      }

      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followsCount: profile._count.follows,
        threadsCount: profile._count.threads,
        isFollowing: profile.followers?.length > 0,
      };
    }),
  toggleFollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input: { userId }, ctx }) => {
      const currentUserId = ctx.session.user.id;
      const existingFollow = await ctx.prisma.user.findFirst({
        where: { id: userId, followers: { some: { id: currentUserId } } },
      });

      let addedFollow;
      if (existingFollow == null) {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { followers: { connect: { id: currentUserId } } },
        });
        addedFollow = true;

        pushNotification({
          ctx: ctx,
          sender: ctx.session.user.id,
          receiver: userId,
          body: ctx.session.user.name + " followed you."
        })
      } else {
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { followers: { disconnect: { id: currentUserId } } },
        });
        addedFollow = false;
      }

      ctx.revalidateSSG?.(`/profile/${userId}`)
      ctx.revalidateSSG?.(`/profile/${currentUserId}`)

      return { addedFollow };
    }),
});
