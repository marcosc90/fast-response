// Accessing the internal '_response' property of the Response object.
// Warning: This method relies on internal details, which may change in future Deno versions.
const _response = Reflect.ownKeys(new Response()).find(s => {
	return String(s) === 'Symbol(response)';
});

// Accessing the internal '_headerList' property of the Headers object.
// Warning: This method relies on internal details, which may change in future Deno versions.
const _headerList = Reflect.ownKeys(new Headers()).find(s => {
	return String(s) === 'Symbol(header list)';
});

export default class FastResponse {
	constructor(body, options = {}) {
		if (body instanceof ReadableStream) {
			body = { streamOrStatic: body };
		} else if (body) {
			body = {
				streamOrStatic: {
					body
				}
			};
		}

		// inner response
		this[_response] = {
			body,
			status: options.status ?? 200,
			headerList: options.headers?.[_headerList] ?? options.headers ?? []
		};
	}

	static json(body, options = {}) {
		const headers = options.headers?.[_headerList] ?? options.headers;
		let contentType = ['content-type', 'application/json'];
		let hasContentType = false;

		if (headers) {
			for (let i = 0; i < headers.length; i++) {
				if (headers[i][0].toLowerCase() === 'content-type') {
					hasContentType = true;
					break;
				}
			}
			if (!hasContentType) {
				headers.push(contentType);
			}
		}

		return new FastResponse(JSON.stringify(body), {
			status: options.status,
			headers: headers ?? [contentType]
		});
	}

	static redirect(url, status = 302) {
		return new FastResponse(null, {
			status,
			headers: [['Location', url]]
		});
	}
}
