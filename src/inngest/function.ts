import { createAgent, createNetwork, createTool, openai, type Tool } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import z from "zod";
import { PROMPT } from "@/prompte";
import prisma from "@/lib/prisma";

interface agentState {
  summary : string;
  files : {
    [path : string] : string
  }
}


export const codeAgentFunction= inngest.createFunction(

  { id: "code-agent" },

  { event: "code-agent/run" },

  async ({ event, step }) => {

    const SandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("nte")
      return sandbox.sandboxId;
    })

    console.log("SandboxId:", SandboxId);
    console.log("Running input:", event.data.input);

    const codeAgent = createAgent<agentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: "llama-3.3-70b-versatile",
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY
      }),

      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = {
                stdout: "", stderr: ""
              };
              try {
                const sandbox = await getSandbox(SandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (error: string) => {
                    buffers.stderr += error;
                  }
                })

                return result.stdout
              } catch (error) {
                console.error(
                  `Command failed : ${error} \nstdout: ${buffers.stdout} \nstderror : ${buffers.stderr}`
                )
                return `Command failed : ${error} \nstdout: ${buffers.stdout} \nstderror : ${buffers.stderr}`;
              }
            })
          }
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: 'Create or update files in the sandbox',
          parameters: z.object({
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
            }))
          }),
          handler: async ({ files }, { step, network } : Tool.Options<agentState>) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updateFiles = network.state.data.files || {};
                const sandbox = await getSandbox(SandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updateFiles[file.path] = file.content;
                }
                return updateFiles;
              } catch (error) {
                return "Error : " + error;
              }
            });
            if (typeof newFiles === 'object') {
              network.state.data.files = newFiles
            }
          }
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string())
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {

              try {
                const sandbox = await getSandbox(SandboxId);
                const contents = []
                for (const file of files) {
                  const content = await sandbox.files.read(file)
                  contents.push({ path: file, content })
                }

                return JSON.stringify(contents);
              } catch (error) {
                return "Error : " + error;
              }

            })
          }
        })
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistanteMessage = lastAssistantTextMessageContent(result);
          if (lastAssistanteMessage && network) {
            if (lastAssistanteMessage?.includes("<task_summary>")) {
              network.state.data.summary = lastAssistanteMessage;
            }
          }
          return result;
        }
      }
    });
    const network = createNetwork<agentState>({
      name: "codeAgentNetwork",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }
        return codeAgent;
      }
    })

    const result = await network.run(event.data.input)
    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0
    
    if (!result || !result.state || !result.state.data) {
      console.error("No result or state returned");
    }

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(SandboxId)
      const host = sandbox.getHost(3000);
      return `https://${host}`
    })

    await step.run("save-result", async () => {
      if (isError){
        return await prisma.message.create({
          data : {
            content : "Something went wrong, Please try again ",
            role : "ASSISTANT",
            type : "ERROR"
          }
        })
      }

      return await prisma.message.create({
        data:
        {
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl as string,
              title: 'Fragment',
              files: result.state.data.files,
            }
          }
        }
      })
    })

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary
    }
  }

)

