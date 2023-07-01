import { HTTPResponseSchema, HTTPSchema } from "./Schema";
import { HTTPMethod, HTTPRequest, HTTPConfig, HTTPResponse, PrettyRequestSchema, PrettyResponseSchema } from "./Common";
import { parseRequest, parseResponse } from "./Parser";

import { ValidationError } from "./ValidationError";

import { Fn } from "../HOTScript";

export type HandlerCallback = (request: HTTPRequest) => Promise<HTTPResponse>;

export interface HTTPRouterTypes
{
	ParserType: unknown;
	Transform: Fn;
	Context?: unknown;
}

export type HTTPRouterConfig<Types extends HTTPRouterTypes> = {
	register: (path: string, method: HTTPMethod, handler: HandlerCallback) => void;
	createContext?: (request: HTTPRequest) => Promise<Types["Context"]>;
	cleanup?: (context: Types["Context"]) => Promise<void>;
} & HTTPConfig<Types["ParserType"]>;

export interface IHTTPRouter<Types extends HTTPRouterTypes = HTTPRouterTypes>
{
	route<Schema extends HTTPSchema<Types["ParserType"]>>(schema: Schema, handler: (request: PrettyRequestSchema<Schema, Types["Transform"]>, context: Types["Context"]) => Promise<PrettyResponseSchema<HTTPResponseSchema<Schema>, Types["Transform"]>>): void;
}

export function httpRouter<Types extends HTTPRouterTypes>(config: HTTPRouterConfig<Types>)
{
	const { parse, register, createContext, cleanup } = config;

	function route<Schema extends HTTPSchema<Types["ParserType"]>>(schema: Schema, handler: (request: PrettyRequestSchema<Schema, Types["Transform"]>, context: Types["Context"]) => Promise<PrettyResponseSchema<HTTPResponseSchema<Schema>, Types["Transform"]>>)
	{
		register(
			schema.path,
			schema.method,
			async (request: HTTPRequest) =>
			{
				let context: Types["Context"] = undefined;

				try
				{
					const parsedRequest = parseRequest(parse, schema, request);
					context = await createContext?.(parsedRequest);
					const response = await handler(request as PrettyRequestSchema<Schema, Types["Transform"]>, context as Types["Context"]);
					const parsedResponse = parseResponse(config.parse, schema, response);

					return parsedResponse as HTTPResponse;
				}
				finally
				{
					if (context)
					{
						cleanup?.(context);
					}
				}
			}
		);
	}

	return {
		route
	};
}
