---
product: anthropic-cli
version: "sandboxes-v0.1.0"
released_at: "2026-11-06"
source_url: "https://github.com/anthropics/anthropic-cli/releases/tag/sandboxes-v0.1.0"
fetched_at: "2026-11-26"
---

# anthropic-cli sandboxes-v0.1.0

### Features

* **sandboxes:** add the Helm chart, dispatcher and sandbox image for running Claude Managed Agents self-hosted sandboxes on Kubernetes
* **sandboxes:** publish the dispatcher, sandbox and sandbox source images and the Helm chart to Google Artifact Registry


### Chores

* bump go sdk to v2.7.0

## Self-hosted sandbox images

| Artifact | Digest |
| --- | --- |
| `us-docker.pkg.dev/anthropic-public-registry/sandboxes/cma-dispatcher:0.1.0` | `sha256:237ec7884552a7c077b013e489e0ffa9a2bd8b4e863c07579f722d179a052a6e` |
| `us-docker.pkg.dev/anthropic-public-registry/sandboxes/cma-sandbox:0.1.0` | `sha256:d686b816635367985352f25a28801d89a1953d0b1beff347b1a6e14e77b11956` |
| `us-docker.pkg.dev/anthropic-public-registry/sandboxes/cma-sandbox-source:0.1.0` | `sha256:5642951145b461c2ab50e38623a8c1dd33cd94f7cc19253e166c3c98f21f36ae` |
| `us-docker.pkg.dev/anthropic-public-registry/sandboxes/charts/cma-sandboxes:0.1.0` | `sha256:eeedd38821d6c0aba4b8d49de30176ec2c4dafbd281b29551dcb7760258fa75e` |

`cma-sandbox` carries `ant` 2.5.0.
These were published by hand from `sandboxes-v0.1.0`, so they have no GitHub build attestation.
`cma-sandbox-source` holds the source of the sandbox image's GPL and LGPL packages.
Install the chart with `helm install cma oci://us-docker.pkg.dev/anthropic-public-registry/sandboxes/charts/cma-sandboxes --version 0.1.0 --namespace cma -f cma-values.yaml`. `sandboxes/kubernetes/README.md` says how to write `cma-values.yaml`.
To pin both images, add `--set image.dispatcherDigest=sha256:237ec7884552a7c077b013e489e0ffa9a2bd8b4e863c07579f722d179a052a6e --set image.sandboxDigest=sha256:d686b816635367985352f25a28801d89a1953d0b1beff347b1a6e14e77b11956`.

