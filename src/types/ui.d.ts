export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'info' | 'danger';
export type Variant =
	| 'default'
	| 'outline'
	| 'ghost'
	| 'link'
	| 'delete'
	| 'notched'
	| 'wide'
	| 'filled';
export declare const toneMap: Record<Tone, string>;
