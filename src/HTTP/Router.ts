import { HTTPSchema } from "./Schema";
import { HTTPMethod, HTTPRequest, HTTPConfig, HTTPResponse, PrettyRequestSchema, PrettyResponseSchema } from "./Common";
import { parseResponse } from "./Parser";

import { ValidationError } from "./ValidationError";

import { Fn } from "../HOTScript";

export type HandlerCallback = (request: HTTPRequest) => Promise<HTTPResponse>;

export interface IHTTPRouterTypes
{
	ParserType: unknown;
	Transform: Fn;
	Context?: unknown;
}

export type HTTPRouterConfig<Types extends IHTTPRouterTypes> = {
	register: (path: string, method: HTTPMethod, handler: HandlerCallback) => void;
	createContext?: (request: HTTPRequest) => Promise<Types["Context"]>;
	cleanup?: (context: Types["Context"]) => Promise<void>;
} & HTTPConfig<Types["ParserType"]>;

export function httpRouter<Types extends IHTTPRouterTypes>(config: HTTPRouterConfig<Types>)
{
	function route<Schema extends HTTPSchema<Types["ParserType"]>>(schema: Schema, handler: (request: PrettyRequestSchema<Schema, Types["Transform"]>, context: Types["Context"]) => Promise<PrettyResponseSchema<Schema["responses"][number], Types["Transform"]>>)
	{
		config.register(
			schema.path,
			schema.method,
			async (request: HTTPRequest) =>
			{
				if (schema.body)
				{
					try
					{
						request.body = config.parse(schema.body, request.body);
					}
					catch (e)
					{
						throw new ValidationError("Invalid body", {
							cause: e
						});
					}
				}

				const context = await config.createContext?.(request);
				const response = await handler(request as PrettyRequestSchema<Schema, Types["Transform"]>, context as Types["Context"]);

				// TODO: parse response (as we may have extra keys - e.g. when using z.object(...).strict())

				const parsedResponse = parseResponse(config.parse, schema, response);

				config.cleanup?.(context);

				return parsedResponse as HTTPResponse;
			}
		);
	}

	return {
		route
	};
}
