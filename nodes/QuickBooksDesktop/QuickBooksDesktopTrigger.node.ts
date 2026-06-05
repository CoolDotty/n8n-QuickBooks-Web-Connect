import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { createSoapRouter } from './lib/soap';
import { createSession, validateTicket, closeSession } from './lib/session';
import {
	dequeueNextJob,
	completeJob,
	getJobByTicket,
	pushResponse,
	countPendingJobs,
	percentComplete,
} from './lib/queue';

export class QuickBooksDesktopTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QuickBooks Desktop Web Connect Trigger',
		name: 'quickBooksDesktopTrigger',
		icon: 'file:quickBooksDesktop.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["path"]}}',
		description: 'QuickBooks Web Connector SOAP endpoint',
		defaults: {
			name: 'QuickBooks Desktop Web Connect Trigger',
		},
		eventTriggerDescription: 'Waiting for QuickBooks Web Connector to poll',
		activationMessage:
			'You can now configure QuickBooks Web Connector to poll your production webhook URL.',
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'GET',
				responseMode: 'lastNode',
				responseData: 'firstEntryJson',
				responsePropertyName: 'body',
				responseContentType: 'text/xml',
				path: 'quickbooks-desktop',
			},
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'lastNode',
				responseData: 'firstEntryJson',
				responsePropertyName: 'body',
				responseContentType: 'text/xml',
				path: 'quickbooks-desktop',
			},
		],
		credentials: [
			{
				name: 'quickBooksDesktopApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: 'quickbooks-desktop',
				required: true,
				placeholder: 'quickbooks-desktop',
				description: 'Webhook path — the full URL is what you put in the .qwc AppURL',
			},
			{
				displayName: 'Server Version',
				name: 'serverVersion',
				type: 'string',
				default: 'QuickBooksDesktop-n8n-Bridge/0.1',
				description: 'Version string returned to QBWC on serverVersion / getServerVersion',
			},
			{
				displayName: 'Read Only',
				name: 'readOnly',
				type: 'boolean',
				default: false,
				description:
					'Whether to block write operations — when enabled, outbound jobs that modify QuickBooks data are silently dropped',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const method = req.method;

		if (method === 'GET') {
			return {
				workflowData: [this.helpers.returnJsonArray([{ body: WSDL }])],
			};
		}

		const credentials = await this.getCredentials('quickBooksDesktopApi');
		const expectedUsername = credentials.username as string;
		const expectedPassword = credentials.password as string;
		const serverVersion = this.getNodeParameter(
			'serverVersion',
			'QuickBooksDesktop-n8n-Bridge/0.1',
		) as string;
		const readOnly = this.getNodeParameter('readOnly', false) as boolean;

		// n8n body-parser may convert XML to object; try to get raw body first
		let bodyStr = '';
		const rawBody = (req as Record<string, unknown>).rawBody;
		if (typeof rawBody === 'string') {
			bodyStr = rawBody;
		} else if (Buffer.isBuffer(rawBody)) {
			bodyStr = rawBody.toString('utf-8');
		} else if (Buffer.isBuffer(req.body)) {
			bodyStr = req.body.toString('utf-8');
		} else if (typeof req.body === 'string') {
			bodyStr = req.body;
		} else if (req.body && typeof req.body === 'object') {
			// Body was parsed by middleware; try to get raw via rawBody or fallback
			bodyStr =
				((req as Record<string, unknown>).rawBody as Buffer | undefined)?.toString?.('utf-8') ?? '';
		}

		const MAX_BODY_SIZE = 1024 * 1024; // 1 MB
		if (Buffer.byteLength(bodyStr, 'utf-8') > MAX_BODY_SIZE) {
			throw new NodeOperationError(this.getNode(), 'Request body exceeds 1 MB limit');
		}

		let parsedOperation = '';
		let parsedArgs: Record<string, unknown> = {};

		const handlers = buildHandlers({
			expectedUsername,
			expectedPassword,
			serverVersion,
			readOnly,
			onOperation(op, args) {
				parsedOperation = op;
				parsedArgs = args;
			},
		});

		const router = createSoapRouter(handlers);
		const response = await router.handle(bodyStr);

		const result: IWebhookResponseData = {
			workflowData: [this.helpers.returnJsonArray([{ body: response }])],
		};

		if (parsedOperation === 'receiveResponseXML') {
			const ticket = parsedArgs.ticket as string;
			const responseXml = (parsedArgs.response as string) ?? '';
			const hresult = (parsedArgs.hresult as string) ?? '';
			const message = (parsedArgs.message as string) ?? '';

			const job = getJobByTicket(ticket);

			const workflowItem: IDataObject = {
				body: response,
				operation: 'receiveResponseXML',
				ticket,
				hresult,
				message,
				responseXml,
				jobId: job?.id ?? null,
				qbxml: job?.qbxml ?? null,
				timestamp: new Date().toISOString(),
			};

			result.workflowData = [this.helpers.returnJsonArray([workflowItem])];
		}

		return result;
	}

	webhookMethods = {
		default: {
			checkExists: async function (this: IHookFunctions): Promise<boolean> {
				return false;
			},
			create: async function (this: IHookFunctions): Promise<boolean> {
				return true;
			},
			delete: async function (this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};
}

// ---------------------------------------------------------------------------
// QuickBooks Web Connector SOAP method handlers
// ---------------------------------------------------------------------------

interface HandlerContext {
	expectedUsername: string;
	expectedPassword: string;
	serverVersion: string;
	readOnly: boolean;
	onOperation: (op: string, args: Record<string, unknown>) => void;
}

type SoapHandler = (args: Record<string, unknown>) => Promise<Record<string, unknown>>;

function buildHandlers(ctx: HandlerContext): Record<string, SoapHandler> {
	return {
		async serverVersion() {
			return { serverVersionResult: ctx.serverVersion };
		},

		async getServerVersion() {
			return { getServerVersionResult: ctx.serverVersion };
		},

		async clientVersion() {
			return { clientVersionResult: '' };
		},

		async authenticate(args) {
			const username = args.strUserName as string;
			const password = args.strPassword as string;

			if (username !== ctx.expectedUsername || password !== ctx.expectedPassword) {
				return { authenticateResult: ['', 'nvu', '', ''] };
			}

			const session = createSession('default', 60);
			return { authenticateResult: [session.ticket, '', '', ''] };
		},

		async sendRequestXML(args) {
			const ticket = args.ticket as string;
			const session = validateTicket(ticket);
			if (!session) {
				return { sendRequestXMLResult: '' };
			}

			const job = dequeueNextJob(ticket, ctx.readOnly);
			if (!job) {
				return { sendRequestXMLResult: '' };
			}

			return { sendRequestXMLResult: job.qbxml };
		},

		async receiveResponseXML(args) {
			const ticket = args.ticket as string;
			const responseXml = (args.response as string) ?? '';
			const hresult = (args.hresult as string) ?? '';
			const message = (args.message as string) ?? '';

			ctx.onOperation('receiveResponseXML', { ticket, response: responseXml, hresult, message });

			const session = validateTicket(ticket);
			if (!session) {
				return { receiveResponseXMLResult: -1 };
			}

			const job = getJobByTicket(ticket);

			if (hresult && hresult !== '0') {
				if (job) {
					completeJob(job.id, responseXml, hresult, message);
				}
				pushResponse({
					jobId: job?.id ?? '',
					hresult,
					message,
					responseXml,
					timestamp: Date.now(),
				});
				return { receiveResponseXMLResult: -1 };
			}

			if (job) {
				completeJob(job.id, responseXml, hresult, message);
			}

			pushResponse({
				jobId: job?.id ?? '',
				hresult,
				message,
				responseXml,
				timestamp: Date.now(),
			});

			const remaining = countPendingJobs(ctx.readOnly);
			const pct = remaining > 0 ? percentComplete(ticket) : 0;

			return { receiveResponseXMLResult: pct };
		},

		async getLastError(args) {
			const ticket = args.ticket as string;
			const session = validateTicket(ticket);
			if (!session) {
				return { getLastErrorResult: 'Session not found or expired' };
			}
			return { getLastErrorResult: '' };
		},

		async closeConnection(args) {
			const ticket = args.ticket as string;
			closeSession(ticket);
			return { closeConnectionResult: 'OK' };
		},

		async connectionError(args) {
			const ticket = args.ticket as string;
			closeSession(ticket);
			return { connectionErrorResult: 'C:\\' };
		},

		async getInteractiveURL() {
			return { getInteractiveURLResult: '' };
		},

		async interactiveDone() {
			return { interactiveDoneResult: '' };
		},

		async interactiveRejected() {
			return { interactiveRejectedResult: '' };
		},
	};
}

// ---------------------------------------------------------------------------
// WSDL — served on GET so QBWC can discover the service contract
// ---------------------------------------------------------------------------

const WSDL = `<?xml version="1.0" encoding="utf-8"?>
<wsdl:definitions xmlns:s="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:tns="http://developer.intuit.com/"
  targetNamespace="http://developer.intuit.com/"
  xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">

  <wsdl:types>
    <s:schema elementFormDefault="qualified" targetNamespace="http://developer.intuit.com/">
      <s:element name="serverVersion"><s:complexType /></s:element>
      <s:element name="serverVersionResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="serverVersionResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="clientVersion"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="strVersion" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="clientVersionResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="clientVersionResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="authenticate"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="strUserName" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="strPassword" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="authenticateResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="authenticateResult" type="tns:ArrayOfString" /></s:sequence></s:complexType></s:element>
      <s:complexType name="ArrayOfString"><s:sequence><s:element minOccurs="0" maxOccurs="unbounded" name="string" nillable="true" type="s:string" /></s:sequence></s:complexType>
      <s:element name="sendRequestXML"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="ticket" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="strHCPResponse" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="strCompanyFileName" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="qbXMLCountry" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="qbXMLMajorVers" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="qbXMLMinorVers" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="sendRequestXMLResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="sendRequestXMLResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="receiveResponseXML"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="ticket" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="response" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="hresult" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="message" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="receiveResponseXMLResponse"><s:complexType><s:sequence><s:element minOccurs="1" maxOccurs="1" name="receiveResponseXMLResult" type="s:int" /></s:sequence></s:complexType></s:element>
      <s:element name="getLastError"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="ticket" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="getLastErrorResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="getLastErrorResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="closeConnection"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="ticket" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="closeConnectionResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="closeConnectionResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="getServerVersion"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="ticket" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="getServerVersionResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="getServerVersionResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="connectionError"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="ticket" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="hresult" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="message" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="connectionErrorResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="connectionErrorResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="getInteractiveURL"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="wcTicket" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="getInteractiveURLResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="getInteractiveURLResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="interactiveDone"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="wcTicket" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="interactiveDoneResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="interactiveDoneResult" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="interactiveRejected"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="wcTicket" type="s:string" /><s:element minOccurs="0" maxOccurs="1" name="reason" type="s:string" /></s:sequence></s:complexType></s:element>
      <s:element name="interactiveRejectedResponse"><s:complexType><s:sequence><s:element minOccurs="0" maxOccurs="1" name="interactiveRejectedResult" type="s:string" /></s:sequence></s:complexType></s:element>
    </s:schema>
  </wsdl:types>

  <wsdl:message name="serverVersionSoapIn"><wsdl:part name="parameters" element="tns:serverVersion" /></wsdl:message>
  <wsdl:message name="serverVersionSoapOut"><wsdl:part name="parameters" element="tns:serverVersionResponse" /></wsdl:message>
  <wsdl:message name="clientVersionSoapIn"><wsdl:part name="parameters" element="tns:clientVersion" /></wsdl:message>
  <wsdl:message name="clientVersionSoapOut"><wsdl:part name="parameters" element="tns:clientVersionResponse" /></wsdl:message>
  <wsdl:message name="authenticateSoapIn"><wsdl:part name="parameters" element="tns:authenticate" /></wsdl:message>
  <wsdl:message name="authenticateSoapOut"><wsdl:part name="parameters" element="tns:authenticateResponse" /></wsdl:message>
  <wsdl:message name="sendRequestXMLSoapIn"><wsdl:part name="parameters" element="tns:sendRequestXML" /></wsdl:message>
  <wsdl:message name="sendRequestXMLSoapOut"><wsdl:part name="parameters" element="tns:sendRequestXMLResponse" /></wsdl:message>
  <wsdl:message name="receiveResponseXMLSoapIn"><wsdl:part name="parameters" element="tns:receiveResponseXML" /></wsdl:message>
  <wsdl:message name="receiveResponseXMLSoapOut"><wsdl:part name="parameters" element="tns:receiveResponseXMLResponse" /></wsdl:message>
  <wsdl:message name="getLastErrorSoapIn"><wsdl:part name="parameters" element="tns:getLastError" /></wsdl:message>
  <wsdl:message name="getLastErrorSoapOut"><wsdl:part name="parameters" element="tns:getLastErrorResponse" /></wsdl:message>
  <wsdl:message name="closeConnectionSoapIn"><wsdl:part name="parameters" element="tns:closeConnection" /></wsdl:message>
  <wsdl:message name="closeConnectionSoapOut"><wsdl:part name="parameters" element="tns:closeConnectionResponse" /></wsdl:message>
  <wsdl:message name="getServerVersionSoapIn"><wsdl:part name="parameters" element="tns:getServerVersion" /></wsdl:message>
  <wsdl:message name="getServerVersionSoapOut"><wsdl:part name="parameters" element="tns:getServerVersionResponse" /></wsdl:message>
  <wsdl:message name="connectionErrorSoapIn"><wsdl:part name="parameters" element="tns:connectionError" /></wsdl:message>
  <wsdl:message name="connectionErrorSoapOut"><wsdl:part name="parameters" element="tns:connectionErrorResponse" /></wsdl:message>
  <wsdl:message name="getInteractiveURLSoapIn"><wsdl:part name="parameters" element="tns:getInteractiveURL" /></wsdl:message>
  <wsdl:message name="getInteractiveURLSoapOut"><wsdl:part name="parameters" element="tns:getInteractiveURLResponse" /></wsdl:message>
  <wsdl:message name="interactiveDoneSoapIn"><wsdl:part name="parameters" element="tns:interactiveDone" /></wsdl:message>
  <wsdl:message name="interactiveDoneSoapOut"><wsdl:part name="parameters" element="tns:interactiveDoneResponse" /></wsdl:message>
  <wsdl:message name="interactiveRejectedSoapIn"><wsdl:part name="parameters" element="tns:interactiveRejected" /></wsdl:message>
  <wsdl:message name="interactiveRejectedSoapOut"><wsdl:part name="parameters" element="tns:interactiveRejectedResponse" /></wsdl:message>

  <wsdl:portType name="QBWebConnectorSvcSoap">
    <wsdl:operation name="serverVersion"><wsdl:input message="tns:serverVersionSoapIn" /><wsdl:output message="tns:serverVersionSoapOut" /></wsdl:operation>
    <wsdl:operation name="clientVersion"><wsdl:input message="tns:clientVersionSoapIn" /><wsdl:output message="tns:clientVersionSoapOut" /></wsdl:operation>
    <wsdl:operation name="authenticate"><wsdl:input message="tns:authenticateSoapIn" /><wsdl:output message="tns:authenticateSoapOut" /></wsdl:operation>
    <wsdl:operation name="sendRequestXML"><wsdl:input message="tns:sendRequestXMLSoapIn" /><wsdl:output message="tns:sendRequestXMLSoapOut" /></wsdl:operation>
    <wsdl:operation name="receiveResponseXML"><wsdl:input message="tns:receiveResponseXMLSoapIn" /><wsdl:output message="tns:receiveResponseXMLSoapOut" /></wsdl:operation>
    <wsdl:operation name="getLastError"><wsdl:input message="tns:getLastErrorSoapIn" /><wsdl:output message="tns:getLastErrorSoapOut" /></wsdl:operation>
    <wsdl:operation name="closeConnection"><wsdl:input message="tns:closeConnectionSoapIn" /><wsdl:output message="tns:closeConnectionSoapOut" /></wsdl:operation>
    <wsdl:operation name="getServerVersion"><wsdl:input message="tns:getServerVersionSoapIn" /><wsdl:output message="tns:getServerVersionSoapOut" /></wsdl:operation>
    <wsdl:operation name="connectionError"><wsdl:input message="tns:connectionErrorSoapIn" /><wsdl:output message="tns:connectionErrorSoapOut" /></wsdl:operation>
    <wsdl:operation name="getInteractiveURL"><wsdl:input message="tns:getInteractiveURLSoapIn" /><wsdl:output message="tns:getInteractiveURLSoapOut" /></wsdl:operation>
    <wsdl:operation name="interactiveDone"><wsdl:input message="tns:interactiveDoneSoapIn" /><wsdl:output message="tns:interactiveDoneSoapOut" /></wsdl:operation>
    <wsdl:operation name="interactiveRejected"><wsdl:input message="tns:interactiveRejectedSoapIn" /><wsdl:output message="tns:interactiveRejectedSoapOut" /></wsdl:operation>
  </wsdl:portType>

  <wsdl:binding name="QBWebConnectorSvcSoap" type="tns:QBWebConnectorSvcSoap">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http" />
    <wsdl:operation name="serverVersion"><soap:operation soapAction="http://developer.intuit.com/serverVersion" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="clientVersion"><soap:operation soapAction="http://developer.intuit.com/clientVersion" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="authenticate"><soap:operation soapAction="http://developer.intuit.com/authenticate" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="sendRequestXML"><soap:operation soapAction="http://developer.intuit.com/sendRequestXML" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="receiveResponseXML"><soap:operation soapAction="http://developer.intuit.com/receiveResponseXML" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="getLastError"><soap:operation soapAction="http://developer.intuit.com/getLastError" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="closeConnection"><soap:operation soapAction="http://developer.intuit.com/closeConnection" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="getServerVersion"><soap:operation soapAction="http://developer.intuit.com/getServerVersion" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="connectionError"><soap:operation soapAction="http://developer.intuit.com/connectionError" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="getInteractiveURL"><soap:operation soapAction="http://developer.intuit.com/getInteractiveURL" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="interactiveDone"><soap:operation soapAction="http://developer.intuit.com/interactiveDone" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
    <wsdl:operation name="interactiveRejected"><soap:operation soapAction="http://developer.intuit.com/interactiveRejected" style="document" /><wsdl:input><soap:body use="literal" /></wsdl:input><wsdl:output><soap:body use="literal" /></wsdl:output></wsdl:operation>
  </wsdl:binding>

  <wsdl:service name="QBWebConnectorSvc">
    <wsdl:port name="QBWebConnectorSvcSoap" binding="tns:QBWebConnectorSvcSoap">
      <soap:address location="REPLACE_WITH_PUBLIC_URL" />
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>`;
