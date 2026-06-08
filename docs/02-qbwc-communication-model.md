# Chapter 2: The QBWC Communication Model
In QBWC-to-web service communication, the typical QB/QBPOS SDK application pattern
is turned a bit upside-down. In a typical QB/QBPOS SDK application, the application
contacts QuickBooks or QuickBooks POS when it needs access.
In QBWC-to-web service communication, it is QBWC that contacts the application (the
web service) to ask whether that application wants to access QuickBooks/QuickBooks
POS. The QuickBooks/QuickBooks POS user decides how often QBWC “polls” your web
service by using the scheduler feature inside QBWC. Figure 2-1 illustrates this
communication flow.
Figure 2-1QBWC and Web Service Communication Flow
A Closer Look at the Communication Model
The communication flow overview shown in the following figures gives some pretty good
hints as to how your web service needs to be structured to talk to the Web Connector. The
Web Connector will be calling into your web service and that your web service will need to
supply certain callback methods that will be expected by the Web Connector in order to
support the communication flow. Your web service must implement all of the callbacks
shown in the figures. (For detailed descriptions and sample code for each callback, see
Chapter 10, “QBWC Callback Web Method Reference.”)

20Chapter 2: The QBWC Communication Model
(c) 2022 Intuit Inc.   All rights reserved.
To implement the callbacks in your web service, you’ll need a more precise picture of what
is transpiring within the QBWC-web service communication. So, take a look at the
following illustrations as well as the running commentary provided with each drawing.
Figure 2-2clientVersion and authenticate callbacks
What Figure 2-2 shows is what happens when a user at the QBWC clicks the Update button
or when a scheduled Update for a web service occurs. Here is what happens:

A Closer Look at the Communication Model 21
(c) 2022    Intuit Inc. All rights reserved.
-   First, QBWC calls your clientVersion callback to let your web service know which
QBWC version is calling. The purpose of this is to let you warn your user or even stop
the update if your web service doesn’t support that QBWC version. Notice that if your
web service doesn’t have the optional clientVersion callback, QBWC proceeds to the
authenticate call. In fact, QBWC always proceeds to call authenticate unless it receives
a message string prefixed by the two characters “E:” or the two characters “O:” (O as in
Oscar, not zero).
You can append a string after the colon; for E: this would be an error string, for O: this
would be a QBWC version string, which is used to tell the user at the client end what
QBWC version your web service requires.
-   Next, QBWC calls your authenticate callback, supplying the username you provided
your user via the QWC file, as described in Chapter 4, “Building The QWC File for
Your Users.” QBWC also sends the password that you supplied to your user and whic
h
the user has stored into QWBC.
Your return to the authenticate call will be a string array with a maximum of f
our
strings.
The first member of the array is a session token, which could be a GUID or anything
else that you want to use to identify the session. This token will be returned by QBWC
in subsequent callbacks in the session.
The second member of the string array can contain a variety of things.
a.   If the username and password in the authenticate call is invalid, you would supply
the value “nvu”.
b.   If on the other hand the user data is valid but you have no work to do for that user,
yo
u would supply the value “none
## ”.
c.   If you do have work to do for the that user, you can supply the full pathname of the
company to be used in the current update.
d.   If you want to use whatever QuickBooks company is currently open at the client
end, simply supply an empty string.
The optional third member of the string array contains the number of seconds to
wai
t before the next update. You would use this to in effect tell that QBWC clie
nt
not to bother you for a specified time.
The optional fourth member of the string array contains the number of seconds to
be used as the MinimumRunEveryNSeconds time for your web service, which tells
QBWC how frequently your web service needs to be contacted.
What happens when QBWC gets this string array? If the second member of the string array
contains “none” or “nvu”, QBWC will display a message, call closeConnection, and stop
the session.

