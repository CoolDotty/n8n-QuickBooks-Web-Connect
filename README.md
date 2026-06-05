# ⚠️ DEPRECATED

**This project is deprecated in favor of an n8n custom trigger node.** Please use the official n8n integration instead.

---

# n8n-nodes-quickbooks-web-connector

n8n community node for integrating **QuickBooks Desktop** (US/CA/UK) with n8n via the [QuickBooks Web Connector](https://developer.intuit.com/app/developer/qbdesktop/docs/get-started/get-started-with-quickbooks-web-connector).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Nodes

### QuickBooks Desktop Web Connect Trigger

A webhook-based trigger node that implements the QuickBooks Web Connector SOAP protocol. QuickBooks Web Connector polls this endpoint to fetch pending QBXML jobs and deliver responses back. Every workflow execution is triggered by a QBWC poll.

**Output fields:**

| Field | Description |
|-------|-------------|
| `operation` | Always `receiveResponseXML` |
| `ticket` | Session ticket from the QBWC session |
| `responseXml` | The QBXML response from QuickBooks |
| `hresult` | HRESULT code (`0` = success) |
| `message` | Error or info message from QuickBooks |
| `jobId` | ID of the job that produced this response |
| `qbxml` | Original QBXML request that was sent |
| `timestamp` | ISO timestamp of when the response was received |

### QuickBooks Desktop Web Connect

An action node for interacting with the job queue and generating `.qwc` files.

**Resources & Operations:**

| Resource | Operation | Description |
|----------|-----------|-------------|
| Job | Enqueue | Add a QBXML job to the queue for the next QBWC poll |
| Job | Get Status | Check the status and result of a queued job |
| Job | List Pending | Count how many jobs are pending in the queue |
| QWC Config | Generate | Generate a `.qwc` XML file to install in QuickBooks Web Connector |

## Credentials

Create credentials of type **QuickBooks Desktop Web Connect API** with:

| Field | Description |
|-------|-------------|
| Server Base URL | The public HTTPS URL where n8n is reachable (e.g. `https://n8n.yourdomain.com`) |
| Username | The username QBWC sends during SOAP authentication |
| Password | The password QBWC sends during SOAP authentication |

Both nodes require these credentials. The username/password must match what you enter in QuickBooks Web Connector when you add the `.qwc` file.

## Setup Guide

### 1. Add the QuickBooks Desktop Web Connect Trigger

1. Add a **QuickBooks Desktop Web Connect Trigger** node to your workflow.
2. Configure the **Path** (default: `quickbooks-desktop`) — this becomes part of the webhook URL.
3. Set a **Server Version** string (or leave the default).
4. Optionally enable **Read Only** mode to block write operations.
5. Copy the **Test URL** from the trigger — this is your public webhook URL.

### 2. Generate a .qwc file

1. Add a **QuickBooks Desktop Web Connect** node connected to the trigger (hardcoded/manual input) or use its own Generate operation.
2. Select **Resource: QWC Config → Operation: Generate**.
3. Fill in:
   - **App Name** — name shown in QuickBooks Web Connector.
   - **App URL** — the Test URL from step 1.
   - **Interval** — how often QBWC should poll (minutes).
4. Execute the node to get the `.qwc` XML and save it as a `.qwc` file.

### 3. Install in QuickBooks Web Connector

1. Open QuickBooks Web Connector on the machine running QuickBooks Desktop.
2. Click **Add an application** and select your `.qwc` file.
3. Enter the matching **Username** and **Password** when prompted.
4. Authorize the application inside QuickBooks when the popup appears.
5. Check the checkbox and let it run — it will poll n8n on the configured interval.

### 4. Enqueue jobs

1. Add a **QuickBooks Desktop Web Connect** node (Resource: **Job**, Operation: **Enqueue**).
2. Enter your **QBXML** request (e.g. a `CustomerQueryRq` to list customers).
3. Optionally set **Read Only** to bypass read-only mode restrictions.
4. Run the workflow — the job enters the queue and QBWC picks it up on the next poll cycle.

### Typical workflow pattern

```
[Schedule / Manual Trigger] → [QuickBooks Desktop Web Connect: Enqueue] → [Wait for QBWC to poll]
                                                      ↓
[QuickBooks Desktop Web Connect Trigger] → [Process the response XML]
```

## Compatibility

- Requires **n8n v2.x** or later
- Works with **QuickBooks Desktop** (US, CA, UK editions) via **QuickBooks Web Connector** v2.1+
- Tested with QBWC enterprise and standard editions

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [QuickBooks Web Connector documentation](https://developer.intuit.com/app/developer/qbdesktop/docs/get-started/get-started-with-quickbooks-web-connector)
- [QBXML On-Screen Reference](https://developer.intuit.com/app/developer/qbdesktop/docs/qbxml/qbxml-on-screen-reference)

## Version history

### 0.1.0
Initial release with QuickBooks Desktop Web Connect Trigger and action node supporting job enqueue, status check, pending count, and QWC config generation.
