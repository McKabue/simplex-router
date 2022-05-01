/* eslint-disable no-undef */
const uuid = require('uuid').v4;
const { default: simplexRouter } = require('../src/index.ts');

test('matches named tag for strict value', () => {
  const tagName = 'tag';
  const tagValue = uuid();
  const router = simplexRouter(`/home/{${tagName}}`);
  const match = router.match(`/home/${tagValue}`, { onlyFirstTemplate: true });

  expect(match.params[tagName]).toBe(tagValue);
});

test('matches named tag for any value', () => {
  const tagName = 'tag';
  const tagValue = `${uuid()} ${uuid()} ${uuid()} ${uuid()}`;
  const router = simplexRouter(`/home/{${tagName}?}`);
  const match = router.match(`/home/${tagValue}`, { onlyFirstTemplate: true });

  expect(match.params[tagName]).toBe(tagValue);
});

test('matches query', () => {
  const router = simplexRouter('/documents-search');

  const match = router.match(
    '/documents-search?query=value', { onlyFirstTemplate: true });
  const match1 = router.match(
    '/documents-search?query=', { onlyFirstTemplate: true });
  const match2 = router.match(
    '/documents-search?query', { onlyFirstTemplate: true });
  const match3 = router.match(
    '/documents-search?', { onlyFirstTemplate: true });
  const match4 = router.match(
    '/documents-search', { onlyFirstTemplate: true });

  expect(match.params.query).toBe('value');
  expect(match1.params.query).toBe('');
  expect(match2.params.query).toBe('');
  expect(match3.params.query).toBeUndefined();
  expect(match4.params.query).toBeUndefined();
});
