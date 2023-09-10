# FastResponse for Deno

`FastResponse` is an optimized implementation of the `Response` constructor for [`Deno.serve`](https://deno.land/api@v1.36.4?s=Deno.serve). By bypassing spec checks, it provides quicker response times compared to the standard API.

**Note**: `FastResponse` relies on accessing internal properties. This may introduce breaking changes if the internal properties of the Deno server API change in the future.

## Compatibility

It has been tested and works with Deno version 1.36.4.

## Usage

```javascript
import FastResponse from 'https://raw.githubusercontent.com/marcosc90/fast-response/master/index.js';
```

It is intended **solely as a return value** for `Deno.serve`. Using it outside this context is not recommended and will not work.

⚠️ **Caution**: `FastResponse` does not perform any input validation. This design choice contributes to its speed, but users must ensure the safety and correctness of the data they pass into it

#### Constructor

```typescript
new FastResponse(
  body: null | undefined | Uint8Array | string | ReadableStream,
  options?: {
    status?: number,
    headers?: Array<[string, string]> | Headers
  }
)
```

---

#### new FastResponse(body)

The `body` parameter accepts values of type `null`, `undefined`, `Uint8Array`, `string`, or `ReadableStream`.

```js
const hello = new TextEncoder().encode('a'.repeat(1024));
Deno.serve({ port: 3000 }, () => new FastResponse(hello));
```

#### new Response(body, { status, headers })

```js
Deno.serve({ port: 3000 }, () => {
  return new FastResponse('hello', {
    status: 200,
    headers: [['Content-Type', 'text/plain']] // new Headers({ 'Content-Type': 'text/plain' })
  });
});
```

#### FastResponse.json

```js
Deno.serve({ port: 3000 }, () => FastResponse.json({ hello: 'world' }));
```

---

Unlike the standard `Response` object, `FastResponse` does not implement methods like `.arrayBuffer()`, `.text()`, `.clone()`, `.blob()` and `.json()`. Attempting to use these methods will result in errors.

```javascript
const response = new FastResponse('body');
const buffer = await response.arrayBuffer(); // Throws an error
```

## Performance

Using `wrk` with the following code

```js
const hello = new TextEncoder().encode('a'.repeat(1024));

Deno.serve({ port: 3000 }, () => new FastResponse(hello));
Deno.serve({ port: 3001 }, () => new Response(hello));
```

|                                   | Requests/sec  | Transfer/sec |
| --------------------------------- | :-----------: | :----------: |
| `new FastResponse()`              | **268813.99** |   288.41MB   |
| `new FastResponse()` with headers | **256938.91** |   282.04MB   |
| `FastResponse.json()`             | **260490.43** |   36.77MB    |
| `new Response()`                  |   221667.42   |   237.82MB   |
| `new Response()` with headers     |   178093.76   |   195.49MB   |
| `Response.json()`                 |   247716.75   |   34.96MB    |

## Caveats

- The usage of internal properties means this solution could break in future versions of Deno
