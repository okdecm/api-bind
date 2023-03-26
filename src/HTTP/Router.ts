import { HTTPSchema } from "./Schema";
import { HTTPMethod, HTTPConfig, HTTPResponse, PrettyRequest, PrettyResponse } from "./Shared";

import { ValidationError } from "./ValidationError";

import { Fn } from "../HOTScript";

type HTTPRouterRequest = {
	params?: {
		[key: string]: string;
	};
	body?: unknown;
};

export type HandlerCallback = (request: HTTPRouterRequest) => Promise<HTTPResponse>;

export type HTTPRouterConfig<ParserType> = {
	register: (path: string, method: HTTPMethod, handler: HandlerCallback) => void;
} & HTTPConfig<ParserType>;

export function httpRouter<ParserType, Transform extends Fn>(config: HTTPRouterConfig<ParserType>)
{
	function route<Schema extends HTTPSchema<ParserType>>(schema: Schema, handler: (request: PrettyRequest<Schema, Transform>) => Promise<PrettyResponse<Schema["responses"][number], Transform>>)
	{
		config.register(
			schema.path,
			schema.method,
			async (request: HTTPRouterRequest) =>
			{
				if (schema.body)
				{
					try
					{
						request.body = config.parse(schema.body, request.body);
					}
					catch (e)
					{
						throw new ValidationError(
							"Invalid body",
							{
								cause: e
							}
						);
					}
				}

				const result = await handler(request as PrettyRequest<Schema, Transform>);

				return result as HTTPResponse;
			}
		);
	}

	return {
		route
	};
}
