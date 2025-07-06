import { createAgent, grok } from '@inngest/agent-kit';
import { createServer } from '@inngest/agent-kit/server';

const dbaAgent = createAgent({
  name: 'Database administrator',
  description: 'Provides expert support for managing PostgreSQL databases',
  system:
    'You are a PostgreSQL expert database administrator. ' +
    'You only provide answers to questions related to PostgreSQL database schema, indexes, and extensions.',
  model: grok({
    model: 'grok-2-latest',
  }),
});


// starting the server 
const server = createServer({
  agents: [dbaAgent],
});
server.listen(3000, () => console.log('AgentKit server running!'));
