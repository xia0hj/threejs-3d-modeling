export type WithSetter<Obj> = Obj & {
	[SetterKey in NonNullable<keyof Obj> as `set${Capitalize<
		Extract<SetterKey, string>
	>}`]: (newVal: Obj[SetterKey]) => void;
}
