import { HTTPSchema, HTTPSchemaResponse } from "./Schema";
import { HTTPConfig, HTTPMethod, HTTPResponse, PrettyRequestSchema, PrettyResponseSchema } from "./Common";

import { injectParams, Params } from "./Paths";
import { parseRequest, parseResponse } from "./Parser";

import { Fn } from "../HOTScript";

export type HTTPClientRequest = {
	path: string;
	method: HTTPMethod;
	params?: Params;
	body?: unknown;
};

export type HTTPClientTypes = {
	ParserType: unknown;
	Transform: Fn;
}

export type HTTPClientConfig<Types extends HTTPClientTypes> = {
	communicate: (request: HTTPClientRequest) => Promise<HTTPResponse>;
	// TODO: do we make this some event and have things listen to it?
	// or should this just be a naked function where the implementation can create its own eventemitter
	onRequestError?(e: unknown): void;
} & HTTPConfig<Types["ParserType"]>;

export interface IHTTPClient<Types extends HTTPClientTypes = HTTPClientTypes>
{
	request<Schema extends HTTPSchema<Types["ParserType"]>>(schema: Schema): (request: PrettyRequestSchema<Schema, Types["Transform"]>) => Promise<PrettyResponseSchema<HTTPSchemaResponse<Schema>, Types["Transform"]>>;
}

export function httpClient<Types extends HTTPClientTypes>(config: HTTPClientConfig<Types>): IHTTPClient<Types>
{
	const { communicate, parse, onRequestError } = config;

	function request<Schema extends HTTPSchema<Types["ParserType"]>>(schema: Schema)
	{
		return async function(request: PrettyRequestSchema<Schema, Types["Transform"]>): Promise<PrettyResponseSchema<HTTPSchemaResponse<Schema>, Types["Transform"]>>
		{
			try
			{
				const hydratedPath = request.params ? injectParams(schema.path, request.params) : schema.path;
				const parsedRequest = parseRequest(parse, schema, request);
				const response = await communicate({
					path: hydratedPath,
					method: schema.method,
					body: parsedRequest.body
				});
				const parsedResponse = parseResponse(parse, schema, response);

				return parsedResponse as PrettyResponseSchema<HTTPSchemaResponse<Schema>, Types["Transform"]>;
			}
			catch (e)
			{
				onRequestError?.(e);

				throw e;
			}
		};
	}

	return {
		request
	};
}
