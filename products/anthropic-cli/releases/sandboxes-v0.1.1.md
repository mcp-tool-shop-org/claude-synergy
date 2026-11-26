---
product: anthropic-cli
version: "sandboxes-v0.1.1"
released_at: "2026-11-24"
source_url: "https://github.com/anthropics/anthropic-cli/releases/tag/sandboxes-v0.1.1"
fetched_at: "2026-11-25"
---

# anthropic-cli sandboxes-v0.1.1

### Bug Fixes

* **sandboxes:** make the worker's start check hold up under packet loss

  The check now has to pass twice in a row and waits longer for each address, so a worker starts a few seconds later.

* **sandboxes:** use the v1beta1 Agent Sandbox API on GKE clusters that serve it

  GKE 1.37.2-gke.1325000 removes the API version that 0.1.0 uses. Upgrade before the cluster reaches it, and follow "Upgrading a GKE cluster" in `sandboxes/kubernetes/README.md`, which also covers Google's warning about upgrades to 1.36.3-gke.1767000 or later. On `gke` the 0.1.0 dispatcher image does not start under this chart, so move pinned digests or `image.tag` in the same upgrade. The chart has a new setting, `gke.sandboxAPIVersion`, and refuses an upgrade by Helm 4.0.0 to 4.1.0 where both versions are served. The dispatcher has a new flag, `-claim-mode`, and `-api-version` takes `auto`.


### Chores

* bump go sdk to v2.15.0
* **sandboxes:** add a script that installs the Agent Sandbox controller on clusters other than GKE

  `sandboxes/kubernetes/install-agent-sandbox.sh` installs upstream release v1.0.1, checks its manifest against a recorded SHA-256 and pins the controller's image by digest. It changes nothing on a cluster that has another controller, unless you pass `--replace`.

## Self-hosted sandbox images

```
sha256:f0f0445e74317b3136e3cdbf5e647d35d6d2e854aa29ec66bc26915ac088dc2e  us-docker.pkg.dev/anthropic-public-registry/sandboxes/cma-dispatcher:0.1.1
sha256:57e4b07e9199b1ccd78893f3bba1f13d046575329e6ece5396efd06230bdb234  us-docker.pkg.dev/anthropic-public-registry/sandboxes/cma-sandbox:0.1.1
sha256:f7d4bc591aea1436ef4b39387d245c72e02d7f84c4dc00c1242f56fe4f8e4916  us-docker.pkg.dev/anthropic-public-registry/sandboxes/cma-sandbox-source:0.1.1
sha256:4eb7efa1d0d0f88bcd1d0afe2de1108886f8b8a7f684b47c454c3acc21ad55c6  us-docker.pkg.dev/anthropic-public-registry/sandboxes/charts/cma-sandboxes:0.1.1
```

`cma-sandbox` carries `ant` 2.5.0. Verify an image or the chart with `gh attestation verify oci://IMAGE@DIGEST --repo anthropics/anthropic-cli --signer-workflow anthropics/anthropic-cli/.github/workflows/publish-sandboxes.yml --source-ref refs/tags/sandboxes-v0.1.1`, where IMAGE is its name without the tag.

