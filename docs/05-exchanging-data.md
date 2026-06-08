# Chapter 5: Exchanging Data with QuickBooks and QBPOS
In many ways, once the user has setup the connection between QuickBooks and a web-
based application, the heavy lifting is done, from then on, running the web connector from
their desktop system should simply update QuickBooks with data from the web service.
## IMPORTANT
Your web service application must not manually build SOAP
headers (e.g., <soap:Envelope>, <soap:Body> etc.) before
sending it to the QuickBooks Web Connector, for example, via
sendRequestXML(). Your SOAP Engine should automatically
wrap these headers around the xml sent by your web service.
A Note About the Required NameSpace
You must keep the namespace as http://developer.intuit.com/ for all web services that
communicate with QuickBooks Web Connector.
## Data Exchange Considerations
There are, however, a few areas to think about here:
-   The ability for the web connector to communicate the details of an error that occurred
at the web service is limited.  Therefore the web application should have a page the
user can visit to examine the results of at least the most recent communication session
with QuickBooks, if not an archive of previous connection sessions.  We suggest that
the <AppSupport> url provided in the QWC file land the user on a page that is
populated with information about their previous connection, what data was exchan
ged
and details about any errors that may have occurred with advice on how to resolve it
(i.e. if a SalesReceiptAdd failed due to an item not being found, provide the user with
the option to dynamically create the item on the next synch, or to choose an existing
## Qui
ckBooks item to use, etc.)
-   Because the connection with QuickBooks happens based on the user’s choices on the
desktop, the web-based application must locally store the information that should be
updated with QuickBooks upon the next connection.  Many users like to preview what
data will be exchanged with QuickBooks and to configure what data should and shoul
d
not be exchanged.  Where possible, your web application should provide a mechanism
for the user to see the data queued for update to QuickBooks and for the user to enable
or disable the update of specific records.  So, for example, a storefront application that
primarily pushes SalesReceipts might allow the user to choose not to download certa
in
SalesReceipts until the items have been shipped, or the user explicitly marks them for
update to QuickBooks.

42Chapter 5: Exchanging Data with QuickBooks and QBPOS
(c) 2022 Intuit Inc.   All rights reserved.
-   Although true for any application which updates QuickBooks data, this is especially
critical for web-based applications where an internet connection could go down at
anytime: whenever an application is updating QuickBooks data, the QuickBooks error
recovery mechanism (the NewMessageSetID, OldMessageSetID, etc. attributes on  the
QBXMLMsgsRq tag) should be used and the application should store any update
request message until the response from that message has been fully processed.  This
way, if an error occurs the application can determine the status of the request it most
recently sent to QuickBooks by re-sending it.
-   The SOAP interface defines a clear state model (see Figure 5-1) which applies on a per-
user basis.  However, the web imposes a somewhat stateless model, therefore it is
important for the web service to implement an understanding of the state for a given
user and the ticket that may or may not have been issued to the web connector on
behalf of that user so that the web service can detect a mismatch of state with the web
connector for a given user.  For example, if the web service receives an authenticate()
call for a particular user, but the service was expecting a call to receiveResponseXML()
this is an excellent indication that information was lost and the web service must
attempt to recover from the error (i.e. via the SDK’s error recovery mechanism).  More
trivially, if the web service is waiting for a call to closeConnection() and receives a call
to authenticate() then the web service can ignore the missing call, drop the old ticket for
the user and behave as though it were not connected.
Figure 5-1The Web Connector Service State Model
## NOTE
This has been simplified: error states are not shown.

How to Implement Interactive Mode 43
(c) 2022    Intuit Inc. All rights reserved.
