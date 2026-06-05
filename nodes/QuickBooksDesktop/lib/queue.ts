import crypto from 'crypto';

export type JobStatus = 'pending' | 'sent' | 'completed' | 'error';

export interface QuickBooksDesktopJob {
	id: string;
	qbxml: string;
	status: JobStatus;
	readOnly: boolean;
	priority: number;
	responseXml?: string;
	hresult?: string;
	message?: string;
	sessionTicket?: string;
	createdAt: number;
	updatedAt: number;
}

export interface QueuedResponse {
	jobId: string;
	hresult: string;
	message: string;
	responseXml: string;
	timestamp: number;
}

const jobs = new Map<string, QuickBooksDesktopJob>();
const pendingResponses: QueuedResponse[] = [];
const MAX_RESPONSES_BUFFER = 200;

export function enqueueJob(params: {
	qbxml: string;
	readOnly?: boolean;
	priority?: number;
}): QuickBooksDesktopJob {
	const id = crypto.randomBytes(12).toString('hex');
	const now = Date.now();
	const job: QuickBooksDesktopJob = {
		id,
		qbxml: params.qbxml,
		status: 'pending',
		readOnly: params.readOnly ?? false,
		priority: params.priority ?? 0,
		createdAt: now,
		updatedAt: now,
	};
	jobs.set(id, job);
	return job;
}

export function dequeueNextJob(sessionTicket: string, readOnly: boolean): QuickBooksDesktopJob | null {
	const candidates: QuickBooksDesktopJob[] = [];

	for (const job of jobs.values()) {
		if (job.status !== 'pending') continue;
		if (readOnly && !job.readOnly) continue;
		candidates.push(job);
	}

	if (candidates.length === 0) return null;

	candidates.sort((a, b) => {
		if (b.priority !== a.priority) return b.priority - a.priority;
		return a.createdAt - b.createdAt;
	});

	const next = candidates[0];
	next.status = 'sent';
	next.sessionTicket = sessionTicket;
	next.updatedAt = Date.now();
	return next;
}

export function completeJob(
	jobId: string,
	responseXml: string,
	hresult?: string,
	message?: string,
): QuickBooksDesktopJob | null {
	const job = jobs.get(jobId);
	if (!job) return null;

	job.status = hresult && hresult !== '0' ? 'error' : 'completed';
	job.responseXml = responseXml;
	job.hresult = hresult;
	job.message = message;
	job.updatedAt = Date.now();

	return job;
}

export function getJob(jobId: string): QuickBooksDesktopJob | null {
	return jobs.get(jobId) ?? null;
}

export function getJobByTicket(sessionTicket: string): QuickBooksDesktopJob | null {
	for (const job of jobs.values()) {
		if (job.sessionTicket === sessionTicket && job.status === 'sent') {
			return job;
		}
	}
	return null;
}

export function pushResponse(response: QueuedResponse): void {
	pendingResponses.push(response);
	if (pendingResponses.length > MAX_RESPONSES_BUFFER) {
		pendingResponses.splice(0, pendingResponses.length - MAX_RESPONSES_BUFFER);
	}
}

export function drainResponses(): QueuedResponse[] {
	return pendingResponses.splice(0, pendingResponses.length);
}

export function peekResponses(): QueuedResponse[] {
	return [...pendingResponses];
}

export function countPendingJobs(readOnly?: boolean): number {
	let count = 0;
	for (const job of jobs.values()) {
		if (job.status !== 'pending') continue;
		if (readOnly !== undefined && readOnly && !job.readOnly) continue;
		count++;
	}
	return count;
}

export function percentComplete(sessionTicket: string): number {
	const total = countPendingJobs();
	const sent = [...jobs.values()].filter(
		(j) => j.sessionTicket === sessionTicket && (j.status === 'sent' || j.status === 'completed'),
	).length;
	if (total === 0) return 0;
	return Math.round((sent / total) * 100);
}
