import { Route, RouteDefinition } from "./Router";
import { RouteSchema } from "./Schemas";

import { Prettify } from "./Common";

export type Client<TRoute extends Route> = ClientRouteDefinition<TRoute["root"]>;

export type ClientRouteDefinition<TRouteDefinition extends RouteDefinition> = ClientRouteMethods<TRouteDefinition> & ClientRouteRoutes<TRouteDefinition>;

export type ClientRouteMethods<TRouteDefinition extends RouteDefinition> = {
	[Key in keyof TRouteDefinition["methods"]]: TRouteDefinition["methods"][Key] extends RouteSchema ? (request: Prettify<TRouteDefinition["methods"][Key]>) => Prettify<TRouteDefinition["methods"][Key]["responses"][number]> : never;
};

export type ClientRouteRoutes<TRouteDefinition extends RouteDefinition> = {
	[Key in keyof TRouteDefinition["routes"]]: TRouteDefinition["routes"][Key] extends RouteDefinition ? ClientRouteDefinition<TRouteDefinition["routes"][Key]> : never;
};

export declare function createClient<TRoute extends Route>(route: TRoute): Client<TRoute>;
