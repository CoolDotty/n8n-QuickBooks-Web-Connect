

Intuit QuickBooks
## ®
## SDK
QuickBooks Web Connector
## Programmer’s Guide
## Version 2.0

QBWC version 2.0, released May 2009. (c) 2022 Intuit Inc. All rights
reserved.
QuickBooks and Intuit are registered trademarks of Intuit Inc.  All other
trademarks are the property of their respective owners and should be treated
as such.
Acknowledgement: This product includes software developed by the Apache
## Software Foundation (<http:
## //www.apache.org>) (c) 1999-2004 The Apache
Software Foundation. All rights reserved.
## Intuit Inc.
P.O. Box 7850
Mountain View, CA 94039-7850
For more information about the QuickBooks SDK and the SDK
documentation, visit http://developer.intuit.com/QuickBooksSDK/.

## Contents 3
(c) 2022    Intuit Inc. All rights reserved.
Who Should Read This Guide . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  7
Before You Begin  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  7
What’s New in This Release . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  7
Chapter 1: Introduction to QBWC Programming
QuickBooks Supported by QBWC  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  9
Why Do I Need to Support QBWC in My Web Service?. . . . . . . . . . . . . . . . . . . . . . . .  9
What is the COM Issue and How Does QBWC Solve This? . . . . . . . . . . . . . . . . . . .  9
What is the Firewall Issue and How Does QBWC Solve That?  . . . . . . . . . . . . . . .  10
Are There Any Alternatives to QBWC? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  12
The QBWC-to-Web Service Communication Universe  . . . . . . . . . . . . . . . . . . . . . . .  12
Initial Customer Interaction with Your Web Service . . . . . . . . . . . . . . . . . . . . . .  12
Ongoing Communication Between QBWC and a Web Service  . . . . . . . . . . . . . . .  14
What Will My Web Service Solution Look Like? . . . . . . . . . . . . . . . . . . . . . . . . . . . .  14
How to Build a QWC File. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  14
How to Build QBWC Support into Your Web Service . . . . . . . . . . . . . . . . . . . . . .  15
Are There Samples to Jumpstart My Work? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  15
Frequently Asked Questions. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  15
What Platforms and Languages can I use in my Implementation? . . . . . . . . . . . .  15
Why Do I Need SOAP? 15
Which QuickBooks/QB POS Versions Support QBWC?. . . . . . . . . . . . . . . . . . . . .  16
Can I Specify Which QuickBooks Editions Access My Service? . . . . . . . . . . . . . . .  16
Does My Web Service Need a Certificate to Access QBWC? . . . . . . . . . . . . . . . . .  17
Developing a Web Service Without Certificates 17
Where is the QBWC WSDL?  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  17
Is There a Limit to the Number of Messages I Send to QBWC? . . . . . . . . . . . . . .  17
Why QBWC and Not a Simple Web Interface? . . . . . . . . . . . . . . . . . . . . . . . . . .  17
Chapter 2: The QBWC Communication Model
A Closer Look at the Communication Model . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  19
Chapter 3: Implementing a Web Service for QBWC
Generating and Implementing the Service Skeleton with .NET  . . . . . . . . . . . . . .  27
Generating and Implementing the Service Skeleton with Java and Apache Axis  . .  31
Chapter 4: Building The QWC File for Your Users
A Sample QWC File . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  33
How Do I Set the QBWCXML Fields in the QWC File? . . . . . . . . . . . . . . . . . . . . .  34
Is the Order of the Tags Important? 38
Can I Start Developing Without All That “Cert” Stuff? 38
Can I Run My Web Service in “Real Time”? 39
Can I Stop My Users From Running Updates in “Real Time”? 39
Can I Specify Run EveryNSeconds and RunEveryNMinutes in one QWC File? 39

4Contents
(c) 2022 Intuit Inc.   All rights reserved.
How Does the User Add the QWC File? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 39
Chapter 5: Exchanging Data with QuickBooks and QBPOS
A Note About the Required NameSpace . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 41
Data Exchange Considerations  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 41
Chapter 6: Interacting Directly with the Web Connector
How to Implement Interactive Mode  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 43
Using docontrol to Change Web Service Behavior in QBWC. . . . . . . . . . . . . . . . . . . . 44
Sample docontrol URLs . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 44
For Time Consuming Updates, Use async=true   . . . . . . . . . . . . . . . . . 44
How to Get Status of the Update   . . . . . . . . . . . . . . . . . . . . . . . . . . . 45
Requests for the docontrol operation 45
Using doquery to Invoke Pre-Set SDK Requests  . . . . . . . . . . . . . . . . . . . . . . . . . . . 46
Chapter 7: Understanding the End-User Experience and Setup
Initial End User Setup  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49
## Chapter 8: Handling Errors
The Web Connector Cannot Access QuickBooks . . . . . . . . . . . . . . . . . . . . . . . . . . . . 51
How Your Web Service Should Respond to QB Access Errors  . . . . . . . . . . . . . . . . 52
Why Would a Web Service Try a Different Company? 52
The Web Service Gets Unexpected Data from Web Connector . . . . . . . . . . . . . . . . . . 52
How Your Web Service Should Respond to Unexpected Data  . . . . . . . . . . . . . . . . 53
The Web Service Encounters an Unexpected State  . . . . . . . . . . . . . . . . . . . . . . . . . 53
Chapter 9: How Do I TroubleShoot Problems?
About Logging. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 55
How Do I Get to the Troubleshooting Page?  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 55
What Is Provided at the Troubleshooting Pages? . . . . . . . . . . . . . . . . . . . . . . . . . . . 59
Chapter 10: QBWC Callback Web Method Reference
authenticate . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62
clientVersion . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 66
closeConnection  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 68
connectionError. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 69
getInteractiveURL . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 71
getLastError . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 72
getServerVersion. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 74
interactiveDone . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 75
interactiveRejected  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 76

## Contents 5
(c) 2022    Intuit Inc. All rights reserved.
receiveResponseXML. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  77
sendRequestXML  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  80
