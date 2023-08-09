import { Call, Fn } from "../HOTScript";

import { RouteSchema, GetRouteSchema, PostRouteSchema, PutRouteSchema, DeleteRouteSchema, ResponseSchema } from "./Schemas";
import { Path } from "./Paths";

export type RouteDefinition = {
	path: Path;
	methods?: RouteMethods;
	routes?: Routes;
};

export type RouteMethods = {
	[alias: string]: RouteSchema;
}

export type Routes = {
	[alias: string]: RouteDefinition;
};

export type ParsedRouteDefinition<TRoute extends RouteDefinition, TTransform extends Fn> = {
	[Key in keyof TRoute]:
	| Key extends "methods" ? TRoute[Key] extends RouteMethods ? ParsedRouteMethods<TRoute[Key], TTransform> : never : never
	| Key extends "routes" ? TRoute[Key] extends Routes ? ParsedRoutes<TRoute[Key], TTransform> : never : never
		| TRoute[Key]
};

export type ParsedRouteMethods<TRouteMethods extends RouteMethods, TTransform extends Fn> = {
	[Method in keyof TRouteMethods]: ParsedRouteSchema<TRouteMethods[Method], TTransform>
};

export type ParsedRoutes<TRoutes extends Routes, TTransform extends Fn> = {
	[Alias in keyof TRoutes]: ParsedRouteDefinition<TRoutes[Alias], TTransform>
};

// NOTE: I _hateeeee_ this. It should be a _single_ type, but unforunately doing them separately seems to fix the `satisfies Route` below
export type ParsedRouteSchema<TRouteSchema extends RouteSchema, TTransform extends Fn> =
	| TRouteSchema extends GetRouteSchema ? ParsedGetRouteSchema<TRouteSchema, TTransform> : never
	| TRouteSchema extends PostRouteSchema ? ParsedPostRouteSchema<TRouteSchema, TTransform> : never
		| TRouteSchema extends PutRouteSchema ? ParsedPutRouteSchema<TRouteSchema, TTransform> : never
			| TRouteSchema extends DeleteRouteSchema ? ParsedDeleteRouteSchema<TRouteSchema, TTransform> : never;

export type ParsedGetRouteSchema<TRouteSchema extends GetRouteSchema, TTransform extends Fn> = ParsedRouteSchemaImpl<TRouteSchema, TTransform>;
export type ParsedPostRouteSchema<TRouteSchema extends PostRouteSchema, TTransform extends Fn> = ParsedRouteSchemaImpl<TRouteSchema, TTransform>;
export type ParsedPutRouteSchema<TRouteSchema extends PutRouteSchema, TTransform extends Fn> = ParsedRouteSchemaImpl<TRouteSchema, TTransform>;
export type ParsedDeleteRouteSchema<TRouteSchema extends DeleteRouteSchema, TTransform extends Fn> = ParsedRouteSchemaImpl<TRouteSchema, TTransform>;

// NOTE: this is _really_ stupid..
type ParsedRouteSchemaImpl<TRouteSchema extends RouteSchema, TTransform extends Fn> = {
	[Key in keyof TRouteSchema]:
	| Key extends "body" ? Call<TTransform, TRouteSchema[Key]> : never
	| Key extends "responses" ? ParsedResponseSchemas<TRouteSchema[Key], TTransform> : never
		| TRouteSchema[Key];
};

export type ParsedResponseSchemas<TResponseSchemas extends readonly ResponseSchema[], TTransform extends Fn> = {
	[Key in keyof TResponseSchemas]: ParsedResponseSchema<TResponseSchemas[Key], TTransform>;
};

export type ParsedResponseSchema<TResponseSchema extends ResponseSchema, TTransform extends Fn> = {
	[Key in keyof TResponseSchema]:
	| Key extends "body" ? Call<TTransform, TResponseSchema[Key]> : never
	| TResponseSchema[Key];
};

export type ParseFn<TParserType> = (schema: TParserType, value: unknown) => unknown;

export type RouterTypes = {
	ParserType?: unknown;
	Parsed?: Fn;
};

export type RouterConfig<TTypes extends RouterTypes> = {
	parse?: ParseFn<TTypes["ParserType"]>;
};

export type Route = {
	root: RouteDefinition;
	parseRequest?(request: unknown): unknown;
	parseResponse?(response: unknown): unknown;
};

export function createRouter<const TTypes extends RouterTypes>(config: RouterConfig<TTypes>)
{
	const { parse } = config;

	return function<const TRouteDefiniton extends RouteDefinition>(rootRoute: TRouteDefiniton)
	{
		return {
			root: rootRoute as TTypes["Parsed"] extends Fn ? ParsedRouteDefinition<TRouteDefiniton, TTypes["Parsed"]> : TRouteDefiniton,
			parseRequest(request)
			{
				return {};
			},
			parseResponse(response)
			{
				return {};
			}
		} satisfies Route;
	};
}
