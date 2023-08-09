type AnyFunction = (...args: any[]) => any;

export type Prettify<T> = {
	// NOTE: not sure if I should call prettify on _every_ value..
	[K in keyof T]: T[K] extends AnyFunction ? T[K] : Prettify<T[K]>;
// eslint-disable-next-line @typescript-eslint/ban-types
} & {};

export type OptionalParam<TName extends string, TType> = (
	TType extends undefined | Record<string, never> ? {
		[Property in TName]?: undefined;
	} : {
		[Property in TName]: TType;
	}
);
