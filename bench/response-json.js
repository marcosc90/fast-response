import FastResponse from '../index.js';

Deno.serve({ port: 3000 }, () => FastResponse.json({ hello: 'world' }));
Deno.serve({ port: 3001 }, () => Response.json({ hello: 'world' }));
