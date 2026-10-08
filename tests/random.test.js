import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickOne } from '../js/random.js';

test('pickOne never repeats the item to avoid when there is a choice', () => {
  for (let i = 0; i < 50; i++) assert.notEqual(pickOne(['a', 'b'], 'a'), 'a');
  assert.equal(pickOne(['solo'], 'solo'), 'solo');
  assert.ok(['a', 'b'].includes(pickOne(['a', 'b'])));
});
