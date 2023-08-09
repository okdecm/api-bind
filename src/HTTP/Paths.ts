export type Path = `/${string}`;

export type FullPath<TBasePath extends Path, TPath extends Path> = (TBasePath extends "/" ? TPath : `${TBasePath}${TPath}`) extends infer S extends Path ? S : never;

export type PathParameters<TPath extends Path> = TPath extends `/${infer PartA}/${infer PartB}` ? PathParameter<`/${PartA}`> | PathParameters<`/${PartB}`> : PathParameter<TPath>;
export type PathParameter<TPart extends Path> = TPart extends `/:${infer ParameterName}` ? ParameterName : never;
