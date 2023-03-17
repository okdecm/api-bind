import { HTTPSchema } from "./Schema";
import { HTTPConfig, HTTPMethod, HTTPResponse, PrettyRequest, PrettyResponse } from "./Shared";
import { injectParams, Params } from "./Paths";

import { Fn } from "hotscript";

type HTTPClientRequest = {
	path: string;
	method: HTTPMethod;
	params?: Params;
	body?: unknown;
};

type HTTPClientConfig<ParserType> = {
	communicate: (request: HTTPClientRequest) => Promise<HTTPResponse>;
} & HTTPConfig<ParserType>;

export function httpClient<ParserType, Transform extends Fn>(config: HTTPClientConfig<ParserType>)
{
	function request<Schema extends HTTPSchema<ParserType>>(schema: Schema)
	{
		return async function(request: PrettyRequest<Schema, Transform>): Promise<PrettyResponse<Schema["responses"][number], Transform>>
		{
			const hydratedPath = request.params ? injectParams(schema.path, request.params) : schema.path;

			const response = await config.communicate({
				path: hydratedPath,
				method: schema.method,
				body: schema.body
			});

			if (!schema.responses)
			{
				throw new Error("Didn't expect a response");
			}

			const responseSchemas = schema.responses?.filter(responseSchema => responseSchema.statusCode == response.statusCode);

			if (!responseSchemas.length)
			{
				throw new Error("Invalid response status code");
			}

			let valid = false;

			for (const responseSchema of responseSchemas)
			{
				if (responseSchema.body)
				{
					try
					{
						response.body = config.parse(responseSchema.body, response.body);
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

			return response as PrettyResponse<Schema["responses"][number], Transform>;
		};
	}

	return {
		request
	};
}
