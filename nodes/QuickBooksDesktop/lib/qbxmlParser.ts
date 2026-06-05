/**
 * Hand-rolled QBXML response parser.
 *
 * Extracts structured JSON from QuickBooks Desktop QBXML query response
 * bodies. Models the same pattern used by soap.ts: zero runtime dependencies,
 * regex-based XML extraction that stays n8n-Cloud compatible.
 *
 * Supported response types and their output shapes:
 *
 *   CustomerQueryRs → { responseType: "CustomerQueryRs", customers: [...] }
 *   ItemQueryRs     → { responseType: "ItemQueryRs",     items: [...] }
 *   HostQueryRs     → { responseType: "HostQueryRs",     host: {...} }
 *
 * Unrecognised response types still expose responseType and include the
 * raw XML as a fallback:
 *
 *   { responseType: "SomeOtherRs", rawBody: "<QBXML>..." }
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface CustomerRecord {
	listId: string;
	fullName: string;
	name: string;
	isActive: string;
	email: string;
	phone: string;
}

export interface ItemRecord {
	listId: string;
	fullName: string;
	name: string;
	upc: string;
	description: string;
	salesPrice: string;
	isActive: string;
}

export interface ParsedQbxmlResponse {
	responseType: string;
	customers?: CustomerRecord[];
	items?: ItemRecord[];
	host?: Record<string, string>;
	rawBody?: string;
}

// ---------------------------------------------------------------------------
// Known response-type set – add new types here as support grows
// ---------------------------------------------------------------------------

const KNOWN_TYPES: Set<string> = new Set([
	'CustomerQueryRs',
	'ItemQueryRs',
	'HostQueryRs',
]);

// ---------------------------------------------------------------------------
// Public entry-point
// ---------------------------------------------------------------------------

export function parseQbxmlResponse(xml: string): ParsedQbxmlResponse {
	const cleaned = xml.replace(/^\uFEFF/, '').trim();

	// The first *Rs element inside <QBXMLMsgsRs> carries the response type.
	const rsMatch = cleaned.match(/<([A-Za-z_]\w*Rs)\b[^>]*>/);
	if (!rsMatch) {
		return { responseType: 'unknown', rawBody: cleaned };
	}

	const responseType = rsMatch[1];

	if (!KNOWN_TYPES.has(responseType)) {
		return { responseType, rawBody: cleaned };
	}

	// Extract every *Ret element block (handles CustomerRet, ItemRet,
	// ItemInventoryRet, ItemServiceRet, HostRet, etc.).
	const retElements: Array<{ xml: string }> = [];
	const retRe = /<([A-Za-z_][\w]*Ret)\b[^>]*>([\s\S]*?)<\/\1>/g;
	let rm: RegExpExecArray | null;
	while ((rm = retRe.exec(cleaned)) !== null) {
		retElements.push({ xml: rm[2] });
	}

	switch (responseType) {
		case 'CustomerQueryRs':
			return {
				responseType,
				customers: retElements.map((r) => parseCustomerRet(r.xml)),
			};

		case 'ItemQueryRs':
			return {
				responseType,
				items: retElements.map((r) => parseItemRet(r.xml)),
			};

		case 'HostQueryRs':
			return {
				responseType,
				host: retElements.length > 0 ? parseHostRet(retElements[0].xml) : {},
			};

		default:
			return { responseType, rawBody: cleaned };
	}
}

// ---------------------------------------------------------------------------
// Per-type extractors
// ---------------------------------------------------------------------------

function parseCustomerRet(xml: string): CustomerRecord {
	return {
		listId:   extractElement(xml, 'ListID'),
		fullName: extractElement(xml, 'FullName'),
		name:     extractElement(xml, 'Name'),
		isActive: extractElement(xml, 'IsActive'),
		email:    extractElement(xml, 'Email'),
		phone:    extractElement(xml, 'Phone'),
	};
}

function parseItemRet(xml: string): ItemRecord {
	return {
		listId:      extractElement(xml, 'ListID'),
		fullName:    extractElement(xml, 'FullName'),
		name:        extractElement(xml, 'Name'),
		upc:         extractElement(xml, 'UPC'),
		description: extractElement(xml, 'SalesDesc'),
		salesPrice:  extractElement(xml, 'SalesPrice'),
		isActive:    extractElement(xml, 'IsActive'),
	};
}

/**
 * Flatten every immediate leaf child of <HostRet> into a key-value map.
 * Nested elements are skipped – HostRet is flat in practice.
 */
function parseHostRet(xml: string): Record<string, string> {
	const result: Record<string, string> = {};
	const re = /<([A-Za-z_][\w]*)\b[^>]*>([\s\S]*?)<\/\1>/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(xml)) !== null) {
		const key = m[1];
		const raw = m[2];
		if (!looksLikeElement(raw)) {
			result[key] = decodeXmlEntities(raw);
		}
	}
	return result;
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

function extractElement(xml: string, tagName: string): string {
	const re = new RegExp(
		`<${escapeRegex(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegex(tagName)}>`,
		'i',
	);
	const m = re.exec(xml);
	return m ? decodeXmlEntities(m[1]) : '';
}

function decodeXmlEntities(text: string): string {
	return text
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, '&')
		.trim();
}

function looksLikeElement(s: string): boolean {
	return /<[A-Za-z_]/.test(s);
}

function escapeRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
