# Appendix A: Understanding and Responding to QBWC Error Codes
The following table lists the error codes and messages that can be returned from the QBWC
during normal operation. A Description column is also provided with notes for you, the
developer, and notes for your customers, in the event you wish to provide these details to
them.
Table A-1QBWC Errors and How to Handle Them
Error CodeError MessageMore Information
QBWC1000The domain names for
<AppName>'s service and
support URLs do not match.
The AppURL and AppSupport URLs must use the same
domain name.
## Developer:
Please check your application's QWC file to make sure the
<AppURL> and <AppSupport> both have same domain
name.
End user:
There is an error in the web application definition. Please
send the following to your application provider: -
- Capture a screenshot (hit Alt+PrtSc while the error
window is selected) of this error message.
- Include the QWCLog.txt file (generally in C:\Documents
and Settings\All Users\Application Data\Intuit\Quickbooks
Web Connector\version directory)
- Send a dump of the web connector registry settings. You
can do this from a command prompt by running "regedit /
E <AnyFilename>.reg HKEY_CURRENT_USER/Software/
Intuit/QB web connector/<YourAppNameHere>", where
AnyFilename is any name you want to give this dump file,
and YourAppNameHere is the name of the provider’s
application.
QBWC1001         The         application
<AppName>'s service URL
is an IP Address, it will not
be loaded.
No AppURL can be IP-address based. The URL must
contain a symbolic host name.
## Developer:
In your application's QWC file, instead of an IP address,
please use a host name for your <AppURL> value.
End user:
There is an error in the web application definition. Please
send the same information requested above for error
## QBWC1000.

84Appendix A: Understanding and Responding to QBWC Error Codes
(c) 2022 Intuit Inc.   All rights reserved.
QBWC1002The application
<AppName>'s support URL
is an IP Address, it will not
be loaded.
No AppSupport URL can be IP-address based. The URL
must contain a symbolic host name.
## Developer:
In your application's QWC file, instead of IP address, use a
host name for your <AppSupport> value.
End user:
There is an error in the web application's support address.
Please send the same information requested above for
error QBWC1000.
QBWC1003The application
<AppName>'s support URL
(AppSupport) could not be
reached.
No exception was thrown when trying to reach AppSupport
URL. However, HttpWebResponse.StatusCode returned
from web server was neither OK (Equivalent to HTTP
status 200) or Accepted (HTTP status 202)
## Developer:
Type the support URL in the error message in a web
browser and see if you can reach the web page. If not, you
need to make sure the URL is accessible from a web
browser.
End user:
There is a possible problem in accessing the web
application support page. Please send the same
information requested above for error QBWC1000.
QBWC1004The application
<AppName>'s support URL
(AppSupport) could not be
reached.
An exception was thrown when trying to reach the
AppSupport URL. In case of a WebException, a possible
problem and status description should be shown with the
error message.
## Developer:
Type the support URL in the error message in a web
browser and see if you can reach the web page. If not, you
need to make sure the URL is accessible from a web
browser.
End user:
There is a possible problem in accessing the web
application support page. Please send the same
information requested above for error QBWC1000.
Error CodeError MessageMore Information

## 85
(c) 2022    Intuit Inc. All rights reserved.
QBWC1005QuickBooks Web Connector
failed to run. Some trace
information was captured
during the failure. Please
see the QWCLog.txt file for
trace information.
A System.IO.FileNotFoundException is caught at this point.
QB web connector makes an attempt to re-create a new
QWCLog.txt and dump the stack trace for debugging.
## Developer:
QB web connector failed to run possibly because of not
finding the right log file. Check QWCLog.txt for more
information. Generally a stack trace is captured. QB web
connector makes an attempt to re-create a new
QWCLog.txt and dump the stack trace for debugging.
One possibility is that for some reason the expected log
directory was not found, and the current Windows user
doesn’t have permissions to create directories.
End user:
QB web connector failed to run possibly because it couldn’t
create the log file. One possibility is that for some reason
the expected log directory was not found, and the current
Windows user doesn’t have permissions to create
directories. Make sure your current Windows logon has
sufficient permissions to create directories.
QBWC1006QuickBooks Web Connector
failed to run. Some trace
information was captured
during the failure. Please
see QWCLog.txt file for
trace information.
Any exception other than
System.IO.FileNotFoundException has been caught at this
point.
## Developer:
QB web connector failed to run possibly because of any
cause other than finding the right log file. Reproduce the
issue with logging enabled (system tray - right click menu
- enable logging). Then, check QWCLog.txt for more
information. Generally a stack trace is captured in
QWCLog.txt.
End user:
Make sure the log file directory and/or log file are not write
protected. Otherwise, send the same information
requested above for error QBWC1000.
Error CodeError MessageMore Information

