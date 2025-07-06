import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
  prompt: baseProcedure
    .input(
      z.object({
        value: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "test/hello",
        data: {
          input: input.value
        }
      })
      return {
        ok: `your prompt is being process`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
