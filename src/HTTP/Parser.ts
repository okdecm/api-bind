import { HTTPSchema } from "./Schema";
import { HTTPRequest, HTTPResponse } from "./Common";

import { ValidationError } from "./ValidationError";

export type Parser<ParserType = unknown> = <Schema extends ParserType>(schema: Schema, value: unknown) => Schema;

export function parseRequest<Schema extends HTTPSchema>(parse: Parser, schema: Schema, request: HTTPRequest)
{
	let parsedBody;

	if (schema.body)
	{
		try
		{
			parsedBody = parse(schema.body, request.body);
		}
		catch (e)
		{
			throw new ValidationError("Invalid request body", {
				cause: e
			});
		}
	}

	return {
		...request,
		body: parsedBody
	};
}

export function parseResponse(parse: Parser, schema: HTTPSchema, response: HTTPResponse)
{
	let parsedBody;

	const responseSchemas = schema.responses?.filter(responseSchema => responseSchema.statusCode == response.statusCode);
	const expectsBody = responseSchemas.every(responseSchema => responseSchema.body);

	for (const responseSchema of responseSchemas)
	{
		if (!responseSchema.body) continue;

		try
		{
			parsedBody = parse(responseSchema.body, response.body);

			break;
		}
		catch
		{
			// Do nothing (other schemas may handle this)
		}
	}

	if (expectsBody && !parsedBody)
	{
		throw new ValidationError("Invalid response body");
	}

	return {
		...response,
		body: parsedBody
	};
}