86Appendix A: Understanding and Responding to QBWC Error Codes
(c) 2022 Intuit Inc.   All rights reserved.
QBWC1007An error occurred when
connecting to QuickBooks.
<A Message from
QuickBooks will appear
here>. Please fix the
problem and click Retry to
try again.
Any time QB web connector connects to QuickBooks it will
try the connection twice.  This error code represents a
failure during the second connection attempt.
## Developer:
This is an error when QB web connector tried to connect
again to QuickBooks. Have your user follow the instruction
in the message (from QuickBooks) in the error screen.
Most common causes are that QuickBooks is not running,
and you need to start it, or make sure a company file is
open and no modal dialog box is open. Otherwise, a
message from QuickBooks is displayed.  Finally, retry the
task (generally an update operation, double-click/
download a QWC or load an application operation).
End user:
This is an error when QB web connector tried to connect to
QuickBooks. Follow the instruction in the message (from
QuickBooks) in the error screen. Most common causes are
that QuickBooks is not running, and you need to start it, or
make sure a company file is open and no modal dialog box
is open. Otherwise, a message from QuickBooks is
displayed. Finally, retry the task (generally an update
operation, double-click/download a QWC or load an
application operation)
QBWC1008Unable to connect to
QuickBooks. Task could not
be completed. Reason: <A
Message from QuickBooks
will appear here>
Any time QB web connector connects to QuickBooks it will
try the connection twice.  This error code represents a
failure during the second connection attempt.
## Developer:
This is an error when QB web connector tried to connect
again to QuickBooks. Have your user follow the instruction
in the message (from QuickBooks) in the error screen.
Most common causes are that QuickBooks is not running,
and you need to start it, or make sure a company file is
open and no modal dialog box is open. Otherwise, a
message from QuickBooks is displayed.  Finally, retry the
task (generally an update operation, double-click/
download a QWC or load an application operation).
End user:
This is an error when QB web connector tried to connect to
QuickBooks. Follow the instruction in the message (from
QuickBooks) in the error screen. Most common causes are
that QuickBooks is not running, and you need to start it, or
make sure a company file is open and no modal dialog box
is open. Otherwise, a message from QuickBooks is
displayed. Finally, retry the task (generally an update
operation, double-click/download a QWC or load an
application operation).
Error CodeError MessageMore Information

## 87
(c) 2022    Intuit Inc. All rights reserved.
QBWC1009 Unable to connect to
QuickBooks. Task could not
be completed. Reason: <A
Message from QuickBooks
will appear here>
Any time QB web connector connects to QuickBooks it will
try the connection twice.  This error code represents the
fact that a failure occurred during the first connection
attempt and then user chose to Cancel instead of Retry.
## Developer:
Have your end user follow the instruction in the message
(from QuickBooks) in the error screen. Most common
causes are that QuickBooks is not running, and you need
to start it, or make sure a company file is open and no
modal dialog box is open. Otherwise, a message from
QuickBooks is displayed. And finally retry the task
(generally an update operation, double-click/download a
QWC or load an application operation).
End user:
Follow the instruction in the message (from QuickBooks) in
the error screen. Most common causes are that
QuickBooks is not running, and you need to start it, or
make sure a company file is open and no modal dialog box
is open. Otherwise, a message from QuickBooks is
displayed. And finally, retry the task (generally an update
operation, double-click/download a QWC or load an
application operation).
QBWC1010Application <AppName>
cannot be loaded. For
security reasons only SSL
(https) based applications
are allowed.
AppURL needs to be SSL (https) based.
## Developer:
Make sure to setup your application to support https. You
could use http for development purposes in some case but
certainly not in production. Currently QB web connector
allows http and https for localhost only -- to provide ease
with your development effort. However, it does not allow
for http for any remote web servers.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1011Application named
<AppName> does not exist
in registry. It is possible
that the view and registry is
out of sync. Restart
QuickBooks Web Connector.
Generally, QB web connector UI shows a snapshot of the
applications listed in the system registry. Somehow the QB
web connector is out of sync with this system registry.
## Developer:
Have the end user exit from QB web connector and re-
start it. Once re-started, if user does not see the
application in the list, user may also need to manually add
the application QWC file to the Web Connector.
End user:
You need to exit from QB web connector and re-start it.
Once re-started, if you do not see the application in the
list, you may also need to add the application’s QWC file
you received from the service provider to the Web
## Connector.
Error CodeError MessageMore Information

