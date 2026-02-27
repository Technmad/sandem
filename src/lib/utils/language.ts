// src/lib/utils/language.ts

const EXT_TO_LANGUAGE: Record<string, string> = {
	js: 'javascript',
	jsx: 'javascript',
	ts: 'typescript',
	tsx: 'typescript',
	html: 'html',
	css: 'css',
	json: 'json',
	md: 'markdown'
};

export function getMonacoLanguage(fileName: string): string {
	const ext = fileName.split('.').pop() ?? '';
	return EXT_TO_LANGUAGE[ext] ?? 'plaintext';
}
