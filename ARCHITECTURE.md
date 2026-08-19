# Architecture Specification: Sidekick AI Desktop Companion

## 1. System Overview & Domain Boundaries
`Sidekick AI` operates as an active component within the ecosystem, providing ai-powered desktop sidebar with contextual micro-agent workforce.

---

## 2. Core Architecture & Data Flow

```mermaid
graph TD
    Client["Client / Invoker UI"] --> Engine["Core Runtime Engine"]
    Engine --> State["State Manager & Store"]
    Engine --> Adapter["External Integrations / APIs"]
    State --> Storage[("Persistence Layer")]
```

---

## 3. Subsystem Modules & Responsibilities
- **Core Engine**: Handles lifecycle orchestration, request execution, and error recovery.
- **State Store**: Maintains in-memory and persisted session states.
- **Service Adapters**: Encapsulates external API communication and network retries.

---

## 4. Invariant Rules & Quality Standards
- Strict type safety and zero unhandled exceptions.
- Deterministic state transitions with telemetry logging.
