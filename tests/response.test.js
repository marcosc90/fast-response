import { assertEquals } from 'https://deno.land/std@0.201.0/assert/mod.ts';

import FastResponse from '../index.js';

const port = 3005;
const url = `http://localhost:${port}`;

function serve(handler) {
	const abort = new AbortController();
	const server = Deno.serve(
		{ port, signal: abort.signal, onListen: () => {} },
		handler
	);

	return {
		close() {
			abort.abort();

			return server.finished;
		}
	};
}

Deno.test('new FastResponse(string)', async () => {
	const body = 'hello';
	const server = serve(() => new FastResponse(body));
	const response = await fetch(url);

	assertEquals(await response.text(), body);

	await server.close();
});

Deno.test('new FastResponse(Uint8Array)', async () => {
	const body = new TextEncoder().encode('hello');
	const server = serve(() => new FastResponse(body));
	const response = await fetch(url);

	assertEquals(new Uint8Array(await response.arrayBuffer()), body);

	await server.close();
});

Deno.test('new FastResponse(null)', async () => {
	const server = serve(() => new FastResponse(null));
	const response = await fetch(url);

	assertEquals(new Uint8Array(await response.arrayBuffer()), new Uint8Array());

	await server.close();
});

Deno.test('new FastResponse(undefined)', async () => {
	const server = serve(() => new FastResponse());
	const response = await fetch(url);

	assertEquals(new Uint8Array(await response.arrayBuffer()), new Uint8Array());

	await server.close();
});

Deno.test('new FastResponse(ReadableStream)', async () => {
	const body = new TextEncoder().encode('hello');
	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(body);
			controller.close();
		}
	});
	const server = serve(() => new FastResponse(stream));
	const response = await fetch(url);

	assertEquals(new Uint8Array(await response.arrayBuffer()), body);
	await server.close();
});

Deno.test(
	'new FastResponse(body, { headers: Array<[string, string]> })',
	async () => {
		const body = 'hello';
		const server = serve(
			() => new FastResponse(body, { headers: [['X-Fast-Response', 'true']] })
		);
		const response = await fetch(url);

		assertEquals(response.headers.get('X-Fast-Response'), 'true');
		assertEquals(await response.text(), body);

		await server.close();
	}
);

Deno.test('new FastResponse(body, { headers: Headers })', async () => {
	const body = 'hello';
	const server = serve(
		() =>
			new FastResponse(body, {
				headers: new Headers({ 'X-Fast-Response': 'true' })
			})
	);
	const response = await fetch(url);

	assertEquals(response.headers.get('X-Fast-Response'), 'true');
	assertEquals(await response.text(), body);

	await server.close();
});

Deno.test('new FastResponse(string, { status })', async () => {
	const body = 'hello';
	const server = serve(() => new FastResponse(body, { status: 201 }));
	const response = await fetch(url);

	assertEquals(response.status, 201);
	assertEquals(await response.text(), body);

	await server.close();
});

Deno.test('FastResponse.json()', async () => {
	const body = { hello: 'world' };
	const server = serve(() => FastResponse.json(body));
	const response = await fetch(url);

	assertEquals(response.headers.get('content-type'), 'application/json');
	assertEquals(await response.json(), body);
	await server.close();
});

Deno.test(
	'FastResponse.json(body, { headers: Array<[string, string]> })',
	async () => {
		const body = { hello: 'world' };
		const server = serve(() =>
			FastResponse.json(body, {
				headers: [['Content-Type', 'application/json; charset=utf-8']]
			})
		);
		const response = await fetch(url);

		assertEquals(
			response.headers.get('content-type'),
			'application/json; charset=utf-8'
		);
		assertEquals(await response.json(), body);
		await server.close();
	}
);

Deno.test('FastResponse.json(body, { headers: Headers })', async () => {
	const body = { hello: 'world' };
	const server = serve(() =>
		FastResponse.json(body, {
			headers: new Headers([
				['Content-Type', 'application/json; charset=utf-8']
			])
		})
	);
	const response = await fetch(url);

	assertEquals(
		response.headers.get('content-type'),
		'application/json; charset=utf-8'
	);
	assertEquals(await response.json(), body);
	await server.close();
});

Deno.test('FastResponse.redirect()', async () => {
	const redirectUrl = 'https://example.com';
	const server = serve(() => FastResponse.redirect(redirectUrl));
	const response = await fetch(url, { redirect: 'manual' });

	assertEquals(response.status, 302);
	assertEquals(response.headers.get('Location'), redirectUrl);
	assertEquals(await response.text(), '');
	await server.close();
});
