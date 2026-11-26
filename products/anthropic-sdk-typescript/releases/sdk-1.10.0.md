---
product: anthropic-sdk-typescript
version: "sdk-v1.10.0"
released_at: "2026-11-17"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v1.10.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-typescript sdk-v1.10.0

### Features

* **api:** add beta support for the billing_policy request parameter
* **api:** add contract_spend_limit_reached error code to messages
* **api:** add error codes for linked billing refusals
* **api:** add the user_profile_billing_not_authorized error code
* **api:** add webhook events for external key failure and recovery


### Bug Fixes

* **tools:** keep the session tool runner's maxIdleMs countdown running when a session thread terminates

  If the runner fails to read the session's event history after a reconnect, a termination that then arrives on the event stream still cancels the countdown, until the next idle or successful read.

* **tools:** stop EnvironmentWorker from running tools for a terminated session

  For a terminated session, the worker now force-stops the work item right after it retrieves the session, before it downloads skills or memory stores. It no longer throws `SessionMemoryError` for such a session. The API reports an archived session as `terminated`.

* **tools:** stop the session tool runner from running the tool calls of a terminated session thread

  The runner also stops waiting for a confirmation of these calls and no longer yields them, including a denied call (`confirmation: 'deny'`) and a call to a tool that it does not own. A call that the runner starts before it reads the session thread's `session.thread_status_terminated` event still runs to the end, and the runner yields it with `posted: false` when the API refuses the result.


### Chores

* **api:** rename error data models, deprecating the old names
* **docs:** clarify which AWS KMS keys a workspace can use on Claude Platform on AWS
* **docs:** clarify which credential work get, update and list accept
* **docs:** clarify which uploads a plugin pin holds back
* **docs:** note that a plugin scan's reason also covers errored scans

  `content_scan.reason` on an errored scan now says why there is no verdict. It is not a security finding, so code that treats any `reason` as a concern should also check `status`.
