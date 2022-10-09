import { z } from 'zod'
import { authedProcedure, t } from '../trpc'

export const guestbookRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.guestbook.findMany({
        select: {
          id: true,
          name: true,
          message: true,
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
        name: z.string(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.guestbook.create({
          data: {
            name: input.name,
            message: input.message,
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.guestbook.delete({
          where: { id: input.id },
        })
      } catch (error) {
        console.log(error)
      }
    }),

  editMessage: authedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.guestbook.update({
          where: { id: input.id },
          data: { message: input.message },
        })
      } catch (error) {
        console.log(error)
      }
    }),
})