88Appendix A: Understanding and Responding to QBWC Error Codes
(c) 2022 Intuit Inc.   All rights reserved.
QBWC1012Authentication failed due to
error message: <An error
message appears here>.
An exception was caught during the authenticate() call to
application. This could be either a client or a server side
problem.
## Developer:
A call to the WebMethod authenticate() failed with an
exception. Have your end user send you the QWCLog.txt
file just after the error occurred. It should contain a stack
trace for the exception caught. It's very possible the error
originated on your server, please check your server logs
for any web service exceptions.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1013Error connecting to
QuickBooks. Returning error
message to application.
<Error message from
QuickBooks appears here>.
QB web connector makes an attempt to connect to
QuickBooks during update operation. This error code
represents the fact that a failure occurred during this
connection attempt. Notice that you can get this error if
QuickBooks is running on Vista with UAC turned off.
## Developer:
Your web application should have received a
connectionError() call with the error message that QB web
connector received from QuickBooks.  You may need to
have your end user do the steps according to the
instruction in the error message from QuickBooks. Most
common causes are that QuickBooks is not running, and
you need to start it, or make sure a company file is open
and no modal dialog box is open. And then retry the
update operation.
End user:
There should be some information in the status window.
Take a screenshot (press Alt+PrtSc while the window is
selected) of the information and send it along with the
QWCLog.txt file (generally in C:\Documents and
Settings\All Users\Application Data\Intuit\Quickbooks Web
Connector\version directory) to your application provider.
QBWC1014Could not get Host/
Company/Preference Query
response from QuickBooks.
Job ending.  <An error
message from QuickBooks
appears here>.
During update in process, QB web connector was unable to
get and/or parse the Host/Company/Preference Query
response from QuickBooks.
## Developer:
Have your end user send you the QWCLog.txt file. It
should contain a stack trace for the exception caught.
End user:
Please send the same information requested above for
error QBWC1000.
Error CodeError MessageMore Information

## 89
(c) 2022    Intuit Inc. All rights reserved.
QBWC1015<An error message from
QuickBooks>
An exception was caught during EndSession and
CloseConnection call from QB web connector to
QuickBooks.
## Developer:
Have your end user send you the QWCLog.txt file. It
should contain a stack trace for the exception caught.
End user:
pdate completed at this time but QB web connector could
not end its communication with QuickBooks.
Please send the same information requested above for
error QBWC1000.
QBWC1016No application was selected
for update.
User clicked Update in Web Connector without first
selecting any applications to update.
## Developer:
Have end user select the application by checking the
checkbox at the left of the application name and then hit
"Update Selected"
End user:
Select the application by checking the checkbox at the left
of the application name and then click Update Selected.
QBWC1017The following applications
could not be updated.
Applications named <A list
of web applications that
were not updated at this
time>.
When there are multiple applications being updated, this
error shows a list of applications that was not updated
successfully.
## Developer:
This error code just lists the applications when multiple
applications are being updated. You would need to get
QWCLog.txt file from the user to determine what
happened to each individual web applications.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1018No application available to
select at this time.
User clicked on "Select All" button when there is no
application loaded in QB web connector.
## Developer:
User clicked on "Select All" button when there is no
application loaded in QB web connector. User needs to load
an application first.
End user:
You clicked on "Select All" button when there is no
application loaded in QB web connector. You need to load
an application first. You could either locate the QWC file
that your application provide gave you and double-click it
to load it in QB web connector or you could use Load
button from QB web connector and browse to the QWC file
your application provider sent you
Error CodeError MessageMore Information

