export type PathParameters<Path extends string> = {
	[Parameter in GetPathParameters<Path>]: string;
};

type GetPathParameters<Path extends string> = Path extends `${infer PartA}/${infer PartB}` ? IsPathParameter<PartA> | GetPathParameters<PartB> : IsPathParameter<Path>;
type IsPathParameter<Part extends string> = Part extends `:${infer ParameterName}` ? ParameterName : never;

export type Params = {
	[name: string]: string;
};

export function injectParams(path: string, params: Params)
{
	const patternRegex = (name: string) => new RegExp("(^|/):" + name + "(/|$)", "g");

	for (const name in params)
	{
		const value = params[name];

		const matches = path.match(patternRegex(name));

		if (matches)
		{
			for (const match of matches)
			{
				path = path.replace(match, match.replace(`:${name}`, value));
			}
		}
	}

	return path;
}
