---
product: edge-case
version: "0.0.4"
---

# Fenced-block bullets are not real bullets

- Real bullet before code block

```
- fake bullet inside fence
* also fake bullet
```

- Real bullet after code block

```bash
* shell-style fake bullet
- another fake
```

- Final real bullet