90Appendix A: Understanding and Responding to QBWC Error Codes
(c) 2022 Intuit Inc.   All rights reserved.
QBWC1019No application available to
un-select at this time.
User clicked on "Select None" button when there is no
application loaded in QB web connector.
## Developer:
User clicked on "Select None" button when there is no
application loaded in QB web connector. User need to load
an application first.
End user:
You clicked on "Select None" button when there is no
application loaded in QB web connector. You need to load
an application first. You could either locate the QWC file
that your application provide gave you and double-click it
to load it in QB web connector or you could use Load
button from QB web connector and browse to the QWC file
your application provider sent you.
QBWC1020There are scheduled jobs.
Web Connector will not be
able to run these jobs if you
exit. Do you still want to
exit?
User has a scheduled update service set in QB web
connector when user attempted to exit.
## Developer:
Either user need to un-select scheduling (Auto-Run) before
exiting QB web connector or do a forced exit by choosing
"Yes.
End user:
You need to either un-select scheduling (Auto-Run) before
exiting QB web connector or do a forced exit by choosing
"Yes".
QBWC1021<An error message from
QuickBooks>
An exception was thrown when trying to determine latest
version of QBXMLRP supported by the QuickBooks running.
## Developer:
There may be a problem trying to determine the latest
version of QBXMLRP supported by the QuickBooks running.
The error screen shot should show a hint and the
QWCLog.txt file should show a stack trace.
End user:
Please send the same information requested above for
error QBWC1000.
Error CodeError MessageMore Information

## 91
(c) 2022    Intuit Inc. All rights reserved.
QBWC1022An error occurred when
connecting to QuickBooks.
<An error message from
QuickBooks appears here>.
Please fix the problem and
click OK to try again.
The error occurred when trying to search for FileID (while
adding this application to registry) for this application.
Any time QB web connector connects to QuickBooks it will
try the connection twice. This error code represents a
failure during the first connection attempt.
## Developer:
This is an error when QB web connector tried to connect to
QuickBooks. Have your user follow the instruction in the
message (from QuickBooks) in the error screen. Most
common causes are that QuickBooks is not running, and
you need to start it, or make sure a company file is open
and no modal dialog box is open. Otherwise, a message
from QuickBooks is displayed.
End user:
This is an error when QB web connector tried to connect to
QuickBooks. Follow the instruction in the message (from
QuickBooks) in the error screen. Most common causes are
that QuickBooks is not running, and you need to start it, or
make sure a company file is open and no modal dialog box
is open. Otherwise, a message from QuickBooks is
displayed.
QBWC1023Unable to connect to
QuickBooks. Task could not
be completed.  Reason:
<An error message from
QuickBooks appears here>.
The error occurred when trying to search for FileID (while
adding this application to registry) for this application.
Any time QB web connector connects to QuickBooks it will
try the connection twice. This error code represents a
failure during the second connection attempt.
## Developer:
This is an error when QB web connector tried to connect
again to QuickBooks. Have your user follow the instruction
in the message (from QuickBooks) in the error screen.
Most common causes are that QuickBooks is not running,
and you need to start it, or make sure a company file is
open and no modal dialog box is open. Otherwise, a
message from QuickBooks is displayed. And finally, retry
the task (generally double-click/download a QWC or load
an application operation).
End user:
This is an error when QB web connector tried to connect to
QuickBooks. Follow the instruction in the message (from
QuickBooks) in the error screen.  Most common causes are
that QuickBooks is not running, and you need to start it, or
make sure a company file is open and no modal dialog box
is open. Otherwise, a message from QuickBooks is
displayed. And finally, retry the task (generally double-
click/download a QWC or load an application operation).
Error CodeError MessageMore Information

