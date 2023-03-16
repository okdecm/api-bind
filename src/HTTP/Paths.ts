import { Call, Tuples, Pipe, Strings, Objects } from "hotscript";

export type PathParams<Path extends string> = Call<Objects.Record<Pipe<
Path,
[
	Strings.Split<"/">,
	Tuples.Filter<Strings.StartsWith<":">>,
	Tuples.Map<Strings.Trim<":">>,
	Tuples.ToUnion
]
>>, string>;
