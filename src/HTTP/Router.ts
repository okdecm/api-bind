import { HTTPSchema } from "./Schema";
import { HTTPConfig, HTTPResponse, PrettyRequest, PrettyResponse } from "./Shared";

import { Fn } from "hotscript";

type HTTPRouterRequest = {
	params?: {
		[key: string]: string;
	};
	body?: unknown;
};

export type HTTPRouterConfig<ParserType> = {
	register: (path: string, method: string, handler: (request: HTTPRouterRequest) => Promise<HTTPResponse>) => void;
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
						throw new Error("Invalid body");
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