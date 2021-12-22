const { default: aspNetCoreRules } = require("../src/rules/asp-net-core.ts");

const match = (rule, index) => {
  if (!rule.test) {
    throw new Error("All rules must have a test string");
  }

  const test = rule.match.test(rule.test);
  if (!test) {
    throw new Error(
      `The test "${rule.test}" is matched NOT matched by "${rule.match}"`
    );
  }

  const allMatches = aspNetCoreRules.filter((i) => i.match.test(rule.test));
  if (allMatches.length > 1) {
    throw new Error(`The test "${rule.test}" is matched by several rules`);
  }

  const matchedIndex = aspNetCoreRules.findIndex((i) =>
    i.match.test(rule.test)
  );
  if (matchedIndex !== index) {
    throw new Error(
      `The test "${rule.test}" is matched by a different route, "${aspNetCoreRules[matchedIndex].match}"`
    );
  }

  const allMatchers = aspNetCoreRules.filter((i) => rule.match.test(i.test));
  if (!allMatchers.length > 1) {
    throw new Error(`The test "${rule.match}" is matching other tests`);
  }

  const matcherIndex = aspNetCoreRules.findIndex((i) =>
    rule.match.test(i.test)
  );
  if (matcherIndex != index) {
    throw new Error(
      `The test "${rule.match}" is matching another test, "${aspNetCoreRules[matcherIndex].test}"`
    );
  }

  expect(test).toBe(true);
};

test("test asp.net-core rules", () => {
  aspNetCoreRules.forEach(match);
});
