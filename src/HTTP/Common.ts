import { HTTPSchema, HTTPResponseSchema } from "./Schema";
import { PathParameters } from "./Paths";

import { Call, Fn, IntersectionToUnion } from "../HOTScript";
import { Parser } from "./Parser";

export type HTTPMethod = "get" | "post" | "put" | "delete";

export type HTTPConfig<ParserType> = {
	parse: Parser<ParserType>;
};

export type HTTPHeaders = {
	[key: string]: string | string[];
};

export type HTTPParams = {
	[key: string]: string | string[];
};

export type HTTPRequest = {
	headers?: HTTPHeaders;
	params?: HTTPParams;
	body?: unknown;
};

export type HTTPResponse = {
	statusCode: number;
	body?: unknown;
};

/*

	Here be dragons..
	aka... I hate TypeScript sometimes..

*/
// Hacky union to intersection had to be used :(
// Example: `extends infer O ? {[K in keyof O]: O[K]} : never)`
// Wish declaring conditional optional parameters was easier..
// TODO: make this "never" when no properties are required
export type PrettyRequestSchema<Schema extends HTTPSchema, Transform extends Fn = Fn> = IntersectionToUnion<(
	PrettyRequestSchemaParams<PathParameters<Schema["path"]>> & PrettyRequestSchemaBody<Schema["body"], Transform>
)>;

type PrettyRequestSchemaBody<Body, Transform extends Fn> = unknown extends Body ? {
	body?: unknown;
} : {
	body: Call<Transform, Body>;
};

type PrettyRequestSchemaParams<Params> = Params extends Record<string, never> ? {
	params?: undefined;
} : {
	params: Params;
};

export type PrettyResponseSchema<Schema extends HTTPResponseSchema, Transform extends Fn = Fn> = Schema extends any ? {
	-readonly [Key in keyof Schema]:
	| Key extends "body" ? Call<Transform, Schema[Key]> : never
	| Schema[Key]
} : never;
