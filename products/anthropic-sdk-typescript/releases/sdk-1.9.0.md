---
product: anthropic-sdk-typescript
version: "sdk-v1.9.0"
released_at: "2026-11-16"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v1.9.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-typescript sdk-v1.9.0

### Features

* **api:** add source and error codes to the RBAC Role read endpoints
* **api:** add Update Bundle, which sets a Claude Tag Bundle's instructions, and return instructions on Bundle


### Bug Fixes

* **helpers:** keep $schema out of the transformed schema description
* **streaming:** reject characters that aren't JSON in streamed tool input

  The lenient parser for streamed tool input used to skip characters and words that aren't JSON, such as a comment, and to join numbers such as `12 3`, so it could return a value that the text doesn't contain. It now rejects such text, and a stream with such tool input fails with an error, as it already did for a bad escape or a missing comma. Valid and truncated JSON parse as before.

* **tools:** bound the grep tool's search at 60s where ripgrep is missing, and keep its regex off the main thread
* **tools:** compare directory names exactly when confining file paths on Windows
* **tools:** fully resolve file tool paths that pass through a dangling symlink
* **tools:** ignore ripgrep config files in the agent toolset grep tool
* **tools:** leave symlinks that point outside /memories out of listings
* **tools:** normalize file modes of extracted skill files

  Extracted files now get `0644`, or `0755` if any execute bit is set, in `0700` directories, whatever the archive recorded. The system `tar` must accept `--no-same-owner` and `--no-same-permissions`.

* **tools:** pass over a tar or unzip inside the directories the agent toolset's file tools can write

  `setupSkills` takes `tar`, `unzip` and a helper that `tar` starts, such as `gzip`, only from the `PATH` entries outside `workdir` and `allowedRoots`, and passes over a link that leads inside them. A host whose only `tar` or `unzip` is inside those directories can no longer download skills until one is installed outside. Only when no `PATH` entry is outside them, as with a `workdir` of `/`, is all of `PATH` still searched. A `tar` or `unzip` that fails now rejects with an `AnthropicError`.

* **tools:** pass over an rg inside the directories the agent toolset's file tools can write

  `grep` passes over an `rg` that resolves to somewhere inside `workdir` or `allowedRoots`. It uses the next `rg` on `PATH`, or the built-in search when there is none. With a `workdir` that holds every `rg` on the host, such as `/`, every search is a built-in search. `rg`, and the `tar` and `unzip` that extract skills, no longer get the `ANTHROPIC_*` variables of the process, like the shell of `bash`.

* **tools:** read memory files only through the path that was validated
* **tools:** stop looking for rg, tar and unzip in the current directory
* **tools:** stop the grep tool's built-in search at a NUL byte in a file

  The built-in search of `grep` reads no further into a file once it meets a NUL byte, much as ripgrep does. A very large binary file with no line break used to end the process with an uncaught `RangeError`.


### Chores

* **api:** deprecate old beta header values

  The API still accepts these values, but a later release removes them from the SDKs. Delete `prompt-caching-2024-07-31`, `pdfs-2024-09-25`, `token-counting-2024-11-01`, `token-efficient-tools-2025-02-19`, `extended-cache-ttl-2025-04-11`, `cache-diagnosis-2026-04-07` and `ce-user-management-2026-07-13` from your requests. `files-api-2025-04-14` and `skills-2025-10-02` select the beta response shapes, so follow the Files API and Skills migration guides before you delete them.

  In C#, the `AnthropicBeta` enum's members have new numbers, so code compiled against an earlier SDK version sends a different beta value, with no error, until you rebuild it.

* **api:** stop sending an old beta header on batch requests

  `beta.messages.batches` no longer sends `message-batches-2024-09-24`, which the API doesn't need. If your client sets a default `anthropic-beta` header, these requests now send it, where in some SDKs the old value replaced it. The API still accepts the old value. If you set it yourself, delete it: a later release removes it from the SDKs.

* **docs:** add an example value for the workspace name
* **docs:** clarify when the auto permission policy denies a tool call
* **docs:** clarify which workspaces an external key can be attached to
* **docs:** recommend multiagent_20261001 over the coordinator type
* **docs:** say when organization_id is required on plugin reads
