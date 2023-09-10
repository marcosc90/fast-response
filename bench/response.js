import FastResponse from '../index.js';

const hello = new TextEncoder().encode('a'.repeat(1024));

Deno.serve({ port: 3000 }, () => new FastResponse(hello));
Deno.serve({ port: 3001 }, () => new Response(hello));
