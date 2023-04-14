# PBAC - Policy-Based Access Control

This library is a TypeScript implementation of Policy-Based Access Control (PBAC) inspired by [node-pbac](https://github.com/monken/node-pbac). It allows you to evaluate policies and permissions based on defined rules and conditions, making it easy to manage access to resources in your application.

## Installation

To install the PBAC library, use the following command:

```bash
npm install --save @moonlightjs/pbac
```

# Usage
First, import the PBAC class and related interfaces:

```javascript
import PBAC, { PBACPolicy, PBACEvaluateOptionsParams } from '@moonlightjs/pbac';
```

Next, define your policies:

```javascript
const examplePolicy: PBACPolicy = {
  Version: '1.0.0',
  Statement: [
    {
      Effect: 'Allow',
      Action: ['read'],
      Resource: ['resource:${user.id}'],
      Principal: { user: ['user1', 'user2'] },
      Condition: {
        'StringEquals': { 'user:id': ['user1', 'user2'] },
      },
    },
  ],
};
```


Create a new PBAC instance with the defined policies:

```javascript
const pbac = new PBAC(examplePolicy);
```

Evaluate access based on the given options:

```javascript
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
console.log('Access granted:', accessGranted);
```


## Testing

This library includes unit tests using Jest. To run the tests, execute the following command:

```bash
npm test
```

## Acknowledgments

This library is a TypeScript adaptation of the <u>[node-pbac](https://github.com/monken/node-pbac)</u> project. A big thank you to the original author and contributors for their work on the initial implementation.