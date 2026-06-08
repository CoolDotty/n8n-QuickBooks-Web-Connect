# Chapter 10: QBWC Callback Web Method Reference
This chapter contains descriptions of each of the callback web methods your web service
must implement. Notice that although the clientVersion is optional, we strongly recommend
that you implement this as well.
## IMPORTANT
Your web service application must not manually build SOAP
headers (e.g., <soap:Envelope>, <soap:Body> etc.) before
sending it to the QuickBooks Web Connector, for example, via
sendRequestXML(). Your SOAP Engine should automatically
wrap these headers around the xml sent by your web service.
The following callback methods should be implemented in your web service:
## •“authenticate”
•“clientVersion”
•“closeConnection”
•“connectionError”
•“getInteractiveURL”
•“getLastError”
•“getServerVersion”
•“interactiveDone”
•“interactiveRejected”
•“receiveResponseXML”
•“sendRequestXML”
Each of these callback methods is described in the following sections.
## IMPORTANT
The parameter names listed for the callback methods are
important. You must use the parameter names as given in the
method signatures.

62Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
authenticate
string[] authenticate(string strUserName, string strPassword)
Prompts the web service to authenticate the specified user and specify the company to be used in
the session.
## Parameters
strUserNameThe web connector supplies the user name that you provided to your
user in the QWC file to allow that username to access your web
service.
strPasswordThe web connector supplies the user password that you provided to
your user and which was stored by the user in the web connector.
## Return Value
Your callback must return A string array with 4 possible elements. In this returned string
array:
•The first element contains either NONE or NVU (invalid user) or BUSY., or empty
string, or a string that is the QB company file name. If your web service returns an
empty string or any other string that is NOT nvu or none, or busy, that string will be
used as the qbCompanyFileName parameter in the web connector’s BeginSession call
to QuickBooks.
•The second element enables the web service to postpone the update process. The value
i
n this parameter determines the number of seconds by which the update will
be
postponed. For example if authRet[2]=60, the WebConnector will postpone the update
process by 60 seconds. That is, the current update process is discontinued and will
resume after 60 seconds.
•The third element (optional) sets the lower limit for the Every_Min parameter (this
parameter determines the interval the scheduler uses to run the updates when autorun is
enabled). For example, if the third element =300 seconds, suppose a tries to set
Every_Min=2 min using the UI of the WebConnector instance. In this case the result
would be a popup that informs the user that the lower limit for this parameter is
## 300
seconds.and the Web Connector will automatically set the Every_Min parameter to 5
min (300 seconds).
•The fourth element (optional) contains the number of seconds to be used as th
e
MinimumRunEveryNSeconds time.
## IMPORTANT
In order to enable the web service to use authRet[2] &
authRet[3], ‘Auto Run’ has to be enabled in the WebConnector