22Chapter 2: The QBWC Communication Model
(c) 2022 Intuit Inc.   All rights reserved.
If the second member contains a string with any other value, including an empty string,
QBWC will use that string as the path to the company file and will attempt to open it; an
empty string means use the currently open company file.
If the connection attempt fails, QBWC calls connectionError, and uses the pathname string
returned from connectionError to retry the connection until the connectionError callback
tells it to stop.
Figure 2-3sendRequestXML, getLastError, and getInteractiveURL
What Figure 2-3 shows is what happens if the clientVersion and authenticate calls
succeeded and resulted in further work. QBWC invokes OpenConnection and BeginSession
on the indicated company and calls your sendRequestXML callback.
-   QBWC invokes sendRequestXML once the connection and session with QB or QBPOS
is started. If your web service is a QB web service, the first time QBWC calls
sendRequestXML in the session, it fills the strHCPResponse parameter with the results
of a HostQuery, CompanyQuery, and PreferencesQuery, as this data can be useful for
your web service when it constructs requests. If your web service is a QBPOS web
service, the first time QBWC calls sendRequestXML it fills the strHCPResponse
parameter with the string “HOSTQUERY/COMPANYQUERY/PREFQUERY is
currently not supported in QBPOS.” For all subsequent invocations of
sendRequestXML during the session, strHCPResponse contains only an empty string,
for both QBPOS and for QB.

A Closer Look at the Communication Model 23
(c) 2022    Intuit Inc. All rights reserved.
-   If the return from sendRequestXML is not empty, QBWC passes the supplied string to
the QB or QBPOS request processor to be handled. The string must be a validly
constructed qbposXML or qbXML request message set
If the return from your sendRequestXML callback is an empty string, QBWC call
s
getLastError to see whether your web service needs to:
a.   Report an error, in which case an error string would be returned from you
r
getLastError callback
b.   Wait a few seconds before calling sendXMLRequest again, in which case the string
“NoOp” would be returned.
c.   Start interactive mode, in which case the string “Interactive mode” would be
returned.
-   As shown in Figure 2-3, if the string “Interactive mode” is returned at this point from
getLastError, QBWC calls getInteractiveURL and starts a web browser open to the
page specified in the return to this call.
Figure 2-4QBWC callbacks for interactive mode
-   As hinted at in Figure 2-4, just because the web service wants interactive mode doesn’t
mean it will get it. QBWC must ask the user if they authorize interactive mode by
popping up a dialog. If the user responds with “no” or if the user is not there, then
QBWC calls the interactiveRejected callback to let the web service know about this.
Your callback does whatever you need it to do, but all you need to return is some sort of
message you want displayed to your user.
-   If the user does authorize interactive mode, then the user will be taken to your web
page and will be doing whatever supported activities are available at that page. You will
handle user input and respond by invoking docontrol and/or doquery as described in the
chapter “Interacting Directly with the Web Connector”.
-   While the user is doing this, or until there is a timeout because the user got tired and
went to lunch, QBWC will periodically call interactiveDone to see if you are finished.

24Chapter 2: The QBWC Communication Model
(c) 2022 Intuit Inc.   All rights reserved.
If you are finished or if you know that there is a timeout, return an empty string in the
callback to end the interactive mode session.
Figure 2-5Finishing the communication
-   If there is no interactive mode, then the return from sendRequestXML contains qbXML
or qbposXML requests. QBWC hands this off to QB or QBPOS and once it has
responses, sends them to your web service by calling receiveResponseXML. The data
returned by QB or QBPOS in response to the incoming requests is supplied in the
QBWC receiveResponseXML, in the response parameter. Your callback returns a
negative integer if there are any errors, such as out of sequence calls due to network
problems. Otherwise, it returns a positive integer between 0 and 100, indicating the
percentage of work done up to that point, with a value of 100 meaning that the update
activity is finished. If there is work left, then QBWC calls sendRequestXML again to
allow your web service to continue its work.
-  If the return from receiveResponseXML is a negative integer, QBWC calls
getLastError to allow your web service to supply some message string to inform the
user. This message is displayed by QBWC and then QBWC invokes closeConnection
to end the session.

A Closer Look at the Communication Model 25
(c) 2022    Intuit Inc. All rights reserved.
-  If not called prior to this point by some error condition, once all update activity is
finished, as indicated by the web service’s return to the receiveResponseXML call, then
QBWC invokes closeConnection and ends the current update session.

26Chapter 2: The QBWC Communication Model
(c) 2022 Intuit Inc.   All rights reserved.

## 27
(c) 2022    Intuit Inc. All rights reserved.
