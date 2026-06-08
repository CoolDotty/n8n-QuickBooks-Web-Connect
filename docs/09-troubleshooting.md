# Chapter 9: How Do I Troubleshoot Problems?
When the QB web connector runs into an error condition originating from web connector
operations or from the web service itself, the web connector displays an error message. The
various possible error messages, descriptions, and suggested remedies are listed in
Appendix A, “Understanding and Responding to QBWC Error Codes.”
However, in many cases, you will need to start your troubleshooting by determining
whether your user has a valid and working web connector and a working connection to the
outside world (internet). To help you and your user test for a working installation, Intuit
hosts a troubleshooting page that contains a dummy web service and a corresponding QWC
file for it. This chapter briefly describes this troubleshooting page.
## About Logging
The Web Connector supports three log levels:
•NONE = No logging
•DEBUG (default setting) = Logging + first 50 characters of request/response xml
•VERBOSE = Logging + complete request/response xml
How Do I Get to the Troubleshooting Page?
On the theory that it never hurts to state the obvious, let’s put it on record that you have to
have a working Internet connection in order to get to the troubleshooting page. If this is the
case, then you get to the QBWC troubleshooting main page by clicking on the Troubleshoot
button in the web connector UI, as shown in Figure 9-1 on page 56.

56Chapter 9: How Do I TroubleShoot Problems?
(c) 2022 Intuit Inc.   All rights reserved.
Figure 9-1The Web Connector Troubleshoot button
The main troubleshooting page should pop up for you in the web browser (Figure 9-2 on
page 57):

How Do I Get to the Troubleshooting Page? 57
(c) 2022    Intuit Inc. All rights reserved.
Figure 9-2QBWC Troubleshooting Main Page
This routing page is pretty self explanatory. The QuickBooks link leads to the page where
you get the QWC for a QuickBooks-oriented web service and the QuickBooks POS link
leads to the page where you get the QWC for a QuickBooks POS-oriented web service.
Take a look at the web “landing” pages corresponding to each of these links in Figure 9-3
on page 58and Figure 9-4 on page 59.

58Chapter 9: How Do I TroubleShoot Problems?
(c) 2022 Intuit Inc.   All rights reserved.
Figure 9-3Troubleshooting page for QuickBooks

What Is Provided at the Troubleshooting Pages? 59
(c) 2022    Intuit Inc. All rights reserved.
Figure 9-4Troubleshooting page for QuickBooks POS
What Is Provided at the Troubleshooting Pages?
The test page for QuickBooks provides a dummy web service and QWC file that works
with any QuickBooks company. All you have to do is double-click the QWC file to add it
to the web connector and manually add the password displayed on the web page.
The test page for QuickBooks POS provides a dummy web service and QWC file that
works with any QuickBooks POS company. As with the QuickBooks page, simply double-
click the QWC file to add it to the web connector and manually add the password displayed
on the troubleshooting page.
After you add the dummy web service and password, make sure QuickBooks or
QuickBooks POS is running with a company open. Then perform an update on the web
service and read the results. The results of the update indicate success or failure and are
shown on the troubleshooting website.

60Chapter 9: How Do I TroubleShoot Problems?
(c) 2022 Intuit Inc.   All rights reserved.

## 61
(c) 2022    Intuit Inc. All rights reserved.
