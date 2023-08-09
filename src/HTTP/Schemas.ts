export type RouteSchema = GetRouteSchema | PostRouteSchema | PutRouteSchema | DeleteRouteSchema;

export type GetRouteSchema = {
	method: "get";
	responses: readonly ResponseSchema[];
};
export type PostRouteSchema = {
	method: "post";
	body: unknown;
	responses: readonly ResponseSchema[];
};
export type PutRouteSchema = {
	method: "put";
	body: unknown;
	responses: readonly ResponseSchema[];
};
export type DeleteRouteSchema = {
	method: "delete";
	body?: unknown;
	responses: readonly ResponseSchema[];
};

export type ResponseSchema = {
	statusCode: number;
	body?: unknown;
};
