export interface HTTPSchema<ValidatorType = unknown> {
	Path: string;
	Method: "get" | "post" | "put" | "delete";
	Body: ValidatorType;
	Responses: readonly HTTPResponseSchema<ValidatorType>[]
}

export type HTTPResponseSchema<ValidatorType = unknown> = {
	StatusCode: number;
	Body?: ValidatorType;
}
