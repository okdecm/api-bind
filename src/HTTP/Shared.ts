import { HTTPSchema, HTTPResponseSchema } from "./Schema";
import { PathParams } from "./Paths";

import { Call, Fn } from "hotscript";

export type HTTPMethod = "get" | "post" | "put" | "delete";

export type HTTPConfig<ParserType> = {
	parse: <Schema extends ParserType>(schema: Schema, value: unknown) => Schema;
};

export type HTTPResponse = {
	StatusCode: number;
	Body?: unknown;
};

export type PrettyRequest<Schema extends HTTPSchema, Transform extends Fn> = Response extends any ? {
	Params: PathParams<Schema["Path"]>;
	Body: Call<Transform, Schema["Body"]>;
} : never;

export type PrettyResponse<Response extends HTTPResponseSchema, Transform extends Fn> = Response extends any ? {
	-readonly [Key in keyof Response]:
	| Key extends "Body" ? Call<Transform, Response[Key]> : never
	| Response[Key]
} : never;
