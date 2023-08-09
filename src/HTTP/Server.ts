import { Route, RouteDefinition } from "./Router";
import { RouteSchema, PostRouteSchema, PutRouteSchema, DeleteRouteSchema } from "./Schemas";
import { Path, FullPath, PathParameters } from "./Paths";

import { Prettify, OptionalParam } from "./Common";

export type Server<TRoute extends Route> = {
	load?: unknown;
	start?: unknown;
};

export type ServerRouteHandlers<TBasePath extends Path, TRouteDefinition extends RouteDefinition> = ServerRouteMethodsHandlers<TBasePath, TRouteDefinition> & ServerRouteRoutesHandlers<TBasePath, TRouteDefinition>;

export type ServerRouteMethodsHandlers<TBasePath extends Path, TRouteDefinition extends RouteDefinition> = {
	[Key in keyof TRouteDefinition["methods"]]: TRouteDefinition["methods"][Key] extends RouteSchema ? (request: RouteSchemaRequest<FullPath<TBasePath, TRouteDefinition["path"]>, TRouteDefinition["methods"][Key]>) => Prettify<TRouteDefinition["methods"][Key]["responses"][number]> : never;
};
export type ServerRouteRoutesHandlers<TBasePath extends Path, TRouteDefinition extends RouteDefinition> = {
	[Key in keyof TRouteDefinition["routes"]]: TRouteDefinition["routes"][Key] extends RouteDefinition ? ServerRouteHandlers<FullPath<TBasePath, TRouteDefinition["path"]>, TRouteDefinition["routes"][Key]> : never;
};

export type RouteSchemaRequest<TPath extends Path, TRouteSchema extends RouteSchema> = Prettify<RouteSchemaParams<TPath> & RouteSchemaBody<TRouteSchema>>;

type RouteSchemaParams<TPath extends Path> = OptionalParam<"params", {
	// eslint-disable-next-line @typescript-eslint/ban-types
	[Param in PathParameters<TPath> | (string & {})]: string;
}>;
type RouteSchemaBody<TRouteSchema extends RouteSchema> = OptionalParam<"body", TRouteSchema extends PostRouteSchema ? TRouteSchema["body"] : undefined>;
// type RouteSchemaParams<TPath extends Path> = OptionalParam<"params", TPath>;

// NOTE: oddly... Prettify<RouteHandlers> fixes function inference..
export declare function createServer<const TRoute extends Route>(route: TRoute, handlers: Prettify<ServerRouteHandlers<"/", TRoute["root"]>>): Server<TRoute>;