92Appendix A: Understanding and Responding to QBWC Error Codes
(c) 2022 Intuit Inc.   All rights reserved.
QBWC1024Unable to connect to
QuickBooks. Task could not
be completed. Reason: <An
error message from
QuickBooks appears here>.
The error occurred when trying to search for FileID (while
adding this application to registry) for this application. Any
time QB web connector connects to QuickBooks it will try
the connection twice.  This error code represents the fact
that a failure occurred during the first connection attempt
and then user chose to Cancel instead of Retry.
## Developer:
Have your user follow the instruction in the message (from
QuickBooks) in the error screen.  Most common causes are
that QuickBooks is not running, and you need to start it, or
make sure a company file is open and no modal dialog box
is open. Otherwise, a message from QuickBooks is
displayed. And finally, retry the task (generally double-
click/download a QWC or load an application operation).
End user:
Follow the instruction in the message (from QuickBooks) in
the error screen.  Most common causes are that
QuickBooks is not running, and you need to start it, or
make sure a company file is open and no modal dialog box
is open. Otherwise, a message from QuickBooks is
displayed. And finally, retry the task (generally double-
click/download a QWC or load an application operation).
QBWC1025Exiting the application.
<An error message from
QuickBooks appears here>.
The error occurred when trying to search for FileID (while
adding this application to registry) for this application.  A
connection from QB web connector to QuickBooks was
successful. However, an exception was thrown during the
FileID find operation.
## Developer:
Have your end user enable logging and send you the
QWCLog.txt file. It should contain an exception message.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1026There was some problem
adding fileID.
When trying to register FileID (while adding this
application to registry) for a new application, QuickBooks
did not return statusCode as 0 which indicates a possible
problem during creation of the FileID.
## Developer:
It may be because the FileID is already in use. Try using a
different FileID value in your applications QWC file.
End user:
Please send the same information requested above for
error QBWC1000.
Error CodeError MessageMore Information

## 93
(c) 2022    Intuit Inc. All rights reserved.
QBWC1027Exiting the application. <An
error message from
QuickBooks>.
When trying to register FileID (while adding this
application to registry) for a new application, an exception
was caught.
## Developer:
Have your end user enable logging and send you the
QWCLog.txt file. It should contain an exception message.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1028Exception encrypting. <A
message describing the
cause of error>.
There was a problem encrypting the password entered by
user. The error message should show useful information.
## Developer:
The error message should show useful information. Have
your end user enable logging and send you the
QWCLog.txt file. It should contain an exception message.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1029Exception decrypting. <A
message describing the
cause of error>
There was a problem decrypting the password.
## Developer:
The error message should show useful information. Have
your end user enable logging and send you the
QWCLog.txt file. It should contain an exception message.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1030Password is not available for
application named
<AppName>. Please set the
password for this
application.
User forgot to set password before requesting an update.
## Developer:
Have your user set the password in QB web connector for
this application.
End user:
Set the password in QB web connector for this application.
If you don't know your password, please contact your
application provider the support url available at the QB
web connector UI or QWC file.
QBWC1031Operation completed with
some error. Application has
been notified of the error
accordingly. See local log
for further information.
This error indicates that there was an error during
scheduled update operation.
## Developer:
Have your user send you the QWCLog.txt file. It should
contain an exception message.
End user:
Please send the same information requested above for
error QBWC1000.
Error CodeError MessageMore Information

