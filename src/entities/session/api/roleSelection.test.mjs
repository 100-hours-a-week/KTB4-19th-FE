import test from 'node:test';
import assert from 'node:assert/strict';
import {
  roleSelectionRequest,
  roleSelectionSuccessPath,
} from './roleSelection.mjs';

test('maps the selected frontend role to the backend userRole contract', () => {
  assert.deepEqual(roleSelectionRequest('manager'), { userRole: 'MANAGER' });
  assert.deepEqual(roleSelectionRequest('resident'), { userRole: 'RESIDENT' });
});

test('sends managers to building registration after role selection', () => {
  assert.equal(roleSelectionSuccessPath('manager'), '/manager/building/new');
  assert.equal(roleSelectionSuccessPath('resident'), '/resident/connect');
});
