import { HTTPSchema } from "./Schema";
import { HTTPConfig, HTTPResponse, PrettyRequest, PrettyResponse } from "./Shared";

import { Fn } from "hotscript";

type HTTPServerRequest = {
	params?: {
		[key: string]: string;
	};
	body?: unknown;
};

export type HTTPServerConfig<ParserType> = {
	route: (path: string, method: string, handler: (request: HTTPServerRequest) => Promise<HTTPResponse>) => void;
} & HTTPConfig<ParserType>;

export function httpServer<ParserType, Transform extends Fn>(config: HTTPServerConfig<ParserType>)
{
	function handle<Schema extends HTTPSchema<ParserType>>(schema: Schema, handler: (request: PrettyRequest<Schema, Transform>) => Promise<PrettyResponse<Schema["responses"][number], Transform>>)
	{
		config.route(
			schema.path,
			schema.method,
			async (request: HTTPServerRequest) =>
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
		handle
	};
}