authenticate 63
(c) 2022    Intuit Inc. All rights reserved.
## Usage
When a scheduled update occurs for your web service, or when the user clicks Update
Selected in the web connector, the web connector calls your web service’s authenticate
method, supplying the user name and password required for your user to access your web
service. Your web service validates the user specified in the authenticate call and returns a
string array containing the values described previously under “Return Values”.
Sample behavior of authRet[2] & authRet[3] is as follows:
Example 1. Suppose authRet[1]="", authRet[2]=”x” seconds and authRet[3]=””
Result: the update is postponed by x seconds. In the QBWC status window this will be
shown:
Last Result- Update postponed by application.
Example 2. authRet[1]="", authRet[2]=””, and authRet[3]=”y” seconds.
Result: The minimum limit for the Every_Min parameter is set. In the QBWC status
window, the value of the Every_Min field will be shown set to the value in authRet[3], if
the previous Every_Min value is lesser than the current value in authRet[3]. The Last Run
time and the Next Run time is also shown. (Here Next Run Time= Last Run Time + y
seconds)
Example 3. authRet[1]="", authRet[2]= “x” seconds and authRet[3]= “y” seconds
Result: The update is postponed by x seconds and the minimum limit for the Every_Min
parameter is set. In the QBWC status window, the following are shown: Last Result-
Update postponed by application.Last Run time and the Next Run time is also shown. (Here
Next Run Time= Last Run Time + x seconds). Every_Min field is set to the value in
authRet[3], if the previous Every_Min value is lesser than the value in authRet[3].
Example 4. authRet[1]=”NONE/NVU/BUSY” , authRet[2]= “x” seconds and
authRet[3]=””
Result: The update is postponed by x seconds. In the QBWC status window the following
will be shown: Last Result- Update postponed by application.
Example 5. authRet[1] =”NONE/NVU/BUSY”, authRet[3]= “y” seconds and
authRet[2]=””
Result: The minimum limit on the Every_Min parameter is set and the update is stopped. In
the QBWC status window the following will be shown: Last Result- No Data Exchange/
Invalid password for username/ Application Busy is displayed based on the value in
authRet[1].Last Run Time and Next Run Time is displayed, Here Next Run Time=Last Run
Time +y seconds. Every_Min field is set to the value in authRet[3], if the previous
Every_Min value was lesser than the value in authRet[3].
Example 6. authRet[1]= ”NONE/NVU/BUSY”, authRet[3]= “y” seconds and
authRet[2]=”x” seconds.
Result: The minimum limit on the Every_Min parameter is set and the update is postponed.
In the QBWC status window the following will be shown: Last Result- Update postponed
by application. Every_Min field is set to the value in authRet[3], if the previous Every_Min
value was lesser than the value in authRet[3]. Last Run Time and Next Run Time is
displayed. Here Next Run Time=Last Run Time +x seconds

64Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
Example 7. authRet[1] =””, authRet[3]= “” seconds and authRet[2]=””
Result: Update will complete successfully.
Sample Code (C-sharp)
The following code sample is taken from the QB SDK sample program WCWebService. It
responds to the authenticate method by creating a session GUID to be used as the session
token and stores it in the first element in the string array to be returned to the web
connector. The sample then compares the username and password to the expected
hardcoded value, which is a bit hokey, but good enough for the purposes of this sample! If
the supplied values are valid, the second element in the returned string array is set to empty
string, which tells the web connector to use the currently open company.
[WebMethod]
public string[] authenticate(string strUserName, string strPassword)
## {
string evLogTxt="WebMethod: authenticate() has been called by QBWebconnector" + "
evLogTxt=evLogTxt+"Parameters received:
evLogTxt=evLogTxt+"string strUserName = " + strUserName + "
evLogTxt=evLogTxt+"string strPassword = " + strPassword + "
evLogTxt=evLogTxt+"
string[] authReturn = new string[2];
// Code below uses a random GUID to use as session ticket
// An example of a GUID is {85B41BEE-5CD9-427a-A61B-83964F1EB426}
authReturn[0]= System.Guid.NewGuid().ToString();
// For simplicity of sample, a hardcoded username/password is used.
// In real world, you should handle authentication in using a standard way.
// For example, you could validate the username/password against an LDAP
// or a directory server
string pwd="password";
evLogTxt=evLogTxt+"Password locally stored = " + pwd + "
if (strUserName.ToUpper().Trim().Equals("USERNAME") &&
strPassword.ToUpper().Trim().Equals(pwd.ToUpper()))
## {
// An empty string for authReturn[1] means asking QBWebConnector
// to connect to the company file that is currently openned in QB
authReturn[1]="";
## }
else
## {
authReturn[1]="nvu";
## }
// You could also return "none" to indicate there is no work to do
// or a company filename in the format C:\full\path   o\company.qbw
// based on your program logic and requirements.
evLogTxt=evLogTxt+"
evLogTxt=evLogTxt+"Return values: " + "

authenticate 65
(c) 2022    Intuit Inc. All rights reserved.
evLogTxt=evLogTxt+"string[] authReturn[0] = " + authReturn[0].ToString() + "
evLogTxt=evLogTxt+"string[] authReturn[1] = " + authReturn[1].ToString();
logEvent(evLogTxt);
return authReturn;

66Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
clientVersion
string clientVersion(string strVersion)
Optional callback allows the web service to evaluate the current web connector version and react to
it. Not currently required to support backward compatibility but strongly recommended.
## Parameters
strVersionThe version of the QB web connector supplied in the web
connector’s call to clientVersion.
## Return Value
A string telling the web connector what to do next. Supply one of the following strings:
•Specify an empty string or Null if you want the web connector to proceed with the
update.
•Specify a text string that begins with the characters "W:" if you want the web connect
or
to display a WARNING dialog prompting the user to continue with the update or cancel
it. The text string after the “W:” will be displayed in the warning dialog.
•Specify a text string that begins with the characters "E:" if you want the web connector
to cancel the update and display an ERROR dialog. The text string after the “E:” will
be displayed in the error dialog. The user will have to download a new version of the
web connector to continue with the update.
•Supply a value of O: (O as in Okay, not zero, followed by the QBWC version supported
by the web service). For example O:2.0. This tells the user that the server expects a
newer version of QBWC than the user currently has but also tells the user which
version is needed.
## Usage
When the web connector user clicks on Update Selected with your web service selected, or
when a scheduled update occurs, the web connector begins the communication by calling
clientVersion.
If your web service does not implement this callback method, the web connector simply
proceeds to the update by calling authenticate.
If your web service does implement the clientVersion callback, the web connector will
continue with the update, cancel it, or warn the user, depending on the information it
receives from your web service. (See above under “Return Value”.)
Sample Code (C-sharp)
The following code sample is taken from the QB SDK sample program WCWebService. It
responds to the clientVersion method by comparing the web connector version to a
minimum value and a recommended value. If the version is less than the recommended
value, a warning string is returned; if the version is less than the minimum supported value,
and error string is returned. Otherwise, an empty string is returned to allow the web
connector to continue.

