import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authedProcedure, t } from '../trpc'

export const guestbookRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.guestbook.findMany({
        select: {
          id: true,
          message: true,
          authorId: true,
          authorName: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } catch (error) {
      console.log('error', error)
    }
  }),

  postMessage: authedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        authorId: z.string().cuid(),
        authorName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.guestbook.create({
          data: {
            message: input.message,
            authorId: ctx.session.user?.id as string,
            authorName: ctx.session.user?.name as string,
          },
        })
      } catch (error) {
        console.log(error)
      }
    }),

  deleteMessage: authedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        authorId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user?.id !== input.authorId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: "It doesn't seem like you made this post..."
        })
      }
      try {
        await ctx.prisma.guestbook.delete({
          where: { id: input.id },
        })
      } catch (error) {
        console.log(error)
      }
    }),

  // editMessage: authedProcedure
  //   .input(
  //     z.object({
  //       id: z.string().cuid(),
  //       message: z.string().min(1),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     try {
  //       await ctx.prisma.guestbook.update({
  //         where: { id: input.id },
  //         data: { message: input.message },
  //       })
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }),
})
