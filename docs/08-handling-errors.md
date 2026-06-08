# Chapter 8: Handling Errors
In most communications between your web service and QuickBooks (via the web
connector!), things for the most part will proceed happily after the web connector starts
things off.
However, error conditions will occasionally occur and your web service must be able to
handle them properly when they do. The error conditions your web service must handle will
be one of the following types of error:
•The web connector cannot access QuickBooks for some reason, preventing further data
exchange
•The web service received unexpected data from the web connector, preventing further
data exchange
•The web service encounters an unexpected state: that is, it received an out-of-sequence
web connector call indicating a potential disruption caused by network problems.
Before further data exchange, error recovery must be performed
We’ll describe how to handle these scenarios in this chapter.
The Web Connector Cannot Access QuickBooks
## IMPORTANT
Don’t retry the same operation in response to the
connectionError more than a couple of times. If the problem
isn’t resolved after a couple of tries, use getLastError to notify
the user about the problem.
When the web service responds to the web connector’s authenticate method call by
indicating there is data to be exchanged with QuickBooks, the web connector calls the
OpenConnection and BeginSession methods of the QuickBooks XML Request Processor.
If either of those calls fail for any reason, the web connector will display the error code and
error message to the user, and it will let your web service know about the error via the call
connectionError, which has the following signature:
string connectionError(string strTicket,
string strHresult,
string strMessage)
where the HRESULT is provided (in HEX) along with the message from the exception
thrown by the request processor.

52Chapter 8: Handling Errors
(c) 2022 Intuit Inc.   All rights reserved.
Typical causes for this type of error is that the company file requested could not be found or
the file requested is not the file currently open in QuickBooks. But there could be numerous
other causes: see Appendix A for a list of the possible errors.
How Your Web Service Should Respond to QB Access Errors
How should your web service respond to this category of error? Your web service should do
one of two things:
(1 ) Return the string “done” which tells the web connector that the web service cannot
pr
oceed further and is stopping.
## Or,
(2 ) IF your web service wants to try a different company, supply the company pathname in
the returned string. (You can supply an empty string if you want to use whatever company
file happens to be open.) The web connector will respond by attempting to connect to
QuickBooks again using that supplied string.
Why Would a Web Service Try a Different Company?
Why would a web service perform the second of these actions instead of simply just
stopping altogether? In practice this approach is used when the web service remembers the
company file path from session to session (a recommended practice) and wants to have a
fall-back to use whatever company file is currently open in QuickBooks (by responding to
the connectionError call with an empty string).
This is not as haphazard as it might seem. When a web service is added to the web
connector, the web connector stores a unique FileID as a private data extension in the
specified company. As a result, the web service can always verify that it is talking to the
expected company file simply by checking the CompanyRet returned to your web service in
the web connector’s first sendRequestXML call in the data exchange sequence. (Check the
data extension list for the expected FileID.)
The Web Service Gets Unexpected Data from Web Connector
In some cases, your web service may receive a sendRequestXML or a
receiveResponseXML call that contains unexpected data. For example, there may be an
XML parse error, or an expired ticket, or other unexpected data from QuickBooks. If this
happens, your web service must first tell the web connector that an error has occurred and
then handle the follow-up getLastError call from the web connector.

The Web Service Encounters an Unexpected State 53
(c) 2022    Intuit Inc. All rights reserved.
How Your Web Service Should Respond to Unexpected Data
How do you tell the web connector that an error occurred, in the “opinion” of the web
service? If the problem data was sent in the sendRequestXML call, simply return an empty
string to the sendRequestXML call. If the problem data was sent in the
receiveResponseXML call, simply return a negative value to the receiveResponseXML
call.
The web connector responds to this error condition by calling the getLastError method:
string getLastError(string strTicket)
Your web service should respond to this call by returning a message string describing the
problem and any other information that you want your user to see. The web connector
writes this message to the web connector log for the user and also displays it in the web
connector’s Status column. The web connector will then terminate the connection to the
web service by calling closeConnection.
The Web Service Encounters an Unexpected State
Your web service must maintain a certain state information during the current session. For
example, if the web connector has just called sendRequestXML, then the web service
should expect the next call to be either receiveResponseXML or getLastError (if your web
service indicated an error when it responded to the sendRequestXML).
If this expected call sequence does not occur, for example, if sendRequestXML is called
instead, or authenticate is called, this indicates some type of communication failure. The
communication between the web connector and the web service has been disrupted in some
unexpected way such as a network failure.
If you just sent in some queries, you can simply resend them. But if you sent requests that
wrote data to QuickBooks, you don’t want to blindly just send those same data-writing
requests again. How do you know whether the requests you sent actually made it into
QuickBooks, or whether the failure occurred before this happened?
To determine this, use the error-recovery capabilities provided in the QB SDK, as
documented in the QB SDK Programmer’s Guide, using the oldMessageSetID and
newMessageSetID attributes as described in that document.

54Chapter 8: Handling Errors
(c) 2022 Intuit Inc.   All rights reserved.

## About Logging 55
(c) 2022    Intuit Inc. All rights reserved.
