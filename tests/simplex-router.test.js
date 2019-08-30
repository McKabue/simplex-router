const uuid = require('uuid').v4
const simplexRouter = require('../src/simplex-router.ts').default;

test('matches named tag for strict value', () => {
    const tagName = 'tag';
    const tagValue = uuid();
    const router = simplexRouter(`/home/{${tagName}}`);
    const match = router.match(`/home/${tagValue}`, true);
    expect(match.params[tagName]).toBe(tagValue);
});

test('matches named tag for any value', () => {
    const tagName = 'tag';
    const tagValue = `${uuid()} ${uuid()} ${uuid()} ${uuid()}`;
    const router = simplexRouter(`/home/{${tagName}?}`);
    const match = router.match(`/home/${tagValue}`, true);
    expect(match.params[tagName]).toBe(tagValue);
});