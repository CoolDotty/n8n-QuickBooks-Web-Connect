import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError, NodeApiError } from 'n8n-workflow';
import { enqueueJob, getJob, countPendingJobs } from './lib/queue';
import { generateQwcXml } from './lib/qwc';

export class QuickBooksDesktop implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QuickBooks Desktop Web Connect',
		name: 'quickBooksDesktop',
		icon: 'file:quickBooksDesktop.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with QuickBooks Web Connector job queue',
		defaults: {
			name: 'QuickBooks Desktop Web Connect',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'quickBooksDesktopApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Job', value: 'job' },
					{ name: 'QWC Config', value: 'qwcConfig' },
				],
				default: 'job',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['job'],
					},
				},
				options: [
					{
						name: 'Enqueue',
						value: 'enqueue',
						description: 'Add a QBXML job to the queue',
						action: 'Enqueue a QBXML job',
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get the status of a queued job',
						action: 'Get job status',
					},
					{
						name: 'List Pending',
						value: 'listPending',
						description: 'Count pending jobs in the queue',
						action: 'List pending jobs',
					},
				],
				default: 'enqueue',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['qwcConfig'],
					},
				},
				options: [
					{
						name: 'Generate',
						value: 'generate',
						description: 'Generate a .qwc configuration file for QuickBooks Web Connector',
						action: 'Generate QWC config',
					},
				],
				default: 'generate',
			},
			{
				displayName: 'QBXML',
				name: 'qbxml',
				type: 'string',
				typeOptions: {
					rows: 8,
				},
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['enqueue'],
					},
				},
				description: 'The QBXML request to send to QuickBooks',
			},
			{
				displayName: 'Read Only',
				name: 'jobReadOnly',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['enqueue'],
					},
				},
				description:
					'Whether this job only reads data (will be allowed even when the trigger is in read-only mode)',
			},
			{
				displayName: 'Priority',
				name: 'jobPriority',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['enqueue'],
					},
				},
				description: 'Higher priority jobs are dequeued first',
			},
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['getStatus'],
					},
				},
				description: 'The ID of the job to check',
			},
			{
				displayName: 'App Name',
				name: 'appName',
				type: 'string',
				required: true,
				default: 'n8n QuickBooks Desktop Bridge',
				displayOptions: {
					show: {
						resource: ['qwcConfig'],
						operation: ['generate'],
					},
				},
				description: 'Name shown in QuickBooks Web Connector',
			},
			{
				displayName: 'App URL',
				name: 'appUrl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://your-n8n.example.com/webhook/quickbooks-desktop',
				displayOptions: {
					show: {
						resource: ['qwcConfig'],
						operation: ['generate'],
					},
				},
				description: 'The full webhook URL from the QuickBooks Desktop Web Connect Trigger node',
			},
			{
				displayName: 'App Description',
				name: 'appDescription',
				type: 'string',
				default: 'n8n QuickBooks Desktop Web Connect Bridge',
				displayOptions: {
					show: {
						resource: ['qwcConfig'],
						operation: ['generate'],
					},
				},
			},
			{
				displayName: 'App Support URL',
				name: 'appSupport',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['qwcConfig'],
						operation: ['generate'],
					},
				},
				description: 'Support URL shown in QBWC (optional)',
			},
			{
				displayName: 'Interval (Minutes)',
				name: 'interval',
				type: 'number',
				default: 5,
				displayOptions: {
					show: {
						resource: ['qwcConfig'],
						operation: ['generate'],
					},
				},
				description: 'How often QBWC should poll for new jobs',
			},
			{
				displayName: 'Read Only',
				name: 'configReadOnly',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['qwcConfig'],
						operation: ['generate'],
					},
				},
				description: 'Whether QBWC should only perform read operations',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const MAX_QBXML_LENGTH = 10 * 1024 * 1024;
		const MAX_JOB_ID_LENGTH = 64;
		const MAX_STRING_LENGTH = 1024;
		const MAX_URL_LENGTH = 2048;

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: IDataObject = {};

				if (resource === 'job') {
					if (operation === 'enqueue') {
						const qbxml = this.getNodeParameter('qbxml', i) as string;
						if (qbxml.length > MAX_QBXML_LENGTH) {
							throw new NodeOperationError(
								this.getNode(),
								'QBXML exceeds maximum length of 10 MB',
								{ itemIndex: i },
							);
						}
						const readOnly = this.getNodeParameter('jobReadOnly', i) as boolean;
						const priority = this.getNodeParameter('jobPriority', i) as number;

						const job = enqueueJob({ qbxml, readOnly, priority });
						responseData = {
							jobId: job.id,
							status: job.status,
							readOnly: job.readOnly,
							priority: job.priority,
							createdAt: new Date(job.createdAt).toISOString(),
						};
					} else if (operation === 'getStatus') {
						const jobId = this.getNodeParameter('jobId', i) as string;
						if (jobId.length > MAX_JOB_ID_LENGTH) {
							throw new NodeOperationError(
								this.getNode(),
								'Job ID exceeds maximum length of 64 characters',
								{ itemIndex: i },
							);
						}
						const job = getJob(jobId);
						if (!job) {
							throw new NodeOperationError(this.getNode(), `Job not found: ${jobId}`, {
								itemIndex: i,
							});
						}
						responseData = {
							jobId: job.id,
							status: job.status,
							qbxml: job.qbxml,
							readOnly: job.readOnly,
							priority: job.priority,
							responseXml: job.responseXml ?? null,
							hresult: job.hresult ?? null,
							message: job.message ?? null,
							createdAt: new Date(job.createdAt).toISOString(),
							updatedAt: new Date(job.updatedAt).toISOString(),
						};
					} else if (operation === 'listPending') {
						const count = countPendingJobs();
						responseData = { pendingCount: count };
					}
				} else if (resource === 'qwcConfig') {
					if (operation === 'generate') {
						const credentials = await this.getCredentials('quickBooksDesktopApi');
						const appName = this.getNodeParameter('appName', i) as string;
						const appUrl = this.getNodeParameter('appUrl', i) as string;
						const appDescription = this.getNodeParameter('appDescription', i) as string;
						const appSupport = this.getNodeParameter('appSupport', i) as string;
						if (appName.length > MAX_STRING_LENGTH) {
							throw new NodeOperationError(
								this.getNode(),
								'App Name exceeds maximum length of 1024 characters',
								{ itemIndex: i },
							);
						}
						if (appUrl.length > MAX_URL_LENGTH) {
							throw new NodeOperationError(
								this.getNode(),
								'App URL exceeds maximum length of 2048 characters',
								{ itemIndex: i },
							);
						}
						if (appDescription.length > MAX_STRING_LENGTH) {
							throw new NodeOperationError(
								this.getNode(),
								'App Description exceeds maximum length of 1024 characters',
								{ itemIndex: i },
							);
						}
						if (appSupport.length > MAX_URL_LENGTH) {
							throw new NodeOperationError(
								this.getNode(),
								'App Support URL exceeds maximum length of 2048 characters',
								{ itemIndex: i },
							);
						}
						const interval = this.getNodeParameter('interval', i) as number;
						const configReadOnly = this.getNodeParameter('configReadOnly', i) as boolean;

						const qwcXml = generateQwcXml({
							appName,
							appId: '',
							appUrl,
							appDescription,
							appSupport,
							appUserName: credentials.username as string,
							ownerId: '',
							fileId: '',
							interval,
							isReadOnly: configReadOnly,
							notify: true,
							appUniqueName: appName.replace(/\s+/g, '_'),
						});

						responseData = {
							qwcXml,
							filename: `${appName.replace(/\s+/g, '_')}.qwc`,
						};
					}
				}

				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
				}
				throw new NodeApiError(this.getNode(), error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
