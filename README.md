# api-bind
A schema based api binding library.

__NOTE: This is a work in progress - some official documentation will eventually come.  
The examples given should be enough to throw something together in the mean time.__

## Getting Started
`api-bind` is used on both the client and the server to enforce adherence to schema based http request -> response contracts.
This simplifies and abstracts a lot of the wireup necessary to create/handle http requests.
Being schema based adds the benefit of strict typing, so you can be certain your responses are going to be correct.
In the event your schemas do go out of sync, reponses are parsed so your application will be safe from any unexpected data.

Implementation is generic as possible.
Whether you want to parse with zod/yup, communicate with fetch/axios, or route with express - as long as it conforms to the configutation, it **will** work.

### Installation
```
npm i api-bind
```

## Examples
### Schemas
```typescript
import { HTTPSchema } from "api-bind";
import { z } from "zod";

export const getUserSchema = {
	path: "/users/:id",
	method: "get",
	responses: [
		{
			statusCode: 200,
			body: z.object({
				ID: z.number(),
				Email: z.string().email()
			})
		},
		{
			statusCode: 404
		}
	]
} as const satisfies HTTPSchema<z.ZodType>;
```

### Contexts
#### Declaring context
```typescript
type Context = {
	database: Database;

	userID?: string;
} & IDisposable;

const databasePool = createDatabasePool();

const router = httpRouter<{
	...
	Context: Context;
}>({
	async createContext(request) {
		const pickedDatabase = await databasePool.pick();

		return {
			database: pickedDatabase.item,
			userID: getUserID(request),
			async dispose() {
				const disposing = [
					pickedDatabase.release()
				];

				await Promise.allSettled(disposing);
			}
		}
	}
});
```
#### Disposing of a context
```typescript
type Context = { ... } & IDisposable;

const router = httpRouter<{
	...
	Context: Context;
}>({
	async cleanup(context)
	{
		await context.dispose();
	}
});
```
#### Context assertions
```typescript
type Context = {
	userID?: string;
};

type ContextWithUserID = Context & {
	userID: string;
};

function hasUserID(context: Context): asserts context is ContextWithUserID
{
	if (!context.userID) throw new AuthorizationError("No user ID");
}

const router = httpRouter<{
	...
	Context: Context;
}>({
	register(path, method, handler)
	{
		app[method](path, async (request, response) =>
		{
			try
			{
				const result = await handler({
					headers: request.headers,
					params: request.params,
					body: request.body
				});

				response.status(result.statusCode).send(result.body);
			}
			catch (e)
			{
				console.error("Failed to handle request", e);

				if (isValidationError(e))
				{
					return response.status(ClientError.BadRequest).send(e.message);
				}

				if (isAuthorizationError(e))
				{
					return response.status(ClientError.Unauthorized).send(e.message);
				}

				response.status(500).send();
			}
		});
	}
});

router.route(
	getMyAccountSchema,
	async (request, context) =>
	{
		hasUserID(context);

		const { userID } = context;

		// type of `userID` is string
	}
);
```

### Frontend
#### Client
```typescript
import { httpClient, Fn } from "api-bind";
import { z } from "zod";

interface ZodTransform extends Fn
{
	return: z.infer<this["arg0"]>
}

const client = httpClient<z.ZodType, ZodTransform>({
	parse: (schema, value) => {
		return schema.parse(value);
	},

	communicate: async (request) => {
		const response = await fetch(
			"http://localhost:9000" + request.path,
			{
				method: request.method,
				body: request.body as Blob
			}
		);

		const json = await response.json();

		return {
			statusCode: response.status,
			body: json
		}
	}
});

export default client;
```

#### Requests
```typescript
import { getUserSchema } from "@library/api/schemas/users";

const getUserRequest = client.request(getUserSchema);

export async function getUser(id: string) {
	const response = await getUserRequest({
		params: {
			id
		}
	});

	if(response.statusCode === 404) {
		return undefined;
	}

	return response.body;
}
```

### Backend
#### Router
```typescript
import { httpRouter, Fn } from "api-bind";
import { z } from "zod";

import Express from "express";

interface ZodTransform extends Fn
{
	return: z.infer<this["arg0"]>
}

export const express = Express();

const router = httpRouter<z.ZodType, ZodTransform>({
	parse: (schema, value) => {
		return schema.parse(value);
	},

	register(path, method, handler) {
		express[method](path, async (request, response) => {
			// Handler will by default:
			// - Parse inputs (and throw appropriate errors on failure)
			try {
				const result = await handler({
					params: request.params,
					body: request.body
				});
	
				response.status(result.statusCode).send(result.body);
			} catch(e) {
				// if(e instanceof ParseError) {
				// 	return response.status(400).send(e.message);
				// }
	
				response.status(500).send();
			}
		});
	}
});

export default router;
```

#### Routes
```typescript
import { router } from "/api/router";
import { getUserSchema } from "@app-library/api/schemas/users";

router.route(getUserSchema, async (request) => {
	const { params } = request;

	const { id } = params;

	if(id === "dec") {
		return {
			statusCode: 200,
			body: {
				ID: 123,
				Email: "dec@dec.dec"
			}
		} as const;
	}

	return {
		statusCode: 404
	} as const;
});
```

__NOTE: if you need to type the router (e.g. if you are taking it as a parameter in a function) - you can do `function wireupRoutes(router: ReturnType<typeof httpRouter>)`.. I'll eventually make this an interface I promise.__


