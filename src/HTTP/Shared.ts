import { HTTPSchema, HTTPResponseSchema } from "./Schema";
import { PathParameters } from "./Paths";

import { Call, Fn } from "hotscript";

export type HTTPMethod = "get" | "post" | "put" | "delete";

export type HTTPConfig<ParserType> = {
	parse: <Schema extends ParserType>(schema: Schema, value: unknown) => Schema;
};

export type HTTPResponse = {
	StatusCode: number;
	Body?: unknown;
};

/*

	Here be dragons..
	aka... I hate TypeScript sometimes..

*/

type PrettyRequestBody<Body, Transform extends Fn> = unknown extends Body ? {
	Body?: unknown;
} : {
	Body: Call<Transform, Body>;
};

type PrettyRequestParams<Params> = Params extends Record<string, never> ? {
	Params: never;
} : {
	Params: Params;
};

type IntersectionToUnion<I> = I extends infer O ? {
	[Key in keyof O]: O[Key];
} : never;

// Hacky union to intersection had to be used :(
// Example: `extends infer O ? {[K in keyof O]: O[K]} : never)`
// Wish declaring conditional optional parameters was easier..
export type PrettyRequest<Schema extends HTTPSchema, Transform extends Fn> = IntersectionToUnion<(
	PrettyRequestParams<PathParameters<Schema["Path"]>> & PrettyRequestBody<Schema["Body"], Transform>
)>;

export type PrettyResponse<Schema extends HTTPResponseSchema, Transform extends Fn> = Schema extends any ? {
	-readonly [Key in keyof Schema]:
	| Key extends "Body" ? Call<Transform, Schema[Key]> : never
	| Schema[Key]
} : never;
