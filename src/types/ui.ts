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

export const toneMap: Record<Tone, string> = {
	neutral: 'var(--muted)',
	accent: 'var(--accent)',
	success: 'var(--success)',
	warning: 'var(--warning)',
	info: 'var(--info)',
	danger: 'var(--error)'
};
