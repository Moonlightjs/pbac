import PBAC, { PBACPolicy, PBACEvaluateOptionsParams } from '../src/pbac';

const examplePolicy: PBACPolicy = {
  Version: '1.0.0',
  Statement: [
    {
      Effect: 'Allow',
      Action: ['read'],
      Resource: ['resource:${user.id}'],
      Principal: { user: ['user1', 'user2'] },
      Condition: {
        StringEquals: { 'user.id': ['user1', 'user2'] },
      },
    },
  ],
};

const pbac = new PBAC(examplePolicy);

describe('PBAC', () => {
  test('should allow access when conditions are met', () => {
    const evaluateOptions: PBACEvaluateOptionsParams = {
      action: 'read',
      resource: 'resource:user1',
      principal: { user: 'user1' },
      context: {
        user: {
          id: 'user1',
        },
      },
    };

    const accessGranted = pbac.evaluate(evaluateOptions);
    expect(accessGranted).toBe(true);
  });

  test('should deny access when conditions are not met', () => {
    const evaluateOptions: PBACEvaluateOptionsParams = {
      action: 'read',
      resource: 'resource:user3',
      principal: { user: 'user1' },
      context: {
        user: {
          id: 'user1',
        },
      },
    };

    const accessGranted = pbac.evaluate(evaluateOptions);
    expect(accessGranted).toBe(false);
  });

  test('should validate valid policy', () => {
    const isValid = pbac.validate(examplePolicy);
    expect(isValid).toBe(true);
  });

  test('should throw an error for invalid policy', () => {
    const invalidPolicy: PBACPolicy = {
      Version: '1.0.0',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['read'],
          NotAction: ['update'],
          Resource: ['resource:${user.id}'],
          Principal: { user: ['user1', 'user2'] },
          Condition: {
            StringEquals: { invalidKey: ['user1', 'user2'] },
          },
        },
      ],
    };
    expect(() => pbac.validate(invalidPolicy)).toThrow();
  });
});
