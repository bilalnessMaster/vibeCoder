import { Agent, openai, createAgent, gemini, grok } from "@inngest/agent-kit";
import { inngest } from "./client";


export const helloworld = inngest.createFunction(

  { id: "functionName" },

  { event: "test/hello" },

  async ({ event }) => {

    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert next,js developer . You write readable, maintainable code, You write simple Next.js & react.js snippets",
      model: gemini({ model: "gemini-2.0-flash-lite" }),
    });

    const { output } = await codeAgent.run("summerizer this text " + event.data.input);


    console.log("the outout", output)

    return { output }
  }

)

