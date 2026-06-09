# 09 Integration Tasks

## 1. Scope Basis
This document details integration tasks mapping external offline file specifications (such as conversation datasets, comparative LLM evaluations, and Kappa stats metrics) to internal database document entities.

## 2. Task ID Convention
Tasks trace back to [09_task_inventory.md](file:///Users/karpjoojeong/Dropbox/1-Research/1.Systems/1-Development/Agentic-Coding/LAMS-v0/workflow/09_tasks/09_task_inventory.md).

## 3. Integration & API Tasks

### TSK-R1-010: Admin LLM Prediction JSON Import
- **Summary**: Parse and map external comparative LLM predictions (from OpenAI, Gemini, and Claude) into active database records.
- **Parsing Schema Specifications**:
  - Validates keys: `call_id`, `model_id` (OpenAI, Gemini, Claude), `is_toxic` (Boolean), `risk_level` (1-3), `evidence_sentences` (array of strings).
  - Validation Constraint: Exclude records referencing a `call_id` that is not present in the `/conversations` collection.
- **Verification Command**: `npm run test:unit` (AT-007 mock predictions file upload).

### TSK-R1-011: Admin Statistics JSON Import
- **Summary**: Parse and save pre-calculated statistics metrics (e.g. Fleiss' Kappa indices and model F1 scores) for dashboard visualizations.
- **Parsing Schema Specifications**:
  - Validates keys: `overall_fleiss_kappa` (Number), `category_kappas` (map of categories to float indices), `model_f1_scores` (map of model IDs to accuracy floats).
  - Writes to: `/dashboard/statistics` central document.
- **Verification Command**: `npm run test:unit` (AT-008 mock stats file upload).
