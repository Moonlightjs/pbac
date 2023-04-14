import PBAC, { PBACEvaluateOptionsParams, PBACPolicy } from './pbac';

export * from './pbac';

export default PBAC;

const policies: PBACPolicy[] = [
  {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'OptionalDescription',
        Effect: 'Allow',
        Action: ['iam:CreateUser', 'iam:UpdateUser', 'iam:DeleteUser'],
        Resource: ['arn:aws:iam:::user/${req.UserName}'],
        Condition: {
          IpAddress: {
            'req.IpAddress': '10.0.20.0/24',
          },
        },
      },
    ],
  },
];

const pbac = new PBAC(policies);

// returns true
const result = pbac.evaluate({
  action: 'iam:CreateUser',
  resource: 'arn:aws:iam:::user/testuser',
  context: {
    req: {
      IpAddress: '10.0.20.51',
      UserName: 'testuser',
    },
  },
});

console.log(result);

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

const examplePbac = new PBAC(examplePolicy);

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

const accessGranted = examplePbac.evaluate(evaluateOptions);
console.log(`Access granted: ${accessGranted}`); // Access granted: true