clientVersion 67
(c) 2022    Intuit Inc. All rights reserved.
[WebMethod]
public string clientVersion(string strVersion)
## {
string evLogTxt="WebMethod: clientVersion() has been called " +
"by QBWebconnector" + "
evLogTxt=evLogTxt+"Parameters received:
evLogTxt=evLogTxt+"string strVersion = " + strVersion + "
evLogTxt=evLogTxt+"
string retVal=null;
double recommendedVersion  = 1.5;
double supportedMinVersion = 1.0;
double suppliedVersion=Convert.ToDouble(this.parseForVersion(strVersion));
evLogTxt=evLogTxt+"QBWebConnector version = " + strVersion + "
evLogTxt=evLogTxt+"Recommended Version = " + recommendedVersion.ToString() + "
evLogTxt=evLogTxt+"Supported Min Version = " + supportedMinVersion.ToString() + "
evLogTxt=evLogTxt+"SuppliedVersion = " + suppliedVersion.ToString()+"
if(suppliedVersion<recommendedVersion) {
retVal="W:We recommend that you upgrade your QBWebConnector";
## }
else if(suppliedVersion<supportedMinVersion){
retVal="E:You need to upgrade your QBWebConnector";
## }
evLogTxt=evLogTxt+"
evLogTxt=evLogTxt+"Return values: " + "
evLogTxt=evLogTxt+"string retVal = " + retVal;
logEvent(evLogTxt);
return retVal;
## }

68Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
closeConnection
string closeConnection(string ticket)
Tells your web service that the web connector is finished with the update session.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array.
## Return Value
Specify a string that you want the web connector to display to the user showing the status of
the web service action on behalf of your user. This string will be displayed in the web
connector UI in the status column.
## Usage
When the update with the web service is completed, the web connector will notify the web
service that it is done with the session it started by calling closeConnection. fifth of the six
required methods for your web service:
Sample Code (C-sharp)
The following code sample is taken from the QB SDK sample program WCWebService. It
doesn’t do anything very interesting, just returns an “OK” message.
[WebMethod]
public string closeConnection(string ticket) {
string evLogTxt="WebMethod: closeConnection() has been called by QBWebconnector" + "
evLogTxt=evLogTxt+"Parameters received:
evLogTxt=evLogTxt+"string ticket = " + ticket + "
evLogTxt=evLogTxt+"
string retVal=null;
retVal="OK";
evLogTxt=evLogTxt+"
evLogTxt=evLogTxt+"Return values: " + "
evLogTxt=evLogTxt+"string retVal= " + retVal + "
logEvent(evLogTxt);
return retVal;
## }

connectionError 69
(c) 2022    Intuit Inc. All rights reserved.
connectionError
string connectionError(string ticket, string hresult, string message)
Tells your web service about an error the web connector encountered in its attempt to connect to
QuickBooks or QuickBooks POS.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array.
hresultThe HRESULT (in HEX) from the exception thrown by the request
processor.
messageThe error message that accompanies the HRESULT from the request
processor.
## Return Value
Specify the string value “done” to indicate that your web service is finished. Or, if you want
to retry the connection attempt on a different QuickBooks or QuickBooks POS company,
specify the full pathname of that company in the return string. Any string other than “done”
will be interpreted as the company name to be used in a retry attempt.
## Usage
## IMPORTANT
Don’t retry the same operation in response to the
connectionError more than a couple of times. If the problem
isn’t resolved after a couple of tries, use getLastError to notify
the user about the problem.
When the web service responds to the web connector’s authenticate method call by
indicating there is data to be exchanged with QuickBooks, the web connector calls the
OpenConnection and BeginSession methods of the QuickBooks XML request processor.
If either of those calls fail for any reason, the web connector will display the error code and
error message from the request processor to the user, and it will let your web service know
about the error via the connectionError call.
Sample Code (C-sharp)
The following code sample is taken from the QB SDK sample program WCWebService.
Depending on the error, it either returns “Done” indicating it doesn’t want to continue, or
returns an empty string, meaning retry the connection attempt with the currently open
company. (A real-world web service might want to instead maintain a record of the
company file name or file names it expects and try to specify an expected filename.)
[WebMethod]

70Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
public string connectionError(string ticket, string hresult, string message)
## {
string evLogTxt="WebMethod: connectionError() has been called by QBWebconnector" + "
evLogTxt=evLogTxt+"Parameters received:
evLogTxt=evLogTxt+"string ticket = " + ticket + "
evLogTxt=evLogTxt+"string hresult = " + hresult + "
evLogTxt=evLogTxt+"string message = " + message + "
evLogTxt=evLogTxt+"
string retVal=null;
// 0x80040400 - QuickBooks found an error when parsing the provided XML text stream.
const string QB_ERROR_WHEN_PARSING="0x80040400";
// 0x80040401 - Could not access QuickBooks.
const string QB_COULDNT_ACCESS_QB="0x80040401";
// 0x80040402 - Unexpected error. Check the qbsdklog.txt file
const string QB_UNEXPECTED_ERROR="0x80040402";
// Add more as you need...
if(hresult.Trim().Equals(QB_ERROR_WHEN_PARSING)){
evLogTxt=evLogTxt+ "HRESULT = " + hresult + "
evLogTxt=evLogTxt+ "Message = " + message + "
retVal = "DONE";
## }
else if(hresult.Trim().Equals(QB_COULDNT_ACCESS_QB)){
evLogTxt=evLogTxt+ "HRESULT = " + hresult + "
evLogTxt=evLogTxt+ "Message = " + message + "
retVal = "DONE";
## }
else if(hresult.Trim().Equals(QB_UNEXPECTED_ERROR)){
evLogTxt=evLogTxt+ "HRESULT = " + hresult + "
evLogTxt=evLogTxt+ "Message = " + message + "
retVal = "DONE";
## }
else {
// Depending on various hresults return different value
// Try again with this company file
evLogTxt=evLogTxt+ "HRESULT = " + hresult + "
evLogTxt=evLogTxt+ "Message = " + message + "
retVal = "";
## }
evLogTxt=evLogTxt+"
evLogTxt=evLogTxt+"Return values: " + "
evLogTxt=evLogTxt+"string retVal = " + retVal + "
logEvent(evLogTxt);
return retVal;
## }

getInteractiveURL 71
(c) 2022    Intuit Inc. All rights reserved.
getInteractiveURL
string getInteractiveURL(string wcTicket, string sessionID)
Lets your web service tell QBWC where to get the web page to display in the browser at the start of
interactive mode.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array.
sessionID
## Return Value
Your web service should return a message string containing the URL of the web page you
want opened in the browser.
## Usage
Used to support interactive mode. To start interactive mode, your web service indicates to
QBWC that it wants to start interactive mode by returning an empty string from
sendRequestXML, which causes QBWC to invoke getLastError. Then from getLastError
you return the string “Interactive mode” to kick off the interactive session.
QBWC responds to this string by calling getInteractiveURL and opens a browser with the
web page you specify in your return to that call.

72Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
getLastError
string getLastError(string ticket)
Allows your web service to return the last web service error, normally for display to the user, before
causing the update action to stop.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array.
## Return Value
Your web service should return a message string describing the problem and any other
information that you want your user to see. The web connector writes this message to the
web connector log for the user and also displays it in the web connector’s Status column.
If you want your web service to go into interactive mode, you return the string “Interactive
mode” and QBWC will respond by calling your web service’s getInteractiveURL method,
and open a web browser to the URL that you provide via this callback.
If you want the Web Connector to pause for an interval of time (currently 5 seconds) return
the string “NoOp” from your sendRequestXML callback, followed by the string “NoOp”
returned from your “getLastError callback. This will cause the QBWC to pause updates for
5 seconds before attempting to call sendRequestXML() again.
## Usage
In some cases, your web service may receive a sendRequestXML or a
receiveResponseXML call that contains unexpected data. For example, there may be an
XML parse error, or an expired ticket, or other unexpected data from QuickBooks. If this
happens, your web service must first tell the web connector that an error has occurred and
then handle the follow-up getLastError call from the web connector.
How do you tell the web connector that an error occurred, in the “opinion” of the web
service? If the problem data was sent in the sendRequestXML call, simply return an empty
string to the sendRequestXML call. If the problem data was sent in the
receiveResponseXML call, simply return a negative value to the receiveResponseXML
call.
The web connector responds to this error condition by calling the getLastError method.
After you return a string indicating the nature of the problem, the web connector will then
terminate the connection to the web service by calling closeConnection.
Sample Code (C-sharp)
The following code sample is taken from the QB SDK sample program WCWebService. It
just does a simple check then returns an error.

getLastError 73
(c) 2022    Intuit Inc. All rights reserved.
[WebMethod]
public string getLastError(string ticket)
## {
string evLogTxt="WebMethod: getLastError() has been called by QBWebconnector" + "
evLogTxt=evLogTxt+"Parameters received:
evLogTxt=evLogTxt+"string ticket = " + ticket + "
evLogTxt=evLogTxt+"
int errorCode=0;
string retVal=null;
if(errorCode==-101){
retVal="QuickBooks was not running!"; // just an example of custom user errors
## }
else{
retVal="Error!";
## }
evLogTxt=evLogTxt+"
evLogTxt=evLogTxt+"Return values: " + "
evLogTxt=evLogTxt+"string retVal= " + retVal + "
logEvent(evLogTxt);
return retVal;
## }
## }

74Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
getServerVersion
string getServerVersion(string ticket)
Provides a way for web-service to notify QBWC of it’s version. This version string shows up in the
More Information pop-up dialog in QBWC.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array.
## Return Value
Your web service should return a message string describing the server version and any other
information that you want your user to see.
## Usage
Sample Code (C-sharp)

interactiveDone 75
(c) 2022    Intuit Inc. All rights reserved.
interactiveDone
string interactiveDone(string wcTicket)
Allows your web service to indicate to QBWC that it is done with interactive mode.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array.
## Return Value
Your web service should return a message string with the value “Done” when the
interactive session is over.
## Usage

76Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
interactiveRejected
string interactiveRejected(string wcTicket, string reason)
Allows your web service to take alternative action when the interactive session it requested was
rejected by the user or by timeout in the absence of the user.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array.
reasonThe reason for the rejection of interactive mode.
## Return Value
Return a message string to be displayed.
## Usage

receiveResponseXML 77
(c) 2022    Intuit Inc. All rights reserved.
receiveResponseXML
int receiveResponseXML(string ticket, string response, string hresult,
string message)
Returns the data request response from QuickBooks or QuickBooks POS.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array.
responseContains the qbXML response from QuickBooks or qbposXML
response from QuickBooks POS.
hresultThe hresult and message could be returned as a result of certain
errors that could occur when QuickBooks or QuickBooks POS sends
requests is to the QuickBooks/QuickBooks POS request processor
via the ProcessRequest call. If this call to the request processor
resulted in an error (exception) instead of a response, then the web
connector will return the corresponding HRESULT and its text
message in the hresult and message parameters. If no such error
occurred, hresult and message will be empty strings.
messageSee above under hresult.
## Return Value
A positive integer less than 100 represents the percentage of work completed. A value of 1
means one percent complete, a value of 100 means 100 percent complete--there is no more
work. A negative value means an error has occurred and the Web Connector responds to
this with a getLastError call. The negative value could be used as a custom error code.
## Usage
When the web connector gets a response from QuickBooks or QuickBooks POS, it sends
the response to the web service through receiveResponseXML. The web service should
process the response and return an integer. A positive integer if you want it to serve as the
estimated percent complete for the session, a negative integer if you want to indicate to the
web connector that an error has occurred.
If the return value is positive, but less than 100 then the web connector knows that the web
service has additional requests to be sent to QuickBooks, the connection status bar will be
updated based on the percentage returned by the web service and the connector will call
sendRequestXML again (this time leaving the strHCPResponse parameter as an empty
string).
If the return value is negative, meaning an error occurred, then the Web Connector will call
the web service’s getLastError method (the fourth of the six required methods for your web
service to implement). The getLastError method returns to the error message that should be
presented to the user.

78Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
If the web service indicated it was not 100% complete, then the web connector will call
sendRequestXML again, the qbXML returned by the web service will be sent to
QuickBooks and the response sent to the web service via the receiveResponseXML
method. This will repeat until an error occurs or the web service indicates that it is done
exchanging data with QuickBooks.
There is no limit on the number of messages to QuickBooks Web Connector (QBWC). It
depends on your application -- when in response to receiveResponseXML() you send a
return value of 100 (which means 100% completed) then QBWC will stop calling
sendRequestXML().
Sample Code (C-sharp)
The following code sample is taken from the QB SDK sample program WCWebService.
[ WebMethod(Description="response XML from QuickBooks",EnableSession=true) ]
public int receiveResponseXML(string ticket, string response, string hresult,
string message)
## {
string evLogTxt="WebMethod: receiveResponseXML() called by QBWebconnector" + "
evLogTxt=evLogTxt+"Parameters received:
evLogTxt=evLogTxt+"string ticket = " + ticket + "
evLogTxt=evLogTxt+"string response = " + response + "
evLogTxt=evLogTxt+"string hresult = " + hresult + "
evLogTxt=evLogTxt+"string message = " + message + "
evLogTxt=evLogTxt+"
int retVal=0;
if(!hresult.ToString().Equals("")){
// if error in the response, web service should return a negative int
evLogTxt=evLogTxt+ "HRESULT = " + hresult + "
evLogTxt=evLogTxt+ "Message = " + message + "
retVal=-101;
## }
else{
evLogTxt=evLogTxt+ "Length of response received = " + response.Length + "
ArrayList req=buildRequest();
int total=req.Count;
int count=Convert.ToInt32(Session["counter"]);
int percentage=(count*100)/total;
if (percentage>=100){
count=0;
## Session["counter"]=0;
## }
retVal=percentage;
## }
evLogTxt=evLogTxt+"
evLogTxt=evLogTxt+"Return values: " + "

receiveResponseXML 79
(c) 2022    Intuit Inc. All rights reserved.
evLogTxt=evLogTxt+"int retVal= " + retVal.ToString() + "
logEvent(evLogTxt);
return retVal;

80Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
sendRequestXML
string sendRequestXML(string ticket,
string strHCPResponse,
string strCompanyFileName,
string qbXMLCountry,
int qbXMLMajorVers,
int qbXMLMinorVers)
The web connector’s invitation to the web service to send a request.
## Parameters
ticketThe ticket from the web connector. This is the session token your
web service returned to the web connector’s authenticate call, as the
first element of the returned string array
strHCPResponseOnly for the first sendRequestXML call in a data exchange session
will this parameter contains response data from a HostQuery, a
CompanyQuery, and a PreferencesQuery request. This data is
provided at the outset of a data exchange because it is normally
useful for a web service to have this data. In the ensuing data
exchange session, subsequent sendRequestXML calls from the web
processor do not contain this data, (only an empty string is supplied)
as it is assumed your web service already has it for the session.
strCompanyFileNameThe company file being used in the current data exchange.
qbXMLCountryThe country version of QuickBooks or QuickBooks POS product
being used to access the company. For example, US, CA (Canada),
or UK.
qbXMLMajorVersThe major version number (corresponding to the qbXML or
qbposXML spec level) of the request processor being used. For
example, the major number of the request processor released to
support qbXML spec 6.0 would be “6”.
qbXMLMinorVersThe minor version number (corresponding to the qbXML or
qbposXML spec level) of the request processor being used. For
example, the major number of the request processor released to
support qbXML spec 6.0 would be “0”.
## Return Value
If the web service has no requests to send, specify an empty string. If you want the Web
Connector to pause for an interval of time (currently 5 seconds) return the string “NoOp”,
which will cause the Web Connector to call your getLastError callback: a “NoOp” returned
from GetLastError will cause the QBWC to pause updates for 5 seconds before attempting
to call sendRequestXML() again.
Any other string will be taken as a qbXML for QuickBooks or a qbposXML request for
QuickBooks POS.  The Web Connector sends the qbXML or qbposXML to QuickBooks or
QuickBooks POS via the request processor’s ProcessRequest method call.

sendRequestXML 81
(c) 2022    Intuit Inc. All rights reserved.
## Usage
After receiving the session token (ticket) returned from the web service in response to the
authenticate call, the web connector establishes a connection to QuickBooks using QBXML
Request Processor. The web connector then calls sendRequestXML, supplying in that call
certain information about the QuickBooks or QuickBooks POS connection that the web
connector has established.
If there is a problem establishing the connection the web connector does not call
sendRequestXML, but instead calls connectionError.
Sample Code (C-sharp)
The following code sample is taken from the QB SDK sample program WCWebService. It
logs the incoming HostQuery, CompanyQuery, and PreferencesQuery data and then invokes
buildRequest (which is defined in the sample program WCWebService) to build a
hardcoded set of requests.
[ WebMethod(Description="send request XML ",EnableSession=true) ]
public string sendRequestXML(string ticket, string strHCPResponse,
string strCompanyFileName,
string Country,
int qbXMLMajorVers,
int qbXMLMinorVers)
## {
if (Session["counter"] == null) {
## Session["counter"] = 0;
## }
string evLogTxt="WebMethod: sendRequestXML() has been called by QBWebconnector" + "
evLogTxt=evLogTxt+"Parameters received:
evLogTxt=evLogTxt+"string ticket = " + ticket + "
evLogTxt=evLogTxt+"string strHCPResponse = " + strHCPResponse + "
evLogTxt=evLogTxt+"string strCompanyFileName = " + strCompanyFileName + "
evLogTxt=evLogTxt+"string Country = " + Country + "
evLogTxt=evLogTxt+"int qbXMLMajorVers = " + qbXMLMajorVers.ToString() + "
evLogTxt=evLogTxt+"int qbXMLMinorVers = " + qbXMLMinorVers.ToString() + "
evLogTxt=evLogTxt+"
ArrayList req=buildRequest();
string request="";
int total = req.Count;
count=Convert.ToInt32(Session["counter"]);
if(count<total) {
request=req[count].ToString();
evLogTxt=evLogTxt+ "sending request no = " + (count+1) + "
## Session["counter"] = ((int) Session["counter"]) + 1;
## }
else{
count=0;
## Session["counter"]=0;

82Chapter 10: QBWC Callback Web Method Reference
(c) 2022 Intuit Inc.   All rights reserved.
request="";
## }
evLogTxt=evLogTxt+"
evLogTxt=evLogTxt+"Return values: " + "
evLogTxt=evLogTxt+"string request = " + request + "
logEvent(evLogTxt);
return request;
## }

## 83
(c) 2022    Intuit Inc. All rights reserved.
