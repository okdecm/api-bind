import { HTTPSchema, HTTPSchemaResponse } from "./Schema";
import { HTTPConfig, HTTPMethod, HTTPResponse, PrettyRequestSchema, PrettyResponseSchema } from "./Common";
import { injectParams, Params } from "./Paths";

import { Fn } from "../HOTScript";
import { parseResponse } from "./Parser";

type HTTPClientRequest = {
	path: string;
	method: HTTPMethod;
	params?: Params;
	body?: unknown;
};

export type HTTPClientConfig<ParserType> = {
	communicate: (request: HTTPClientRequest) => Promise<HTTPResponse>;
} & HTTPConfig<ParserType>;

export interface IHTTPClient<ParserType, Transform extends Fn>
{
	request<Schema extends HTTPSchema<ParserType>>(schema: Schema): (request: PrettyRequestSchema<Schema, Transform>) => Promise<PrettyResponseSchema<HTTPSchemaResponse<Schema>, Transform>>;
}

export function httpClient<ParserType, Transform extends Fn>(config: HTTPClientConfig<ParserType>): IHTTPClient<ParserType, Transform>
{
	function request<Schema extends HTTPSchema<ParserType>>(schema: Schema)
	{
		return async function(request: PrettyRequestSchema<Schema, Transform>): Promise<PrettyResponseSchema<HTTPSchemaResponse<Schema>, Transform>>
		{
			const hydratedPath = request.params ? injectParams(schema.path, request.params) : schema.path;

			const response = await config.communicate({
				path: hydratedPath,
				method: schema.method,
				body: schema.body
			});

			const parsedResponse = parseResponse(config.parse, schema, response);

			return parsedResponse as PrettyResponseSchema<HTTPSchemaResponse<Schema>, Transform>;
		};
	}

	return {
		request
	};
}
