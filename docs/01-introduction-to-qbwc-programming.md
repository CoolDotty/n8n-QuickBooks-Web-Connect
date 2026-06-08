# Chapter 1: Introduction to QBWC Programming
If you are developing a web-based application that works with QuickBooks or QB POS,
you’ll want to consider implementing a solution designed to work with the QuickBooks
Web Connector (QBWC). QBWC enables web-based applications to access Quickbooks
and QuickBooks Point of Sale (QBPOS) over the internet.
QuickBooks Supported by QBWC
The following QuickBooks versions/editions are supported/not supported as indicated:
•Enterprise Edition: all editions
•Pro & Premier, QB 2002 and later
•Simple Start Edition: QuickBooks 2006 and later
•Online Edition: Not supported
Why Do I Need to Support QBWC in My Web Service?
There are a couple of reasons why you need to include QBWC support in your
implementation of a web-based application that talks to QuickBooks or QBPOS. The first
revolves around the basic COM issue, which applies more to QuickBooks integrations than
to QBPOS. The second revolves around the firewall issue, which potentially applies to
both.
What is the COM Issue and How Does QBWC Solve This?
In order for an application to access QuickBooks via the SDK, it must instantiate the
QuickBooks SDK request processor via COM. COM requires the COM object server and
its client (your application) to be resident on the same machine, or at least in the same LAN
(if you use DCOM and configure things very carefully). Consequently, your web-based
application, which is not in the same LAN or on the same machine, cannot access
QuickBooks directly via the request processor.
To get around this limitation, in the past, developers have created a go-between application
that resides on the same machine as QuickBooks and does the QuickBooks interaction,
passing the results back to their web-based app. This approach does work, but adds a
significant amount of learning and work to the implementation effort.

10Chapter 1: Introduction to QBWC Programming
(c) 2022 Intuit Inc.   All rights reserved.
Which is why QBWC was developed. QBWC is a free and standard go-between application
that can be used by any web-based application that needs to talk to QuickBooks or QBPOS.
The core function of QBWC is to act as the conduit through which all qbXML/qbposXML
requests and responses pass between web-based applications and QuickBooks or QBPOS.
What is the Firewall Issue and How Does QBWC Solve That?
For QBPOS, the request processor can be on a remote machine, such as the one hosting
your web service. So a web service could conceivably talk to remote QBPOS installations.
However, with this, there is a security issue as those remote QBPOS installations would
have to open their firewall to each web service.
For QuickBooks, some developers have considered using the Remote Data Sharing (RDS)
feature introduced with QB SDK 2.1 to allow their web-based application to talk to
QuickBooks. This approach is not recommended for various security reasons, one of which
being the requirement of opening a firewall port to the RDS server, which is not secure
enough for this purpose when it comes to the internet, as RDS is a LAN solution, not an
internet one.
QBWC eliminates the firewall issue by using an “upside-down” communication model
where the QBWC initiates the session with the web service over HTTPS and asks the web
service if it has work for QuickBooks or QBPOS (see Figure 1-1.) Consequently, there is no
need to open any ports.

Why Do I Need to Support QBWC in My Web Service?11
(c) 2022    Intuit Inc. All rights reserved.
Figure 1-1QBWC “upside-down” communication model
## IMPORTANT
Some firewalls may initially interfere with QBWC in that they
may prevent QBWC’s initial outbound contacting of the web
services. In these special cases, some additional tweaking of
the firewall to allow QBWC to reach out to web services may
be required.

12Chapter 1: Introduction to QBWC Programming
(c) 2022 Intuit Inc.   All rights reserved.
Are There Any Alternatives to QBWC?
The only recommended alternative to QBWC to enable web-based application integration is
for a developer to write their own go-between application, in effect, replacing QBWC with
their own implementation.
There are other alternatives, but these are not recommended. Using RDS involves
substantial security risk, as we’ve already mentioned. Using the unsupported Intuit
Interchange Format (IIF), as some web developers have done, is not recommended because
this bypasses the QuickBooks business logic, and so could result in data that is unsound
from an accounting and a QuickBooks business logic perspective.
The QBWC-to-Web Service Communication Universe
There are two aspects of the overall QBWC-to-web service communication that you need to
keep in mind:
•What does the initial customer interaction look like?
•What does ongoing data communication with the web service look like?
Initial Customer Interaction with Your Web Service
The customer’s first “communication” with your web service is an out-of-band
communication in which your customer does all the things that need to get done before any
data communication can happen. A typical activity sequence for this initial stage is shown
in Figure 1-2.

