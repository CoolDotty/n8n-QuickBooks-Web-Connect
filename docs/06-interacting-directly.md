# Chapter 6: Interacting Directly with the Web Connector
Beginning with QBWC 2.0, the Web Connector supports interactive mode. In interactive
mode, QBWC opens a browser window to a web page specified by your web service. The
user then uses the browser to do any of the available QuickBooks/QBWC activities that you
choose to support.
There are two areas of activity that are available to your user:
•Your user can send information to QBWC to update web service parameters, start
updates and so forth. You’ll support these activities using the docontrol operation
(which we’ll describe shortly).
•Your user can invoke various pre-set SDK queries and also display certain QuickBooks
list or transaction forms so the user can fill out forms right in QuickBooks. You’ll use
the doquery operation to support those.
A detailed list of supported activities is provided later in this chapter.
## IMPORTANT
Version 2.0 of the web connector includes an asynchronous
pluggable protocol handler that allows web-based applications
to interact with the web connector via Javascript. With QBWC
2.0 the protocol handler works only with the Internet Explorer
browser.
How to Implement Interactive Mode
How do you get your web service to support interactive mode? You need to do the
following:
-   In the sendRequestXML when you want to start interactive mode, you need to return an
empty string. This causes QBWC to call getLastError.
-   In the getLastError callback, again when interactive mode is desired, you need to return
the string “Interactive mode”. This causes QBWC to call getInteractiveURL so QBWC
can open a browser to your web page.
-   In the getInteractiveURL callback, you need to return the URL of the web page that
you want your end user to use. (Of course you’ll need to develop that web page to
accept user input and respond by issuing the proper docontrol and doquery operations.)
-   You need to implement the interactiveRejected callback to do whatever you want done
in these cases where interactive mode is rejected. What could case such a rejection?
Each time your web service attempts to start an interactive session, the user is prompted
for permission by QBWC. If the user chooses NOT to give permission QBWC calls
i
nteractiveRejected. Or, suppose your thirsty user is out for coffee when your
web

44Chapter 6: Interacting Directly with the Web Connector
(c) 2022 Intuit Inc.   All rights reserved.
service tries to start an interactive session? There will be a timeout after a number of
seconds and QBWC calls interactiveRejected.
-   You need to implement the interactiveDone callback. During the interactive mode
session QBWC will periodically poll your web service to see if you’re done yet by
calling this callback. If, from your perspective, the session is done, if your web service
knows the session has timed out, indicate this by returning an empty string (“ “) from
interactiveDone
This chapter describes how you can use the protocol handler to interact directly with
QBWC, without having to wait on QBWC to call your web service callback methods.
Using docontrol to change web service behavior in QBWC
How do you use the docontrol operation to make web service changes in QBWC? You
respond to user input by using qbwc:// protocol of the following form:
qbwc://<operation>/<request>?<parameters>
For <operation>, in the present case, specify docontrol, which sends control signals to
QBWC to update web service parameters, start updates and so forth.
## Note:
Docontrol protocol will not be   supported from    versio
n  2.3.0.215.
Find out   more about Docontrol protocol support    withdrawal
Sample docontrol URLs
The following sample URLs show how the requests are placed in the URL:
qbwc://docontrol/WSExists?AppName=WCWebService
qbwc://docontrol/UpdateNow?AppName=WCWebService
qbwc://docontrol/UpdateNow?AppName=WCWebService3?async=true (for long
requests, this frees up the web browser)
qbwc://docontrol/SetSync?AppName=WCWebService&Interval=600
qbwc://docontrol/CountResults?AppName=WCWebService&Query=CustomerQueryRq
qbwc://docontrol/GetCompanyFile?AppName=WCWebService
For Time Consuming Updates, Use async=true
Normally, when web-app makes the call docontrol/Update, the Web Connector locks down
some browsers for the duration of the update process. Thus,
the web-app will have to
wait while the Web Connector is processing the request. Setting async=true will
release the web-app so it can perform other tasks while the Web Connector is
processing the request.
Here is how to specify the parameter async=true in the call:

Using docontrol to Change Web Service Behavior in QBWC 45
(c) 2022    Intuit Inc. All rights reserved.
qbwc://docontrol/UpdateNow?AppName=WCWebService3?async=true
How to Get Status of the Update
For long updates, you might want to display status to the user. Here is how you do this.
make the Update call async = True and keep pinging the response URL, as shown in the
following example:
function UpdateNow() {
var req = new Ajax.Request("qbwc://docontrol/
UpdateNow?async=true&AppName=WCWebService3", {method:'get',
onSuccess:processDataOne, onFailure:reportError});
## }
//this code pings the response URL obtained from Web Connector
var pingURL ;
var i = "0" ;
function processDataOne(request)
## {
if ( i == "0" )
## {
pingURL = URLDecode(request.responseText);
i++;
## }
if (request.status == 202)
## {
//Url contains the Updatestatus as one of the parameter , which
//contains the value;
alert("Process Data: " + request.status + ': ' +
URLDecode(request.responseText));
setTimeout("var req1 = new Ajax.Request(pingURL,{method:'get',
onSuccess:processDataOne, onFailure:reportError})", 1000);
## }
else if (request.status == 200)
## {
respURL = request.responseText;
i= "0";
alert("Process Data: " + request.status + ': ' +
URLDecode(request.responseText));
## }
## }
Requests for the docontrol operation
The docontrol operation offers the following requests:
RequestDescription
AddWebServicePOST qwcXML to qbwc://docontrol/AddWebService to snap a web service
connection into the web connector. No parameters necessary in the query
string.
CountResultsReturns the number of records that would satisfy a given unfiltered query.
Takes two parameters: AppName and Query, where Query is the name of
an SDK query (i.e. Query=CustomerQueryRq would return the number of
customers in the company file). Useful for estimating sync times.

46Chapter 6: Interacting Directly with the Web Connector
(c) 2022 Intuit Inc.   All rights reserved.
In all cases, the AppName parameter should specify the AppName (or, if supplied in the qwcXML that snapped the web service
into the web connector, the AppUniqueName) of your web service.
Using doquery to Invoke Pre-Set SDK Requests
To invoke the pre-set SDK requests in response to user input, you would use this syntax:
qbwc://<operation>/<request>?<parameters>
For <operation>, in the present case, specify doquery, which uses the specified pre-set SDK
queries from QuickBooks.
The following preset queries are available, all take a single parameter, a sessionID which is
the GUID of an existing communication session between your web service and
QuickBooks. The intent here is for support of interactive mode support during a session
The doquery operation offers the following requests, returning all elements of the response
XML except in those cases where specific fields are listed:
DisableUpdateIntervalDisables automatic update for the named web service. Takes one
parameter: AppName.
GetCompanyFileReturns the name of the company file currently open in QuickBooks. Useful
for confirming the company file open is the one the user wishes to connect
with your web service. Takes one parameter: AppName.
GetUpdateIntervalGets the current update interval for the named web service. Takes one
parameter: AppName.
RemoveWebServiceRemoves the named web service from WebConnector. Takes one
parameter: AppName.
SetPasswordset the password for a web service. Takes two query string parameters:
AppName and Password. The password is set for the web service specified
by the AppName.
SetSyncSet the automatic sync interval for a given web service. Takes two query
string parameters, AppName and Interval, with the interval provided as a
number of seconds between updates.
UpdateNow Begin an update immediately for the named web service. Takes one
parameter: AppName.
WSExists returns true if the web connector has a web service with the given
AppName. Takes one parameter, AppName.
RequestDescription
AccountQuery queries for active accounts
CustomerBillAddressQuery Same as above, but including the BillingAddress for the customer
CustomerQuery Queries for active customers returning the ListID, Name,
FullName, Sublevel, Balance and TotalBalance for each customer.
EmployeeQuery Queries for active employess returning ListID, Name, PrintAs,
Phone, Mobile, Pager, PagerPIN, Email, EmployeeAddress,
UseTimeDataToCreatePaychecks,
IsUsingTimeDataToCreatePaychecks.
ItemDiscountQuery queries for active discount items
RequestDescription

Using doquery to Invoke Pre-Set SDK Requests 47
(c) 2022    Intuit Inc. All rights reserved.
ItemFixedAssetQuery queries for active fixed asset items
ItemGroupQuery queries for group items
ItemInventoryAssemblyQuery queries for active assembly items
ItemInventoryQuery queries for active inventory items
ItemNonInventoryQuery queries for active non-inventory items
ItemOtherChargeQuery queries for active other charge items
ItemPaymentQuery queries for active payment items
ItemQuery queries for active items, returning ListID, Name, and FullName.
ItemSalesTaxGroupQuery queries for active sales tax group items
ItemSalesTaxQuery queries for active sales tax items
ItemServiceQuery queries for active service items
ItemSubtotalQuery queries for active subtotal items
ListDisplayAdd executes a list display add request for the list type specified in
the type query parameter
ListDisplayMod executes a list display mod request for the list type specified in
the type query parameter, showing the list item provided in the
ListID query parameter.
TxnDisplayAdd a transaction display add request for the transaction type
specified in the type query parameter
TxnDisplayMod
executes a Transaction display mod request for the transaction
t
ype specified in the type query parameter, showing the list item
provided in the TxnID query parameter.
VendorAddressQuery Queries for active vendors, returning ListID, Name, CreditLimit,
Balance, and VendorAddress/VendorAddressBlock.
VendorQueryQueries for active vendors, returning ListID, Name, CreditLimit,
Balance, Phone, Fax , Email, and Contact fields for each.
RequestDescription

48Chapter 6: Interacting Directly with the Web Connector
(c) 2022 Intuit Inc.   All rights reserved.

## Initial End User Setup 49
(c) 2022    Intuit Inc. All rights reserved.