94Appendix A: Understanding and Responding to QBWC Error Codes
(c) 2022 Intuit Inc.   All rights reserved.
QBWC1032Could not find application
<AppName> in registry to
complete scheduled update.
This error indicates that QB web connector was unable to
find the application in registry during scheduled update
operation.
## Developer:
It may be possible that the application has been removed
or deleted from windows registry. Have your user uncheck
Auto-run, exit and re-start QB web connector so that it
reloads the application again. User may need to reload the
application by loading QWC file.
End user:
Uncheck Auto-run, exit and re-start QB web connector so
that it reloads the application again. If the problem
persists restore the application by reloading the
application’s QWC file.
QBWC1033QB web connector failed to
initialize QWCLog.txt file
and will not run. Please
make sure QWCLog.txt file
is writable and then try
again.
QB web connector was unable to use the QWCLog.txt file.
The QWCLog.txt file may not have read-write permission
set.
## Developer:
Check the properties of QWCLog.txt file (generally in
C:\Documents and Settings\All Users\Application
Data\Intuit\Quickbooks Web Connector\version directory).
Possible causes could be that the directory for QWCLog.txt
file does not exist, file attributes are set to ReadOnly,
QWCLog.txt is a file and not a directory, or user’s hard disk
file system is full.
End user:
Check the properties of QWCLog.txt file (generally in
C:\Documents and Settings\All Users\Application
Data\Intuit\Quickbooks Web Connector\version directory).
Possible causes could be that the directory for QWCLog.txt
file does not exist, File attributes are set to ReadOnly,
QWCLog.txt is a file and not a directory, or your hard disk
file system is full.
QBWC1034Error setting AuthFlags -
<An error from QuickBooks
appears here>.
This error indicates that there was an error during the
attempt to set AuthFlags for the QBXMLRP2 Request
Processor. Possible problem in QBXMLRP2 installation.
## Developer:
Examine the QWCLog.txt for a root cause. Have your end
user enable logging and send you the QWCLog.txt file. It
should contain an exception message. If none available,
try re-installing QBXMLRP2 on end user's system.
End user:
Please send the same information requested above for
error QBWC1000.
Error CodeError MessageMore Information

## 95
(c) 2022    Intuit Inc. All rights reserved.
QBWC1035Dns.Resolve(localhost)
failed due to Exception --
<An eror message
describing the possible root
cause of the failure>.
Either Dns.Resolve() on localhost is not working. Possibly,
a "ping localhost" will fail. Or, the QB Web Connector
system failed to process Dns.Resolve() call.
## Developer:
Try doing a host file entry to
%WINDIR%\system32\drivers\etc\hosts: 127.0.0.1
localhost localhost.localdomain.com
localhost.home.localdomain.com  If the possible root cause
indicate a failure to process Dns.Resolve() call, you may
need to contact IDN Developer Support. You should never
send a "localhost" qwc file out to your end user. This
problem should come up only during development.
End user:
Your application provider most likely provided the wrong
QWC file. In the QWC file, the AppURL or AppSupport with
localhost is intended for only development purposes. Your
QWC file should contain a qualified web address for
AppURL and AppSupport. Contact your application provider
to get the correct QWC file.
QBWC1036Error countered during
version check: <An error
message describing possible
root cause of the failure>.
There was a problem while WebMethod clientVersion() was
being processed. It could be a possible SOAP problem.
Stack trace in QWCLog.txt file should reveal further
information.
## Developer:
There was a problem while WebMethod clientVersion() was
being processed. It could be a possible SOAP problem.
Stack trace in QWCLog.txt file should reveal some clue.
have your end user send you the QWCLog.txt file. It
should contain an exception message. This is an exception
that was caught during processing of the clientVersion()
call. It could be a SOAP server or client (QB web
connector) problem. This error has nothing to do with the
clientVersion() warning or error your application is trying
to send via this method.
End user:
Please send the same information requested above for
error QBWC1000.
Error CodeError MessageMore Information

96Appendix A: Understanding and Responding to QBWC Error Codes
(c) 2022 Intuit Inc.   All rights reserved.
QBWC1037Application sent following
error or warning message
when checking version of
QB web connector. Update
aborted. <An error or
warning message from web
application appears here>
This is an error that web application sent to QB web
connector when processing the QB. Generally, "E:<any
text>" instructs QB web connector to abort this data
processing and force user to download a new version of QB
web connector. "W:<any text>" instructs QB web
connector to give user a choice to continue this update or
not.
## Developer:
Explain to your end user why your application sent this
message with E: or W: and then have them upgrade QB
web connector, if needed.
End user:
Follow the instruction in the message box -- generally
shows some instruction from the web application. Most of
the cases, application is asking you to upgrade your QB
web connector. If confused about the message, take a
screen shot of the message box and contact your
application provider.
QBWC1038User cancelled from master
key input. Need master key
to continue. If you forgot
master key, you would need
to re-enter password again
to reset the master key.
User was prompted for master key to decrypt the
password. At this point, user either entered an invalid
master key or cancelled out from master key input.
## Developer:
Have your end user enter the correct master key. If they
forgot the master key, they would need to reset the
master key by resetting their password. No need to repeat
this master key input for all other web application
passwords. They will be automatically encrypted using the
new master key.
End user:
Enter the correct master key. If you forgot the master key,
you would need to reset the master key by resetting your
password. No need to repeat this master key input for all
other web application passwords. They will be
automatically encrypted using the new master key.
QBWC1039There was a problem adding
the application to registry.
Check QWCLog.txt for
details.
The QWC file may be missing some required elements.
## Developer:
Run the QWC file through the validator. It may have
missing elements. Also, the QWCLog.txt file should contain
some information.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1040Web connector did not
provide a valid username
and/or password.
The application is not set with a password or set with an
incorrect password
## Developer:
Make sure your user knows the correct password to type in
the Web Connector UI.
End user:
You need to obtain the correct password from your
application provider and then type it in password text box
and hit enter to set the password.
Error CodeError MessageMore Information