The QBWC-to-Web Service Communication Universe13
(c) 2022    Intuit Inc. All rights reserved.
Figure 1-2How a User Gets Ready to Access Your Web Service
As shown in the figure, the user must first learn about your service and what it requires,
downloads and installs QBWC, subscribes to your service and obtains a password and a
QWC configuration file. The QWC file, when loaded into QBWC, automatically transfers
almost everything QBWC needs to contact your web service, such as user name, URLs, and
so forth. (See Chapter 4, “Building The QWC File for Your Users,” for details on
constructing the QWC file.)
The only thing NOT automatically loaded into QBWC is the user password from the web
service provider. For security reasons, the user needs to save this manually into QBWC,
where it is encrypted and stored.

14Chapter 1: Introduction to QBWC Programming
(c) 2022 Intuit Inc.   All rights reserved.
Ongoing Communication Between QBWC and a Web Service
Figure 1-3 shows a high level view of the communication between a user’s local system
running QuickBooks/QuickBooks POS with QBWC talking to a web service over the
internet.
Figure 1-3High-level communication diagram
QBWC uses the QWC file from each web service provider to locate that providers web
service and begin the communication sequence. A detailed view of this communication
sequence can be found in Chapter 2, “The QBWC Communication Model.” Your web
service must implement the SOAP-based interfaces listed in Chapter 2 and described in
detail in Chapter 10.
QBWC contacts the web service when your customer asks it to or at the regular intervals
scheduled by your customer. If your web service needs to do some work for the customer, it
responds with requests for QuickBooks or QB POS, which QBWC forwards to QuickBooks
or QB POS, then returns the responses to your web service. If the web service has no work
to be done at the time QBWC makes contact, then the communication simply stops.
## What Will My Web Service Solution Look Like?
This document does not cover certain aspects of your total solution, such as getting
subscription requests from your customer and providing them with passwords, the
mechanism used to supply QWC files and so forth. It describes primarily those core pieces
of functionality you must provide:
•The QWC file you provide to the customer that contains all the connection data
•The web service QBWC callbacks you must implement in your web service
How to Build a QWC File
Each customer will have to have a separate QWC file with their unique username. The user
downloads this and opens it to automatically load all its data into QBWC. Instructions on
constructing this QWC file are provided in Chapter 4, “Building The QWC File for Your
## Users.”

Are There Samples to Jumpstart My Work?15
(c) 2022    Intuit Inc. All rights reserved.
How to Build QBWC Support into Your Web Service
To enable QBWC to work with your web service, you need only implement the following
SOAP interfaces
## •authenticate
•clientVersion
•closeConnection
•connectionError
•getLastError
•receiveResponseXML
•sendRequestXML
These callbacks are described in detail in Chapter 10, “QBWC Callback Web Method
Reference.” A detailed description of how they are used is provided in Chapter 2, “The
QBWC Communication Model.”
Are There Samples to Jumpstart My Work?
The QB SDK package provides two sample web services, one for QuickBooks, one for
QuickBooks POS, each with their own QWC file. These are located in the QB SDK
samples subdirectory \samples\qbdt\c-sharp\qbXML\WCWebService and in the QBPOS
SDK samples subdirectory \Samples\qbpos\c-sharp\qbposxml\QWCPOSWebService.
Each sample web service can be run locally on your system along with QBWC, that is, with
no certificates, to keep things simple. Directions on building and running the sample are
provided in the readme.html page for the samples.
## Frequently Asked Questions
The rest of this chapter provides answers to several frequently asked questions.
What Platforms and Languages can I use in my Implementation?
The web service should be able to run on any platform that supports standard SOAP for
communication. Platforms that are known to work include Apache Tomcat (Axis)and ASP
(.Net).
Why Do I Need SOAP?
There are several technologies designed to allow dissimilar applications to talk to each
other. That is, you can write one side in C# on Windows XP and the other could be Cobol
on an IBM Mainframe (which is an extreme example, perhaps). A few years ago a
technology called Common Object Request Broker Architecture (CORBA) was popular,

