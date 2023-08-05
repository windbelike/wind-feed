import {
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { inferAsyncReturnType } from "@trpc/server";


export const notificationRouter = createTRPCRouter({
  getNotifications: protectedProcedure.query(async opt => {
    const ctx = opt.ctx
    const currentUserId = ctx.session?.user.id

    const notifications = await ctx.prisma.notification.findMany({
      where: {
        userId: currentUserId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const updateRead = await ctx.prisma.user.update({
      where: {
        id: currentUserId
      },
      data: {
        hasNotification: false
      }
    })

    return notifications
  }),
  hasNotification: protectedProcedure.query(async opt => {
    const ctx = opt.ctx
    const userId = ctx.session?.user.id
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: { hasNotification: true }
    })
    if (user != null) {
      return { hasNotification: user.hasNotification }
    } else {
      return { hasNotification: false}
    }
  })
})

export async function pushNotification({
  ctx,
  body,
  sender,
  receiver
}: {
  body: string
  sender: string
  receiver: string
  ctx: inferAsyncReturnType<typeof createTRPCContext>
}) {
  if (sender == receiver) {
    return
  }
  try {
    await ctx.prisma.notification.create({
      data: {
        userId: receiver,
        body,
      }
    })

    await ctx.prisma.user.update({
      where: {
        id: receiver
      },
      data: {
        hasNotification: true
      }
    })
  } catch (e) {
    console.log(e)
  }
}
