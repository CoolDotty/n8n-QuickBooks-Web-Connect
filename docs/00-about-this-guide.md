## Who Should Read This Guide
## ABOUT THIS GUIDE
This Programmer’s Guide describes the integration of QuickBooks and QuickBooks POS
with web services via the QuickBooks Web Connector (QBWC) application. The purpose
of this guide is to provide the details you need to know in order to successfully create a web
service that talks to QuickBooks or QuickBooks POS.
In this guide, the examples are in C-sharp.
## Who Should Read This Guide
This guide is for developers who are creating web service applications that integrate with
## QBWC.
In order to create the web service, we assume you are familiar with the platform you are
developing for and the language you are using to program in. You should also know a little
about SOAP, about XML and how to build an XML document.
## Before You Begin
Be sure to familiarize yourself with the material contained in the Onscreen Reference for
QuickBooks and for QuickBooks POS, which contains the qbXML and qbposXML syntax
for each request and response message type.
What’s New in This Release
The following improvements have been made to QBWC 2.0:
•Support for interactive mode:
>Protocol Handler for Internet Explorer that allows web-based applications to
interact directly with the web connector.
>Three new optional web methods to facilitate Interactive mode:
-InteractiveURL
-InteractiveRejected
-isInteractiveDone
•Masterkeys are now handled and maintained automatically by .NET managed password
storage mechanism.
•Update locking mechanism to help manage company file during simultaneous updates
from multiple web connector clients.
•Included VERBOSE mode for logging level. With this, we now have three log levels:
## NONE =
No logging, DEBUG (default setting) = Logging + first 50 characters
of
request/response xml, VERBOSE = Logging + complete request/response xml

8About This Guide
(c) 2022 Intuit    Inc.   All   rights     reserved.
•Added a response value of an O: (stands for Okay)
O:<QBWC_Version_Supported_By_Server> for clientVersion(). It provides an update
path for user if server’s QBWCVersion is greater than user’s QBWCVersion
•NoOp for sendRequestXML(). When sendRequestXML() call receives an empty string,
QBWC calls getLastError(). If a NOOP is sent back from web-service for the
getLastError(), QBWC will pause update for 5 seconds. This allows a web-service to
tell QBWC to wait five seconds before calling sendRequestXML() again.
•New webmethod getServerVersion() provides a way for web-service to notify QBWC
of itís version. This version string shows up in the More Information pop-up dialog in
## QBWC.
•Notification (system tray pop up) is now turned off by default.
•A new optional QWC parameter <CertURL> to provide means to provide certificate
server for ssl certificates other than web server.
•A new optional QWC parameter <Notify> introduced. Value of true will enable
notification (pop up at systray) at app level. Anything else will disable notification.
•- A new optional QWC parameter <AppDisplayName> is introduced. If available,
QBWC will use this to display name in the QBWC UI. Otherwise, use <AppName> as
usual. This is just for UI purpose. Update process still uses the <AppName> (or,
AppUniqueName if provided)
•A new optional parameter <AppUniqueName> is introduced. If this element is
available in QWC file, QBWC will not go into itís typical clone/replace mode for
AppName and directly use the replace routine.
•There are new optional QWC file parameters for three rp.AuthPreferences parameters
IsReadOnly (true/false), UnattendedModePref (umpRequired/umpOptional), and
PersonalDataPref(pdpNotNeeded/pdpOptional/pdpRequired).
•Improved performance due to code refactoring.
•Improved error messages with suggestions on actions where applicable.

QuickBooks Supported by QBWC 9
(c) 2022 Intuit    Inc.   All   rights reserved.
