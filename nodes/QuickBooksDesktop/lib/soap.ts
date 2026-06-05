/**
 * Hand-rolled SOAP 1.1 router for the QuickBooks Desktop Web Connect bridge.
 *
 * Replaces the `soap` npm library which has known issues serializing
 * doc/literal responses that reference complexType sequences like
 * tns:ArrayOfString — Intuit's reference server uses this exact pattern
 * and the `soap` lib returned an empty <soap:Body/>. QuickBooks Web Connector then raised
 * a NullReferenceException internally ("Object reference not set to an
 * instance of an object", aka QBWC2012).
 *
 * We parse the incoming SOAP envelope, extract the operation name and
 * its child parameters, dispatch to the matching handler, then serialize
 * the response with explicit XML templates that match the WSDL exactly.
 *
 * Uses a small dependency-free XML parser instead of xml2js so the package
 * stays n8n-Cloud compatible (no runtime dependencies allowed).
 */

const TNS = 'http://developer.intuit.com/';

type Handler = (args: Record<string, unknown>) => Promise<unknown>;

export interface SoapRouter {
	handle(xml: string): Promise<string>;
}

interface ParsedRequest {
	operation: string;
	args: Record<string, unknown>;
}

export function createSoapRouter(handlers: Record<string, Handler>): SoapRouter {
	return {
		async handle(xml: string): Promise<string> {
			let parsed: ParsedRequest;
			try {
				parsed = parseRequest(xml);
			} catch {
				return soapFault('Client', 'Malformed SOAP request');
			}

			const handler = handlers[parsed.operation];
			if (!handler) {
				return soapFault('Client', `Unknown operation: ${parsed.operation}`);
			}

			let result: unknown;
			try {
				result = await handler(parsed.args);
			} catch (err) {
				const msg = (err as Error).message;
				return soapFault('Server', msg);
			}

			return serializeResponse(parsed.operation, result);
		},
	};
}

function parseRequest(xml: string): ParsedRequest {
	const cleaned = xml.replace(/^\uFEFF/, '').trim();
	const bodyMatch = cleaned.match(/<(?:\w+:)?Body[^>]*>([\s\S]*?)<\/(?:\w+:)?Body>/i);
	if (!bodyMatch) throw new Error('No Body');
	const bodyContent = bodyMatch[1];

	const opMatch = bodyContent.match(/<([A-Za-z_][\w:]*)\b[^>]*>([\s\S]*?)<\/\1>/);
	if (!opMatch) throw new Error('No operation element in Body');

	const operationFull = opMatch[1];
	const innerXml = opMatch[2];
	const operation = stripPrefix(operationFull);

	const args = parseArgs(innerXml);
	return { operation, args };
}

function parseArgs(innerXml: string): Record<string, unknown> {
	const args: Record<string, unknown> = {};
	const re = /<([A-Za-z_][\w:]*)\b[^>]*>([\s\S]*?)<\/\1>/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(innerXml)) !== null) {
		const key = stripPrefix(m[1]);
		const raw = m[2];
		if (looksLikeElement(raw)) {
			args[key] = parseArgs(raw);
		} else {
			args[key] = decodeXmlEntities(raw);
		}
	}
	return args;
}

function looksLikeElement(s: string): boolean {
	return /<[A-Za-z_]/.test(s);
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

function stripPrefix(name: string): string {
	const idx = name.indexOf(':');
	return idx >= 0 ? name.slice(idx + 1) : name;
}

function serializeResponse(operation: string, result: unknown): string {
	const responseName = `${operation}Response`;
	const payload = renderPayload(operation, result);
	return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <${responseName} xmlns="${TNS}">${payload}</${responseName}>
  </soap:Body>
</soap:Envelope>`;
}

function renderPayload(operation: string, result: unknown): string {
	if (result == null || typeof result !== 'object') {
		return `<tns:${operation}Result/>`;
	}
	const obj = result as Record<string, unknown>;

	if (operation === 'authenticate') {
		const arr = (obj.authenticateResult as unknown[]) ?? [];
		const items = arr
			.map((v) => `<string>${escapeXml(typeof v === 'string' ? v : String(v ?? ''))}</string>`)
			.join('');
		return `<authenticateResult>${items}</authenticateResult>`;
	}

	if (operation === 'receiveResponseXML') {
		const v = obj.receiveResponseXMLResult;
		return `<receiveResponseXMLResult>${escapeXml(String(v ?? '0'))}</receiveResponseXMLResult>`;
	}

	for (const suffix of ['Result']) {
		const key = `${operation}${suffix}`;
		if (key in obj) {
			const v = obj[key];
			return `<${key}>${escapeXml(typeof v === 'string' ? v : String(v ?? ''))}</${key}>`;
		}
	}

	return '';
}

function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function soapFault(code: string, message: string): string {
	return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:${code}</faultcode>
      <faultstring>${escapeXml(message)}</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;
}
