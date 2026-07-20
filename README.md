# Ryvra Policy Risk

Ryvra Policy Risk is the protocol decision layer for deterministic transaction policy decisions.

It acts as a policy decision point for:
- transaction authorization
- risk scoring and limit enforcement
- compliance hook orchestration
- anti-abuse and reward-eligibility decisions

**Status: early draft / not production-ready**

## Architecture

`input context -> policy engine -> decision + reason codes -> audit log`

The baseline is docs-first and interface-first. Provider integrations are intentionally abstract in v1.

## Consumers

- accounts
- pay
- markets
- ledger-settlement
- PoT engine
