import { HTTPSchema } from "./Schema";
import { HTTPConfig, HTTPMethod, HTTPResponse, PrettyRequest, PrettyResponse } from "./Shared";

import { Fn } from "hotscript";

type HTTPClientRequest = {
	Path: string;
	Method: HTTPMethod;
	Body?: unknown;
};

type HTTPClientConfig<ParserType> = {
	communicate: (request: HTTPClientRequest) => Promise<HTTPResponse>;
} & HTTPConfig<ParserType>;

export function httpClient<ParserType, Transform extends Fn>(config: HTTPClientConfig<ParserType>)
{
	function request<Schema extends HTTPSchema<ParserType>>(schema: Schema)
	{
		return async function(request: PrettyRequest<Schema, Transform>): Promise<PrettyResponse<Schema["Responses"][number], Transform>>
		{
			const response = await config.communicate({
				Path: schema.Path,
				Method: schema.Method,
				Body: request.Body
			});

			if (!schema.Responses)
			{
				throw new Error("Didn't expect a response");
			}

			const responseSchemas = schema.Responses?.filter(responseSchema => responseSchema.StatusCode == response.StatusCode);

			if (!responseSchemas.length)
			{
				throw new Error("Invalid response status code");
			}

			let valid = false;

			for (const responseSchema of responseSchemas)
			{
				if (responseSchema.Body)
				{
					try
					{
						response.Body = config.parse(responseSchema.Body, response.Body);
						valid = true;

						break;
					}
					catch
					{
						// Do nothing (other schemas may handle this)
					}
				}
			}

			if (!valid)
			{
				throw new Error("Invalid response body");
			}

			return response as PrettyResponse<Schema["Responses"][number], Transform>;
		};
	}

	return {
		request
	};
}
