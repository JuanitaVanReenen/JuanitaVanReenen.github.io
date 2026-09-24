# Review Assignment Specification

## Purpose
Create a controlled bridge between governance policy and actual reviewer assignment.

## Assignment chain
Review request → role authorization → current qualification → scope check → reviewer assignment.

## Rules
- A reviewer is assignable only when both authorization and qualification requirements are satisfied.
- Qualification validity is evaluated at the relevant review date.
- The assignment result does not decide the underlying engineering issue.
- Reviewer identity remains attached to subsequent review and decision provenance.

## Production direction
Assignment must be server-side, authenticated and scoped to the tenant/project. Conflicts of interest, workload, independence and organization-specific reviewer requirements should be evaluated before assignment.
