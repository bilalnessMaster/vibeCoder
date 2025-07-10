import { inngest } from '@/inngest/client';
import prisma from '@/lib/prisma';
import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import { z } from 'zod';
export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure
    .query(async () => {
      const messages = await prisma.message.findMany({
        orderBy: {
          updatedAt: "asc"
        },
        include : {
          fragment : true
        }

      })
      return messages;
    }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Message is required" }),

      }),
    )
    .mutation(async ({ input }) => {
      const newMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: "USER",
          type: "RESULT"
        }
      })


      await inngest.send({
        name: "code-agent/run",
        data: {
          input: input.value
        }
      })
      return newMessage;
    }),
});

