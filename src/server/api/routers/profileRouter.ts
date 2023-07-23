import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

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
          _count: { select: { followers: true, follows: true, threads: true } },
          followers:
            currentUserId == null
              ? undefined
              : { where: { id: currentUserId } },
        },
      })

      if (profile == null) {
        return
      }

      const isFollowing = profile.followers[0]?.id == currentUserId

      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followsCount: profile._count.follows,
        tweetsCount: profile._count.threads,
        isFollowing: isFollowing
      };
    })
});
