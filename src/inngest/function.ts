import { inngest } from "./client";


export const helloworld = inngest.createFunction(
  { id : "functionName"},
  {event  : "test/hello"},
  async ({ event, step }) => {
    await step.sleep("wait a moment", '1s');
    console.log(event)
    return { message: `Hello ${event.data["email "]}!` }
  }

)
