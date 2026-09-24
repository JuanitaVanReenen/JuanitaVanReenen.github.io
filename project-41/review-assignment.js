/**
 * Review assignment control.
 * Matches a review request to an authorized and currently qualified reviewer.
 */
import {can} from "./role-access-model.js";
import {assessQualification} from "./qualification-register.js";

export function evaluateReviewAssignment(input) {
  if(!input?.reviewer?.role || !input?.qualification || !input?.requiredAction || !input?.asOf) {
    throw new Error("Reviewer role, qualification, required action and assessment date are required.");
  }
  const authorized=can(input.reviewer.role,input.requiredAction,input.policy);
  const qualified=assessQualification(input.qualification,input.asOf);
  return {
    reviewerId:input.qualification.reviewerId,
    authorized:Boolean(authorized),
    qualified:qualified.qualified,
    assignable:Boolean(authorized)&&qualified.qualified,
    reasons:{
      authorization:authorized ? "role_action_allowed" : "role_action_not_allowed",
      qualification:qualified.reason
    }
  };
}
