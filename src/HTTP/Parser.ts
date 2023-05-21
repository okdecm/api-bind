import { HTTPSchema } from "./Schema";
import { HTTPResponse } from "./Common";
import { ValidationError } from "./ValidationError";

export type Parser<ParserType = unknown> = <Schema extends ParserType>(schema: Schema, value: unknown) => Schema;

export function parseResponse(parse: Parser, schema: HTTPSchema, response: HTTPResponse)
{
	// TODO: switch to structuredClone when possible
	// const parsedResponse = structuredClone(response);
	const parsedResponse = JSON.parse(JSON.stringify(response));

	if (!schema.responses)
	{
		throw new ValidationError("Didn't expect a response");
	}

	const responseSchemas = schema.responses?.filter(responseSchema => responseSchema.statusCode == response.statusCode);

	if (!responseSchemas.length)
	{
		throw new ValidationError("Invalid response status code");
	}

	const expectsResponseBody = responseSchemas.every(responseSchema => typeof responseSchema.body != "undefined");

	// If we don't have a body, and that's not expected, error out
	if (!response.body && expectsResponseBody)
	{
		throw new ValidationError("Expected response body");
	}

	// If we have a body, we _must_ validate it
	if (response.body)
	{
		let valid = false;

		for (const responseSchema of responseSchemas)
		{
			if (!responseSchema.body) continue;

			try
			{
				parsedResponse.body = parse(responseSchema.body, response.body);
				valid = true;

				break;
			}
			catch
			{
				// Do nothing (other schemas may handle this)
			}
		}

		if (!valid)
		{
			throw new ValidationError("Invalid response body");
		}
	}

	return parsedResponse;
}
