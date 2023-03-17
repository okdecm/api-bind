import { HTTPSchema } from "./Schema";
import { HTTPConfig, HTTPResponse, PrettyRequest, PrettyResponse } from "./Shared";

import { Fn } from "hotscript";

type HTTPServerRequest = {
	Params?: {
		[key: string]: string;
	};
	Body?: unknown;
};

export type HTTPServerConfig<ParserType> = {
	route: (path: string, method: string, handler: (request: HTTPServerRequest) => Promise<HTTPResponse>) => void;
} & HTTPConfig<ParserType>;

export function httpServer<ParserType, Transform extends Fn>(config: HTTPServerConfig<ParserType>)
{
	function handle<Schema extends HTTPSchema<ParserType>>(schema: Schema, handler: (request: PrettyRequest<Schema, Transform>) => Promise<PrettyResponse<Schema["Responses"][number], Transform>>)
	{
		return async function(request: PrettyRequest<Schema, Transform>): Promise<PrettyResponse<Schema["Responses"][number], Transform>>
		{
			if (schema.Body)
			{
				try
				{
					request.Body = config.parse(schema.Body, request.Body);
				}
				catch (e)
				{
					throw new Error("Invalid body");
				}
			}

			const result = await handler(request);

			return result;
		};
	}

	return {
		handle
	};
}
