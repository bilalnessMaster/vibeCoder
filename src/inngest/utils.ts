import {Sandbox} from '@e2b/code-interpreter';

export const getSandboxUrl = async (sandboxId: string) => {
  const sandbox = await Sandbox.connect(sandboxId)
  return sandbox;
}