16Chapter 1: Introduction to QBWC Programming
(c) 2022 Intuit Inc.   All rights reserved.
but SOAP (Simple Object Access Protocol) has emerged to grab greater mindshare.
Although if you like cheap jokes, you could argue that the advantages offered by each were
largely a wash.
The main point is that SOAP provides a way for data to flow between two disparate
systems. From the perspective of the remote system, it doesn’t matter what language or
technology you use to implement your web service, so long as this system is capable of
interpreting the object/message being passed via SOAP.
Which QuickBooks/QB POS Versions Support QBWC?
QBWC works with any QuickBooks or QB POS product that supports the QB SDK and
QBPOS SDK, respectively, except QuickBooks Online edition. However, older versions
may not support some of the newer SDK requests that newer QuickBooks or QB POS
versions support. QBWC does return QuickBooks version data to help you determine
whether your web service will work with the customer’s QuickBooks or not.
Can I Specify Which QuickBooks Editions Access My Service?
There is an <AuthFlags> parameter in the QWC file that allows you to specify which
QuickBooks editions are supported by your web service. By default, all editions are
supported, even Simple Start editions. This default is different from the default behavior of
AuthFlags for QB SDK applications. For QB SDK applications the default AuthFlags
support is not for all QB editions, but only Enterprise, Premier, and Pro, in order to avoid
breaking existing applications that didn't know about Simple Start edition.
Since QBWC is a new product, it makes sense to require application developers to think
about Simple Start edition from the beginning. Accordingly, when you test your
application, and you use the default AuthFlags, you must test your application against
Simple Start edition, to make sure Simple Start provides the functionality your application
requires.
Here are the values you can supply for <AuthFlags>:
Table 1-1Supporting QuickBooks Editions
If you want to support several editions but not all, you can AND the values for the editions
you want to support.
QB SupportedAuthFlags Value
## Support All (default)0x0
SupportQBSimpleStart0x1
SupportQBPro0x2
SupportQBPremier0x4
SupportQBEnterprise0x8

## Frequently Asked Questions17
(c) 2022    Intuit Inc. All rights reserved.
Does My Web Service Need a Certificate to Access QBWC?
All production communication between web services and QBWC uses HTTPS. This means
SSL is required, which means you’ll need a X.509 certificate. This is a standard certificate
that you can obtain from companies (such as Verisign) that provide them.
Developing a Web Service Without Certificates
However, for development purposes only, you can bypass the certificate issue by using http
and specifying “localhost” in your QWC AppURL settings. This will allow you to run your
web service on your system and let it talk to the QBWC installation on your system. You
could also optionally use a domain name within your LAN to test against a server
somewhere in your LAN. For more details, see Chapter 4, “Building The QWC File for
Yo u r   U s e r s . ”
Alternatively, if you want to use a self-signed certificate for testing purposes only, you can
use the tool Microsoft provides for this on the
Microsoft web site . Follow the
instructions at the Microsoft web site. Or, you could also use openssl to test against if you
happen to have cygwin installed. (Though the openssl instructions say it is for IIS 6.0, it
works fine with IIS 5.1.)
Where is the QBWC WSDL?
The QBWC WSDL is located at the IDN web site .
Is There a Limit to the Number of Messages I Send to QBWC?
There is no limit on the number of messages your web service sends to QuickBooks Web
Connector (QBWC). It depends on your application -- when in response to
receiveResponseXML() you send a return value of 100 (which means 100% completed)
then QBWC will stop calling sendRequestXML().
Why QBWC and Not a Simple Web Interface?
Some developers may wonder why we supply QBWC rather than providing a web
interface. This is a philosophical question that we’ll have to address in a more longwinded
way.
Once upon a time, Quickbooks started out with the premise of making an accounting
system for people who weren't accountants. The assumption is that the end users are experts
in their business, not ours. This remains our assumption. We can’t assume that our
customers are going to figure out all the technical and security issues that surround the
seemingly simple issue of providing an application that opens internet access to our
customer’s financial data. That access must be kept as secure as possible and it must keep
the business owner in charge of access.

18Chapter 1: Introduction to QBWC Programming
(c) 2022 Intuit Inc.   All rights reserved.
In other words, it can be difficult for developers to handle all the server components and
security components necessary to be successful at a QBWC-centric web service, but we
feel that the difficulty is better on the developer side than pushing this difficulty off to the
end users. Anyone developing an application that opens financial data to direct internet
access should carefully consider the security implications.
If you (as the developer) understand your user community well enough to know that they
can manage these decisions, then this functionality would make a good value-add you can
develop. If you are considering this business opportunity, please make sure you cover the
following areas:
-   Your clients will have to allow external traffic through their firewall into their
QuickBooks/QuickBooks POS system.
-   The ISP hosting your client will have to allow this traffic through, not all ISP's allow
this. Make sure you charge enough for your product to recoup the investment you'll
have to make at installation time working with ISP technical support. In the end, some
of your clients may be forced to use a different ISP.
-   Your client will have to configure SSL servers, if they don't have an IT department,
they'll likely look to you for help. If they misconfigure, or forget to enable security,
their data will be transferred in the clear. If they don't understand this they will likely be
upset with you for not making this clear.
-   In order to contact their system, they will have to have updated DNS records. If they
don't have a permanent IP address, they'll have to have DDNS somewhere. They will
likely look to you for help on this.
-   Because this is financial data, the bad guys have an incentive to try to get in. Your
clients will need to keep up with security patches in all the middle wear. And they need
to have very good policies about not allowing Trojan software or viruses onto their
systems. And they need to understand Phishing and prepare their staff to recognize and
react appropriately when they face it.

A Closer Look at the Communication Model 19
(c) 2022    Intuit Inc. All rights reserved.
