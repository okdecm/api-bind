import { HTTPSchema } from "./Schema";
import { HTTPConfig, HTTPMethod, HTTPResponse, PrettyRequest, PrettyResponse } from "./Shared";
import { injectParams, Params } from "./Paths";

import { Fn } from "../HOTScript";
import { parseResponse } from "./Parser";

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

			const parsedResponse = parseResponse(config.parse, schema, response);

			return parsedResponse as PrettyResponse<Schema["responses"][number], Transform>;
		};
	}

	return {
		request
	};
}
