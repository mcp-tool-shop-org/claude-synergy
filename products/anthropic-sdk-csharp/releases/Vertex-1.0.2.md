---
product: anthropic-sdk-csharp
version: "Vertex-v1.0.2"
released_at: "2026-11-10"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Vertex-v1.0.2"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Vertex-v1.0.2

### Bug Fixes

* **vertex:** percent-encode the project ID, region and model in the request path, so one with a `/` in it can't send the request to a different path, and throw on an empty project ID or region or one of `"."` or `".."`
* **vertex:** throw on an empty model, and on one that starts with `;`, `.;` or `..;`, such as `"..;x"`, because a server that drops `;` and what follows it would read it as an empty or dot segment
