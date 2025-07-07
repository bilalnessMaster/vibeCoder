import { createAgent, gemini } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter';
import { getSandboxUrl } from "./utils";
export const helloworld = inngest.createFunction(

  { id: "functionName" },

  { event: "test/hello" },

  async ({ event, step }) => {

    const SandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("nte")
      return sandbox.sandboxId;
    })
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert next,js developer . You write readable, maintainable code, You write simple Next.js & react.js snippets",
      model: gemini({ model: "gemini-2.0-flash-lite" }),
    });

    const { output } = await codeAgent.run("summerizer this text " + event.data.input);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandboxUrl(SandboxId)
      const host = sandbox.getHost(3000);
      return `https://${host}`
    })
    console.log("the outout", output)

    return { output, sandboxUrl }
  }

)

