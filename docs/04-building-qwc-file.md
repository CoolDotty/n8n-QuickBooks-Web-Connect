# Chapter 4: Building the QWC File for Your Users
Once your users find out about your web service and subscribe to it, they need to add it to
their QB web connector so the web connector can access it on behalf of their QuickBooks
or QuickBooks POS company. This assumes your user has already downloaded and
installed the QB web connector! (See Chapter 7, “Understanding the End-User Experience
and Setup.”)
How do your customers add your web service to their web connector? All they need to do is
download your QWC file in any way you choose, including from your web application, and
open it by double-clicking on it or by clicking Add an Application in the web connector UI
(see Figure 4-1). The QWC file contains all of the connection information the web
connector needs to connect to your web service, except the user password for your web
service. Opening the QWC file automatically loads the QWC data into the web connector.
This chapter tells how to build the QWC file so it performs all this magic transparently for
your user. It describes the required and optional content of the QWC file.
A Sample QWC File
Listing 4-1 shows a typical QWC file. This one happens to be used by the sample web
service (WCWebService ) provided with the QB SDK.
_______ Listing 4-1   Sample QWC File
<?xml version="1.0"?>
## <QBWCXML>
<AppName>WCWebService1</AppName>
<AppID></AppID>
<AppURL>http://localhost/WCWebService/WCWebService.asmx</AppURL>
<AppDescription>A short description for WCWebService1</AppDescription>
<AppSupport>http://developer.intuit.com</AppSupport>
<UserName>iqbal1</UserName>
<OwnerID>{57F3B9B1-86F1-4fcc-B1EE-566DE1813D20}</OwnerID>
<FileID>{90A44FB5-33D9-4815-AC85-BC87A7E7D1EB}</FileID>
<QBType>QBFS</QBType>
<Scheduler>
<RunEveryNMinutes>2</RunEveryNMinutes>
</Scheduler>
## </QBWCXML>

34Chapter 4: Building The QWC File for Your Users
(c) 2022 Intuit Inc.   All rights reserved.
In the QWC file above, notice that the root document element is <QBWCXML>
(QuickBooks Web Connector XML) and within it are all of the required fields, along with
one optional aggregate, <Scheduler>, which we provided just so you could see how to build
that particular aggregate.All of these fields, and other optional fields are described in Table
## 4-1.
How Do I Set the QBWCXML Fields in the QWC File?
Table 4-1 shows the required and optional qbwcXML tags in the QWC and describes how
to set the values for these.

