import crypto from 'crypto';

export interface QwcConfig {
	appName: string;
	appId: string;
	appUrl: string;
	appDescription: string;
	appSupport: string;
	appUserName: string;
	ownerId: string;
	fileId: string;
	interval: number;
	isReadOnly: boolean;
	notify: boolean;
	appUniqueName: string;
}

export function generateQwcXml(config: QwcConfig): string {
	const appId = config.appId || `{${crypto.randomUUID().toUpperCase()}}`;
	const ownerId = config.ownerId || `{${crypto.randomUUID().toUpperCase()}}`;
	const fileId = config.fileId || `{${crypto.randomUUID().toUpperCase()}}`;

	return `<?xml version="1.0"?>
<QBWCXML>
  <AppName>${escapeXml(config.appName)}</AppName>
  <AppID>${escapeXml(appId)}</AppID>
  <AppURL>${escapeXml(config.appUrl)}</AppURL>
  <AppDescription>${escapeXml(config.appDescription)}</AppDescription>
  <AppSupport>${escapeXml(config.appSupport)}</AppSupport>
  <UserName>${escapeXml(config.appUserName)}</UserName>
  <OwnerID>${escapeXml(ownerId)}</OwnerID>
  <FileID>${escapeXml(fileId)}</FileID>
  <QBType>QBFS</QBType>
  <Style>Document</Style>
  <Scheduler>
    <RunEveryNMinutes>${config.interval}</RunEveryNMinutes>
  </Scheduler>
  <IsReadOnly>${config.isReadOnly}</IsReadOnly>
  <PersonalDataPref>ppdNotNeeded</PersonalDataPref>
  <Certified>Yes</Certified>
  <Notify>${config.notify}</Notify>
  <AppUniqueName>${escapeXml(config.appUniqueName || config.appName)}</AppUniqueName>
</QBWCXML>`;
}

function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
