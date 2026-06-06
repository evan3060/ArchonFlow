# Proposal: Agent Routing & Context Control

## Feature Description
Model routing configuration for agents, with vision-capable models only invoked when visual audit is needed. Context control mechanisms to prevent context window bloat during fix loops.

## Domain Impact
### New/Modified Entities
| Entity | Change Type | Description |
|--------|------------|-------------|
| agent_routing | NEW | Model routing configuration per agent role |
| context_control | NEW | Memory reset, viewport snippet, surgical fix, context compress |

## Success Criteria
1. Vision model is NOT loaded for text-only agents (engineer, architect)
2. Vision model IS loaded for visual-auditor when vision: true
3. Fix loop context stays under 3.5k tokens per iteration
4. Fail-only reports reduce context by 40-60%

## Regression Risk
- Risk level: LOW
- Affected areas: fix skill, contract-assert script