A Sample QWC File 35
(c) 2022    Intuit Inc. All rights reserved.
Table 4-1qbwcXML Tags
qbwcXML ElementRequired?Description
AppDescriptionYThis brief description of the application is displayed in the QB web
connector (in the authorization dialog and in the main QBWC form
under the application name. For best results we recommend a
maximum description size of 80 characters.
AppDisplayNameNQBWC will use this to display name in the QBWC UI. Otherwise, use
<AppName> as usual. This is just for UI purpose. Update process
still uses the <AppName> (or, AppUniqueName if provided).
AppIDY, but can
be empty
The AppID of the application, supplied in the call to OpenConnection.
Currently QB and QB POS don’t do much with the AppID, so you can
supply the tag without supplying any value for it. However, you can
supply an AppID value here if you want.
AppName
YThe name of the application visible to the user. This name is
displayed in the QB web connector. It is also the name supplied in
the SDK OpenConnection call to QuickBooks or QuickBooks POS.
AppSupportYThe URL where your user can go to get support for your application.
(Do not specify an Intuit site!)
The domain name used in the AppSupport URL must match the
domain name used in the AppURL.
For internal development and testing only, you can specify localhost
or a machine name in place of the domain name. If you specify a
machine name, the machine name used for AppSupport must match
the machine name used for AppURL.
AppUniqueNameNIf this element is available in QWC file, QBWC will not go into it’s
typical clone/replace mode for AppName and directly use the replace
routine.
AppURLYThe URL of your web service. The domain name used in the
AppSupport URL must match the domain name used in the AppURL.
For internal development and testing only, you can specify localhost
or a machine name in place of the domain name. If you specify a
machine name, the machine name used for AppSupport must match
the machine name used for AppURL.
Unless you are using localhost (for development and testing only!)
the domain name specified in AppSupport and in AppURL must
match.
To maintain a secure exchange of financial data, your AppURL must
use the HTTP protocol over SSL (https://...). If you don’t use HTTPS,
the web connector won’t connect with your web service.

36Chapter 4: Building The QWC File for Your Users
(c) 2022 Intuit Inc.   All rights reserved.
AuthFlagsN
This element is used only for QuickBooks (QBType=QBFS). It
specifies which QuickBooks editions are supported by your web
service. By default, all editions are supported, including Simple Start
edition.
If you set this to exclude some QuickBooks edition, and QBWC
attempts to connect to that excluded edition, there will be a
connection error.
Here are the values you can supply for <AuthFlags>:
0x0 (All, default)
0x1 (SupportQBSimpleStart)
0x2 (SupportQBPro)
0x4 (SupportQBPremier)
0x8 (SupportQBEnterprise)
If you want to support several editions but not all, you can AND the
values for the editions you want to support.
FileIDY
FileID - the Web Connector stores this as an extension to the
company record with a specific OwnerID known only to your web
service (see below in the table for information on OwnerID) the first
time the Web Connector connects to the company. The point is to
ensure that your web service knows it is talking to the file it has
always talked to. The OwnerID value is specific to only your web
service.
If you were to do a CompanyQuery, specifying your web service’s
OwnerID value in the query in the OwnerID query field, you would
see something like this somewhere in the Ret:
<DataExtRet>
<OwnerID>{59028731-65dc-11db-bd13-0800200c9a66}
</OwnerID>
<DataExtName>FileID</DataExtName>
<DataExtType>STR255TYPE</DataExtType>
<DataExtValue>{72832751-65dc-11db-bd13-0800200c9a66}
</DataExtValue>
</DataExtRet>
Notice that the name of this data ext is “FileID” and that the value of
this data ext is the GUID that is your web service OwnerID.
If a company file is accessed by 10 different web services, there
would be 10 FileID data exts returned in the company query, each
with a different DataExtValue.
IsReadOnlyUsed to inform QBXMLRP2 (request processor) whether your service
is reading data only, or is also writing data to the company. Specify
true if write access is needed, or false if not.
NotifyNValue of true will enable notification (pop up at systray) at app level.
Anything else will disable notification.
qbwcXML ElementRequired?Description

A Sample QWC File 37
(c) 2022    Intuit Inc. All rights reserved.
OwnerIDYThis is a GUID that represents your application or suite of
applications, if your application needs to store private data in the
company file for one reason or another. One of the most common
uses is to check (via a QuickBooks SDK CompanyQuery request)
whether you have communicated with this company file before, and
possibly some data about that communication.
You should generate one GUID per application only and not per
application version or per QWC file!
This private data will be visible to any application that knows the
OwnerID.
(See the QB SDK Programmer’s Guide for more information on data
extensions and OwnerID.)
PersonalDataPrefNUsed to inform QBXMLRP2 (request processor) whether your service
requires access to personal/sensitive data. Specify pdpNotNeeded/
pdpOptional if it does not, and pdpRequired if it does.
QBTypeYSpecify the value QBFS if your web service is designed for use with
QuickBooks Financial software.
Specify the value QBPOS if your web service is designed for use with
QuickBooks Point-of-Sale (QBPOS).
SchedulerNYour end user can specify the update interval in the QB web
connector UI. You can optionally supply a default update interval by
including the <Scheduler> aggregate, but be aware that the user
can override your settings in the UI.
You can specify one of two fields within this aggregate:
<RunEveryNMinutes> specifies the number of minutes that should
elapse between connections to your web service.
<RunEveryNSeconds> specifies the number of seconds that should
elapse between connections to your web service. Using this tag to
set the update interval results the update interval to be displayed in
the web connector UI as “Real Time”.Notice that network/internet
bandwith issues may not support the use of small values here, for
example, an update interval of one second. If this is the case, the
update will occur at the first available time after the specified
elapsed time. The end user cannot specify an update interval of less
than 1 minute, but they may discover they can change this in the
registry.
If you supply both <RunEveryNMinutes> and <RunEveryNSeconds>
in your Scheduler aggregate, the web connector will simply pick the
first one in the QWC and use that one.
In practice, the Scheduler aggregate defines a minimum time
between connections, and should not be taken to guarantee an
update time. Also, remember that scheduled updates happen only
when the web connector is running. If the user shuts down the web
connector there will be no scheduled updates until the web
connector is restarted by the user.
qbwcXML ElementRequired?Description

38Chapter 4: Building The QWC File for Your Users
(c) 2022 Intuit Inc.   All rights reserved.
•A new optional QWC parameter <CertURL> to provide means to provide certificate
server for ssl certificates other than web server.
There are new optional QWC file parameters for three rp.AuthPreferences parameters IsReadOnly (true/false),
UnattendedModePref (umpRequired/umpOptional), and PersonalDataPref(pdpNotNeeded/pdpOptional/
pdpRequired).
Is the Order of the Tags Important?
No. You can specify the qbwcXML elements within the QWC in any order you like.
However, we recommend you approximate the order shown in the sample file in order to
maintain consistency for your users, in the event they should ever need to look at these
files. The caveat here is that if you specify both RunEveryNMinutes and
RunEveryNSeconds, the first element specified will be used.
Can I Start Developing Without All That “Cert” Stuff?
Yes. If you just want to develop the web service first without certs you can use HTTP and
“localhost” instead of a domain name. Then obtain your cert and code to support certs later
for use with HTTPS. The sample web service QWC file shown in Listing 4-1 shows the
entry for using localhost with HTTP.
However, production use over the Internet requires HTTPS and certs.
StyleNThe SOAP encoding style used by your web service. If not supplied,
the default used is Document.
Document is the standard encoding style used by .NET when the
[WebMethod] attribute is applied to a function declaration.
Optionally, you can specify the value DocWrapped. DocWrapped
interoperates very well with Axis web services that are built as we
recommend, using WSDL2Java to generate Java web classes from
the standard WSDL used by the web connector (http://
developer.intuit.com/uploadedFiles/Support/
QBWebConnectorSvc.wsdl)
Or, optionally, you can specify the value RPC. The RPC style is the
standard encoding style used by Axis when a Java class is
automatically converted to a SOAP service either through JWS or the
Java2WSDL tool.
UnattendedModePref    NUsed to inform QBXMLRP2 (request processor) whether your service
needs permissions to run in Unattended Mode supply the value
umpRequired if it does, or umpOptional if it does not.
UserNameYThe name your user must use to access your web service. The web
connector uses this name when it invokes the authenticate call on
your web service.
To avoid disclosure of the password, there is no provision for any
password field in the QWC file. Your user must enter the password
into the web connector themselves, where it can be stored in the
Windows registry securely via encryption.
qbwcXML ElementRequired?Description

How Does the User Add the QWC File? 39
(c) 2022    Intuit Inc. All rights reserved.
Can I Run My Web Service in “Real Time”?
Sort of. You can specify the element <RunEveryNSeconds> within the Scheduler aggregate
and set a value as low as one second. However, due to network latencies and server
bandwith, this update frequency may not be attainable or even allowed. To guard against a
too frequent update interval, you could implement a timer on your web service end to
enforce your update frequency policy. Any web connector authenticate call that occurs too
frequently as measured by the timer would be responded to by your web service with a
indication that you have no requests for the web connector.
Can I Stop My Users From Running Updates in “Real Time”?
From the web connector UI, the user cannot specify a scheduled update time less than one
minute. They can overwrite your “Real Time” setttings (updates less than one minute) only
by specifying, from the UI, a time of one minute or greater. If they do this type of
overwrite, they’ll have to remove your web service and re-add it if they want the higher
frequency “real time” settings.
However, this only applies to the web connector UI. A sufficiently clever end user can
always modify the QWC file simply by adding the RunEveryNSeconds field to the
Scheduler aggregate in the QWC file. To guard against this, you could implement a timer
on your web service end to enforce your update frequency policy. Any web connector
authenticate call that occurs too frequently as measured by the timer would be responded to
by your web service with a indication that you have no requests for the web connector.
Can I Specify Run EveryNSeconds and RunEveryNMinutes in one
QWC File?
You can specify both of these tags within the Scheduler aggregate. However, only the first
one will be used.
How Does the User Add the QWC File?
Your user can import the contents of the QWC (that is, can add the web service “pointed to”
in the QWC file) in either of two ways:
•By double-clicking on the QWC file. The QWC file extension is registered so that the
web connector will add it as a result of the double-click action.
•By clicking Add an Application and then browsing to the QWC file to open it. See
## Figure 4-1.

40Chapter 4: Building The QWC File for Your Users
(c) 2022 Intuit Inc.   All rights reserved.
Figure 4-1The QB Web Connector UI

A Note About the Required NameSpace 41
(c) 2022    Intuit Inc. All rights reserved.
