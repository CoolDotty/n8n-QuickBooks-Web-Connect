# Chapter 7: Understanding the End-User Experience and Setup
In order for your web-based application to be used successfully by your user, the user
usually needs to do some initial setup and configuration. This chapter provides the end user
view of the tasks that need to be done.
## Initial End User Setup
The end user starts off by learning about your web service and the possibility of integrating
it with their QuickBooks or QuickBooks POS company. The user then contacts you to
establish an account to access and use your web service. At this point, the following user-
driven processes must occur:
-   The user must download and install the web connector.  You can host the download of
the web connector yourself, but we recommend that you point the user to th
e
appropriate Intuit site for the download because that site is guaranteed to have the latest
web connector.  The URL http://marketplace.intuit.com/webconnector will provide a
description of the web connector as well as a link to download and install it.
-   From your web site, the user must download a QWC file provided by you. (The
contents and structure of the QWC file are described in Chapter 4, “Building The QWC
File for Your Users.”). This QWC file should be custom-generated for each individual
user to provide the correct FileID as well as to provide the correct Username for the
web
connector to authenticate with.
-   After the download, the user opens the QWC file to add it to the web connector so that
the web connector is able to connect to the web service. The user could just open the
QWC directly without downloading it, but the recommended practice is for them to
download it so they’ll have it in case they need to re-install the QWC into the web
connector.
## 4.
The user must configure the web-based application to appropriately exchange data with
QuickBooks or QuickBooks POS.  For example, a store front application may want to
know whether items in the on-line store should be mapped 1:1 for items in QuickBooks
or mapped to a single item in QuickBooks, similarly customers, sales tax, etc.  To
facilitate this, the web service should probably conduct an initial session with
QuickBooks to obtain basic information pertinent to this configuration step (i.e. the
chart of accounts, item list, etc. may be required by the application) so that user choices
can be drawn directly from information in the users company file.  This is important
because the alternative can lead to the user entering incorrect information (i.e. typos
## ,
etc.) that can cause their subsequent data exchanges to fail or, worse, to create duplicate
accounts, items, etc. that can be difficult or impossible to reverse.

50Chapter 7: Understanding the End-User Experience and Setup
(c) 2022 Intuit Inc.   All rights reserved.

The Web Connector Cannot Access QuickBooks 51
(c) 2022    Intuit Inc. All rights reserved.
