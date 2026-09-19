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
