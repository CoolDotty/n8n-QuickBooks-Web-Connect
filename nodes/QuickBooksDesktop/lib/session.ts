import crypto from 'crypto';

export interface SessionTicket {
	ticket: string;
	connectionId: string;
	expiresAt: Date;
}

const sessions = new Map<string, SessionTicket>();
const TICKET_BYTES = 24;

export function createSession(connectionId: string, ttlMinutes = 60): SessionTicket {
	const ticket = crypto.randomBytes(TICKET_BYTES).toString('hex');
	const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
	sessions.set(ticket, { ticket, connectionId, expiresAt });
	return { ticket, connectionId, expiresAt };
}

export function validateTicket(ticket: string): SessionTicket | null {
	const session = sessions.get(ticket);
	if (!session) return null;
	if (session.expiresAt.getTime() < Date.now()) {
		sessions.delete(ticket);
		return null;
	}
	return session;
}

export function closeSession(ticket: string): void {
	sessions.delete(ticket);
}

export function getSessionError(): string | undefined {
	return undefined;
}

export function setSessionError(): void {
	// In-memory, no persistence needed for minimal version
}

export function clearSessionError(): void {
	// No-op for minimal version
}
