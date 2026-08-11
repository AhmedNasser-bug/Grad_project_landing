# Workspace Agent Rules & WAF Guidelines

## Microsoft Well-Architected Framework (WAF) Protocol (2025/2026 Updated)

Every agent working on this workspace MUST adhere to the following 5-pillar rules derived from [AhmedNasser-bug/waf-skills-bundle](https://github.com/AhmedNasser-bug/waf-skills-bundle) and Azure WAF 2026 releases:

### 1. Security (SEC)
- **Zero Hardcoded Credentials (`SEC-01`)**: Never place API keys, secrets, or passwords directly in code files. Require environment variables (`.env`).
- **SQL Injection Prevention (`SEC-02`)**: Always parameterize database queries. Never use f-strings or string concatenation for query execution.
- **Enforce Secure Protocols (`SEC-03`)**: Prefer `https://` and `sftp://` over insecure protocols (`http://`, `ftp://`).
- **Delete Protection & Resource Locks (`SEC-04`)**: Apply resource locks (`CanNotDelete`) on critical state stores and redundant infrastructure to prevent accidental manual or automated deletion.

### 2. Reliability (REL)
- **Mandatory Request Timeouts (`REL-01`)**: All HTTP request invocations (e.g. `requests.get`, `fetch`) MUST specify explicit timeout thresholds.
- **No Bare Except Clauses (`REL-02`)**: Catch specific exception types. Never write `except:` or `except Exception: pass` without logging or re-raising.
- **Capped Retry & Circuit Breakers (`REL-03`)**: Unbounded `while True` retry loops are prohibited; specify maximum retry limits and backoff logic.
- **Failure vs. Error Taxonomy (`REL-04`)**: Distinguish unexpected failures (requiring intervention) from expected errors. Treat read and write failures separately in blast radius and recovery design.
- **Messaging Resiliency Patterns (`REL-05`)**: Check `IsTransient` on exceptions before retrying, enforce `PeekLock` mode to prevent message loss on receiver crashes, enable duplicate detection for producer retries, and use Dead-Letter Queues (DLQs) for unprocessable messages.
- **Connection Pool Isolation (`REL-06`)**: Isolate client/database connection pools per service tier to prevent resource-heavy tasks from starving critical user flows.

### 3. Operational Excellence (OPS)
- **Structured Telemetry (`OPS-01`)**: Avoid raw `print()` or `console.log()` statements in production flows. Use standard structured loggers.
- **Environment Schema Validation (`OPS-02`)**: Validate required environment variables at application startup rather than ad-hoc runtime access.
- **Safe Decommissioning (`OPS-03`)**: Deletions are irreversible. Follow a 5-step lifecycle: (1) validate inactivity, (2) preserve state/backups, (3) disable before delete, (4) observe in a watch window, (5) clean residual references.
- **PoC Code Isolation (`OPS-04`)**: Treat Proof of Concept (PoC) code as disposable; never copy-paste PoCs into production without adding complete security, error handling, and telemetry.

### 4. Performance Efficiency (PERF)
- **Loop Sizing & Complexity (`PERF-01`)**: Avoid nested loops (O(N^3) or higher). Flatten algorithms or use dictionary/hashmap lookups.
- **Non-blocking Async I/O (`PERF-02`)**: Do not call blocking synchronous file or network I/O inside asynchronous event loops.

### 5. Cost Optimization (COST)
- **Lifecycle & Resource Bounds (`COST-01`)**: Ensure database connection pools, stream handles, and background timers are bounded and explicitly torn down.

---

## Spec-Driven Development & Task Directive Protocol (`SPEC-DIR-01`)

Whenever generating task specifications (`specs/`) for lower-tier agent teams:
1. **Mandatory EPIC 0 (Foundation)**: Every spec project MUST establish an `Epic0-Reusable-Design-System-Visual-Assets` containing modular, reusable core visual assets, ready-to-use GSAP text animations, WebGL shader vignettes, Hyperframes video scrub engines, and screen-wide parallax card wrappers.
2. **Mandatory Discovery Phase per Epic**: Every Epic MUST begin with a dedicated **Discovery Phase Feature & Task** (e.g. `FeatureX.1-Discovery-Phase-Research-Interview`) that performs internet grounding research on design trends and conducts interactive user interviews (`ask_question`) to finalize the design before writing implementation code.
3. **Explicit Skill Inventory**: Every task `.md` file MUST list exact skills to invoke, download, or search (e.g. `/gstack`, `/frontend-design`, `/web-artifacts-builder`, `/rtk`, `/waf-security`, `/teamwork-preview`).
4. **Pre-flight Audit Strategy**: Include a mandatory pre-flight search strategy (e.g. searching relevant documentation or component patterns before executing).
5. **Design System & WAF Tokens**: Explicitly list Stitch design system tokens (`Clinical Vitality`) and WAF security/reliability guardrails.
6. **Trust-First Epic Hierarchy**: For high-trust medical or landing page projects, structure Epics around audience role variants, visual incident storyboards, academic credentials, live MDX milestone blogs, and payment/grant checkout gates.


