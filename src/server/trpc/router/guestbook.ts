import { z } from 'zod'
import { authedProcedure, t } from '../trpc'

export const guestbookRouter = t.router({
  findMany: t.procedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.guestbook.findMany({
        select: {
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
        message: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
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
})
