export class ValidationError extends Error
{
	constructor(message: string, options?: ErrorOptions)
	{
		super(message, options);

		// For legacy support where instanceof isn't so great
		this.name = "ValidationError";
	}
}

export function isValidationError(e: unknown): e is ValidationError
{
	return (e instanceof Error && e.name == "ValidationError");
}
