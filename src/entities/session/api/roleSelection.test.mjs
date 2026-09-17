import test from "node:test";
import assert from "node:assert/strict";
import { roleSelectionRequest, roleSelectionSuccessPath } from "./roleSelection.mjs";

test("maps the selected frontend role to the backend userRole contract", () => {
  assert.deepEqual(roleSelectionRequest("manager"), { userRole: "MANAGER" });
  assert.deepEqual(roleSelectionRequest("resident"), { userRole: "RESIDENT" });
});

test("keeps the existing role-specific landing paths after selection", () => {
  assert.equal(roleSelectionSuccessPath("manager"), "/manager/onboarding/profile");
  assert.equal(roleSelectionSuccessPath("resident"), "/resident/connect");
});