## 97
(c) 2022    Intuit Inc. All rights reserved.
QBWC1041SendRequestXML failed due
to error message: <An
error message appears
here>.
An exception was caught during the sendRequestXML() call
to application. This could be either a client or a server side
problem.
## Developer:
A call to the WebMethod sendRequestXML() failed with an
exception. Have your end user send you the QWCLog.txt
file just after the error occurred. It should contain a stack
trace for the exception caught. It's very possible the error
originated on your server, please check your server logs
for any web service exceptions.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1042ReceiveResponseXML failed
due to error message: <An
error message appears
here>.
An exception was caught during the receiveResponseXML()
call to application. This could be either a client or a server
side problem.
## Developer:
A call to the WebMethod receiveResponseXML() failed with
an exception. Have your end user send you the
QWCLog.txt file just after the error occurred. It should
contain a stack trace for the exception caught. It's very
possible the error originated on your server, please check
your server logs for any web service exceptions.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1043getLastError failed due to
error message: <An error
message appears here>.
An exception was caught during the getLastError() call to
application. This could be either a client or a server side
problem.
## Developer:
A call to the WebMethod getLastError() failed with an
exception. Have your end user send you the QWCLog.txt
file just after the error occurred. It should contain a stack
trace for the exception caught. It's very possible the error
originated on your server, please check your server logs
for any web service exceptions.
End user:
Please send the same information requested above for
error QBWC1000.
Error CodeError MessageMore Information

98Appendix A: Understanding and Responding to QBWC Error Codes
(c) 2022 Intuit Inc.   All rights reserved.
QBWC1044CloseConnection failed due
to error message: <An
error message appears
here>.
An exception was caught during the closeConnection() call
to application. This could be either a client or a server side
problem.
## Developer:
A call to the WebMethod closeConnection() failed with an
exception. Have your end user send you the QWCLog.txt
file just after the error occurred. It should contain a stack
trace for the exception caught. It's very possible the error
originated on your server, please check your server logs
for any web service exceptions.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1045ConnectionError failed due
to error message: <An
error message appears
here>.
An exception was caught during the connectionError() call
to application. This could be either a client or a server side
problem.
## Developer:
A call to the WebMethod connectionError() failed with an
exception. Have your end user send you the QWCLog.txt
file just after the error occurred. It should contain a stack
trace for the exception caught. It's very possible the error
originated on your server, please check your server logs
for any web service exceptions.
End user:
Please send the same information requested above for
error QBWC1000.
QBWC1046Application sent incorrect
syntax return value for
clientVersion(). Error
message: < An error
message describing possible
root cause of the failure>.
Update cannot continue.
There was a problem while WebMethod clientVersion() was
being processed. Most likely problem is that the syntax of
the return value from application was incorrect.
## Developer:
QWCLog.txt should contain an exception message. This is
an exception that was caught during processing of the
returned value for clientVersion() call.
End user:
Please send the same information requested above for
error QBWC1000.
## QBWC1048
QuickBooks Web Connector
could not verify the web
application server
certificate.
A web service is using a cert URL which requires
authentication. One solution could be removing
authentication from your cert URL.
