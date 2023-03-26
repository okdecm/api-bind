// Big up hotscript for these types..
// Unfortunately using moduleResolution set to "NodeNext" broke hotscript imports..
// So I've ripped them locally to a. resolve that and b. remove a dependency /shrug

declare const rawArgs: unique symbol;
type rawArgs = typeof rawArgs;

export interface Fn {
	[rawArgs]: unknown;
	args: this[rawArgs] extends infer args extends unknown[] ? args : never;
	arg0: this[rawArgs] extends [infer arg, ...any] ? arg : never;
	arg1: this[rawArgs] extends [any, infer arg, ...any] ? arg : never;
	arg2: this[rawArgs] extends [any, any, infer arg, ...any] ? arg : never;
	arg3: this[rawArgs] extends [any, any, any, infer arg, ...any] ? arg : never;
	return: unknown;
}

export type Call<fn extends Fn, arg1> = (fn & {
	[rawArgs]: [arg1];
})["return"];