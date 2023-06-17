export type HTTPSchema<ValidatorType = unknown> = {
	path: string;
	method: "get" | "post" | "put" | "delete";
	body?: ValidatorType;
	responses: readonly HTTPResponseSchema<ValidatorType>[]
}

export type HTTPResponseSchema<ValidatorType = unknown> = {
	statusCode: number;
	body?: ValidatorType;
}

export type HTTPSchemaResponse<TSchema extends HTTPSchema> = TSchema["responses"][number];
