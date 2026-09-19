# Shileen

**AI decision companion prototype**

## Core behavior

Shileen is designed around:

**USER GOAL → CURRENT STATE → WHAT IS MISSING? → WHICH MISSING FACT MATTERS MOST? → SMALLEST USEFUL NEXT STEP → VERIFY → UPDATE STATE → ANSWER / ACT / ASK AGAIN**

The prototype deliberately does not behave like a generic chatbot that immediately produces an answer. Its first job is to identify the information gap and choose a useful next action.

## Current MVP

The mobile-first prototype provides:

- Chat-style phone interface
- Example questions
- Goal/missing-information assessment
- Action states such as Clarify, Verify, Next Action and Need Inputs
- A "Next best step" response
- Follow-up action buttons
- Installable web-app manifest
- Responsive layout for phone-sized screens

## Product boundary

This is decision support, not professional medical, legal or financial advice.

The current prototype uses a local rule-based reasoning layer. A production version would connect the decision-state engine to an AI model, evidence retrieval, document inspection, calculation tools and other permitted actions.

## Acquisition direction

The intended commercial model is a standalone software asset that can be acquired, further developed or integrated by a strategic technology company. It is not being designed as a SaaS business.


## Final MVP integration

The current prototype now includes the complete local reasoning loop:

**GOAL → GAP → PRIORITY → NEXT ACTION → ACTION RESULT → REASSESS → SUFFICIENCY → RESPONSE MODE → FINAL ANSWER**

Additional integrated controls include evidence-gap prioritisation, smallest-useful-step selection, stale-answer protection, reasoning history, conclusion-basis display, answer-version tracking, response limitations, user controls, assessment export, and a core build-status check.

The MVP remains intentionally local and rule-based. The production integration boundary is the connection to an AI model and permitted evidence/action tools; this is not represented as already implemented.
