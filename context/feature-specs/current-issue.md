_🔒 Security & Privacy_ | _🟠 Major_ | _⚡ Quick win_

<details>
<summary>🧩 Analysis chain</summary>

🏁 Script executed:

```shell
#!/bin/bash
set -euo pipefail

file=".claude/skills/trigger-setup/SKILL.md"

echo "== file info =="
wc -l "$file"
echo

echo "== relevant lines =="
nl -ba "$file" | sed -n '1,160p'
```

Repository: Samson0222/ghost-ai

Length of output: 278

---

🏁 Script executed:

```shell
#!/bin/bash
set -euo pipefail

file=".claude/skills/trigger-setup/SKILL.md"

echo "== command examples =="
cat -n "$file" | sed -n '25,130p'
```

Repository: Samson0222/ghost-ai

Length of output: 3017

---



</details>

**Pin the Trigger.dev CLI commands to an exact version**  
The setup guide still mixes `npx trigger@4 ...` and `npx trigger dev`; pin every example to the same exact CLI version so copy-paste installs stay reproducible and don’t pull a newer release unexpectedly. (lines 33, 69, 119)

<details>
<summary>🧰 Tools</summary>

<details>
<summary>🪛 SkillSpector (2.3.7)</summary>

[warning] 119: [RP1] null: npx commands without a version suffix (e.g. `@1.0.0`) create a rug-pull risk if the upstream server is compromised and publishes a malicious update.

Remediation: Pin the version: npx `@scope/server`@1.2.3

(MCP Rug Pull (RP1))

</details>

</details>

<details>
<summary>🤖 Prompt for AI Agents</summary>

```
Verify each finding against current code. Fix only still-valid issues, skip the
rest with a brief reason, keep changes minimal, and validate.

In @.claude/skills/trigger-setup/SKILL.md around lines 33 - 34, The setup guide
is inconsistent about the Trigger.dev CLI version, so update every Trigger
command example to use the same exact pinned version. In the trigger setup skill
docs, make the examples around the init/dev flows consistent by replacing any
unpinned `npx trigger dev` usage with the same exact `npx trigger@4 ...` form
used elsewhere, so the instructions stay reproducible across the whole guide.
```

</details>

<!-- fingerprinting:phantom:triton:quartz -->

<!-- cr-indicator-types:potential_issue -->

<!-- cr-comment:v1:2ed7ea206d9be9ca8bc174ac -->

_Source: Linters/SAST tools_

<!-- This is an auto-generated comment by CodeRabbit -->