---
description: Logging and feedback-loop standards for the Mais Jiu project
alwaysApply: true
---

# Logging & Feedback Standards — Mais Jiu

Execution must be observable. See [`AGENTS.md`](../../AGENTS.md); this rule is
mandatory for every command or process you run.

## 1. Write process output to a log file

Whenever something is executed (tests, builds, migrations, scripts, dev server),
capture stdout **and** stderr to a timestamped file under `logs/`.

```bash
mkdir -p logs
npm run test:integration 2>&1 | tee "logs/test-integration-$(date +%Y%m%d-%H%M%S).log"
```

> Keep logs out of version control — add `logs/` to `.gitignore`.

## 2. Read the log whenever there is a problem

On any failure, error, or unexpected behavior, open and read the relevant log
file before changing anything. Do not guess the cause.

```bash
# Inspect the most recent log on failure
tail -n 200 "$(ls -t logs/*.log | head -1)"
```

## 3. Use the log as a feedback sensor

Feed the log's actual output back into your reasoning: diagnose from what the log
shows, refine the implementation, re-run, and re-read the new log. Repeat this
loop until the log confirms the intended, error-free result.
