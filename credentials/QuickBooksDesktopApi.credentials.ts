import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class QuickBooksDesktopApi implements ICredentialType {
	name = 'quickBooksDesktopApi';

	displayName = 'QuickBooks Desktop Web Connect API';

	icon = { light: 'file:../nodes/QuickBooksDesktop/quickBooksDesktop.svg', dark: 'file:../nodes/QuickBooksDesktop/quickBooksDesktop.dark.svg' } as const;

	documentationUrl = 'https://github.com/CoolDotty/n8n-QuickBooks-Web-Connect';

	properties: INodeProperties[] = [
		{
			displayName: 'Server Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'https://n8n.example.com',
			description: 'The public base URL of this n8n instance (used for credential testing)',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: 'Username that QBWC will send during authentication',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Password that QBWC will send during authentication',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/',
			method: 'GET',
		},
	};
}
