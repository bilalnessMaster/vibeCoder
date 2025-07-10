import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { codeAgentFunction, } from '@/inngest/function';



export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    codeAgentFunction
  ]
})
