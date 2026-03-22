export type TerminalSessionMeta = {
	id: string;
	label: string;
};

const STORAGE_KEY = 'sandem.terminal.sessions.v1';

function createSessionMeta(order: number): TerminalSessionMeta {
	return {
		id: `terminal-${order}-${Math.random().toString(36).slice(2, 8)}`,
		label: `${order}: jsh`
	};
}

export function createTerminalSessionsController() {
	let nextOrder = $state(2);
	let sessions = $state<TerminalSessionMeta[]>([createSessionMeta(1)]);
	let activeSessionId = $state<string>(sessions[0].id);
	let splitSessionId = $state<string | null>(null);

	function persistState() {
		if (typeof window === 'undefined') return;

		window.localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				nextOrder,
				sessions,
				activeSessionId,
				splitSessionId
			})
		);
	}

	function hydrateState() {
		if (typeof window === 'undefined') return;

		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return;

		try {
			const parsed = JSON.parse(raw) as {
				nextOrder?: number;
				sessions?: TerminalSessionMeta[];
				activeSessionId?: string;
				splitSessionId?: string | null;
			};

			const nextSessions = parsed.sessions?.filter((session) => session.id && session.label) ?? [];
			if (nextSessions.length === 0) return;

			sessions = nextSessions;
			nextOrder = Math.max(parsed.nextOrder ?? nextSessions.length + 1, nextSessions.length + 1);

			const validActive = parsed.activeSessionId
				? nextSessions.some((session) => session.id === parsed.activeSessionId)
				: false;
			activeSessionId = validActive ? (parsed.activeSessionId as string) : nextSessions[0].id;

			const validSplit = parsed.splitSessionId
				? nextSessions.some((session) => session.id === parsed.splitSessionId)
				: false;
			splitSessionId = validSplit ? (parsed.splitSessionId as string) : null;
		} catch {
			// ignore malformed session state
		}
	}

	function setActiveSession(id: string) {
		if (!sessions.some((session) => session.id === id)) return;
		activeSessionId = id;
		persistState();
	}

	function createSession() {
		const session = createSessionMeta(nextOrder);
		nextOrder += 1;
		sessions = [...sessions, session];
		activeSessionId = session.id;
		persistState();
		return session.id;
	}

	function renameSession(id: string, nextLabel: string) {
		const normalized = nextLabel.trim();
		if (!normalized) return;
		if (!sessions.some((session) => session.id === id)) return;

		sessions = sessions.map((session) =>
			session.id === id ? { ...session, label: normalized } : session
		);
		persistState();
	}

	function moveSession(id: string, direction: 'left' | 'right') {
		const index = sessions.findIndex((session) => session.id === id);
		if (index < 0) return;

		const offset = direction === 'left' ? -1 : 1;
		const nextIndex = index + offset;
		if (nextIndex < 0 || nextIndex >= sessions.length) return;

		const next = sessions.slice();
		const [moved] = next.splice(index, 1);
		next.splice(nextIndex, 0, moved);
		sessions = next;
		persistState();
	}

	function closeSession(id: string) {
		if (!sessions.some((session) => session.id === id)) return;

		if (sessions.length === 1) {
			const replacement = createSessionMeta(nextOrder);
			nextOrder += 1;
			sessions = [replacement];
			activeSessionId = replacement.id;
			splitSessionId = null;
			persistState();
			return;
		}

		sessions = sessions.filter((session) => session.id !== id);

		if (activeSessionId === id) {
			activeSessionId = sessions[0]?.id ?? activeSessionId;
		}

		if (splitSessionId === id) {
			splitSessionId = null;
		}

		persistState();
	}

	function splitActiveSession() {
		if (splitSessionId) return splitSessionId;

		const session = createSessionMeta(nextOrder);
		nextOrder += 1;
		sessions = [...sessions, session];
		splitSessionId = session.id;
		persistState();
		return session.id;
	}

	function closeSplitSession() {
		splitSessionId = null;
		persistState();
	}

	function setSplitSession(id: string | null) {
		if (!id) {
			splitSessionId = null;
			persistState();
			return;
		}

		if (!sessions.some((session) => session.id === id)) return;
		splitSessionId = id;
		persistState();
	}

	return {
		hydrateState,
		get sessions() {
			return sessions;
		},
		get activeSessionId() {
			return activeSessionId;
		},
		get splitSessionId() {
			return splitSessionId;
		},
		setActiveSession,
		createSession,
		renameSession,
		moveSession,
		closeSession,
		splitActiveSession,
		closeSplitSession,
		setSplitSession
	};
}
