import policySchema from './schema.json';
import conditions from './conditions';
import ZSchema from 'z-schema';
import util from 'util';
import isPlainObject from 'lodash/isPlainObject';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import every from 'lodash/every';
import get from 'lodash/get';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import flatten from 'lodash/fp/flatten';
import find from 'lodash/fp/find';

interface PBACOptions {
  validateSchema?: boolean;
  validatePolicies?: boolean;
  schema?: any;
  conditions?: any;
  variables?: any;
}

export interface PBACContext {
  [key: string]: any;
}

export interface PBACPrincipal {
  [key: string]: any;
}

export interface PBACCondition {
  [key: string]: any;
}

export interface PBACStatement {
  Sid?: string;
  Effect: 'Allow' | 'Deny';
  Action?: string[];
  NotAction?: string[];
  Resource?: string[];
  NotResource?: string[];
  Principal?: PBACPrincipal;
  NotPrincipal?: PBACPrincipal;
  Condition?: PBACCondition;
}

export interface PBACPolicy {
  Version: string;
  Statement: PBACStatement[];
}

export interface PBACEvaluateOptions {
  action: string;
  resource: string;
  principal: PBACPrincipal;
  context: PBACContext;
  variables?: PBACVariables;
  effect?: 'Allow' | 'Deny';
}

export interface PBACEvaluateOptionsParams {
  action: string;
  resource: string;
  principal?: PBACPrincipal;
  context: PBACContext;
  variables?: PBACVariables;
  effect?: 'Allow' | 'Deny';
}

interface PBACVariables {
  [key: string]: {
    [key: string]:
      | string
      | number
      | boolean
      | Date
      | null
      | undefined
      | PBACVariables;
  };
}

class PBAC {
  private policies: PBACPolicy[];
  private validateSchema: boolean;
  private validatePolicies: boolean;
  private schema: any;
  private conditions: any;

  constructor(policies: PBACPolicy[] | PBACPolicy, options?: PBACOptions) {
    options = options || {};

    const myConditions = isPlainObject(options.conditions)
      ? Object.assign(options.conditions, conditions)
      : conditions;

    this.policies = [];
    this.validateSchema = options.validateSchema ?? true;
    this.validatePolicies = options.validatePolicies ?? true;
    this.schema = isPlainObject(options.schema) ? options.schema : policySchema;
    this.conditions = myConditions;

    this.addConditionsToSchema();
    if (this.validateSchema) this._validateSchema();
    this.add(policies);
  }

  add(policies: PBACPolicy[] | PBACPolicy): void {
    const myPolicies = Array.isArray(policies) ? policies : [policies];
    if (this.validatePolicies) this.validate(policies);
    this.policies.push(...myPolicies);
  }

  addConditionsToSchema() {
    const definition = get(this.schema, 'definitions.Condition');
    if (!definition) return;
    const props = (definition.properties = {} as Record<string, any>);
    forEach(this.conditions, function (condition: any, name: string) {
      props[name] = {
        type: 'object',
      };
    });
  }

  _validateSchema() {
    const validator = new ZSchema({});
    if (!validator.validateSchema(this.schema))
      this.throw(
        'schema validation failed with',
        validator.getLastError().message,
      );
  }

  validate(policies: PBACPolicy[] | PBACPolicy) {
    const myPolicies = Array.isArray(policies) ? policies : [policies];
    const validator = new ZSchema({
      noExtraKeywords: true,
    });
    return every(myPolicies, (policy) => {
      const result = validator.validate(policy, this.schema);
      if (!result)
        this.throw(
          'policy validation failed with',
          validator.getLastError().message,
        );
      return result;
    });
  }

  evaluate(options: PBACEvaluateOptionsParams): boolean {
    const myOptions: PBACEvaluateOptions = Object.assign(
      {
        action: '',
        resource: '',
        principal: {},
        context: options.variables || {},
      },
      options || {},
    );

    if (
      this.filterPoliciesBy({
        effect: 'Deny',
        resource: myOptions.resource,
        action: myOptions.action,
        context: myOptions.context,
        principal: myOptions.principal,
      })
    )
      return false;

    return !!this.filterPoliciesBy({
      effect: 'Allow',
      resource: myOptions.resource,
      action: myOptions.action,
      context: myOptions.context,
      principal: myOptions.principal,
    });
  }

  private filterPoliciesBy(
    options: PBACEvaluateOptions,
  ): PBACStatement | undefined {
    return flow(
      map('Statement'),
      flatten,
      find((statement: PBACStatement) => {
        if (statement.Effect !== options.effect) return false;
        if (
          statement.Principal &&
          !this.evaluatePrincipal(statement.Principal, options.principal)
        ) {
          return false;
        }
        if (
          statement.NotPrincipal &&
          this.evaluateNotPrincipal(statement.NotPrincipal, options.principal)
        ) {
          return false;
        }
        if (
          statement.Resource &&
          !this.evaluateResource(
            statement.Resource,
            options.resource,
            options.context,
          )
        ) {
          return false;
        }
        if (
          statement.NotResource &&
          this.evaluateResource(
            statement.NotResource,
            options.resource,
            options.context,
          )
        ) {
          return false;
        }
        if (
          statement.Action &&
          !this.evaluateAction(statement.Action, options.action)
        ) {
          return false;
        }
        if (
          statement.NotAction &&
          this.evaluateAction(statement.NotAction, options.action)
        ) {
          return false;
        }
        return this.evaluateCondition(statement.Condition, options.context);
      }),
    )(this.policies);
  }

  getVariableValue(variable: string, variables: PBACVariables): any {
    const parts = variable.split('.');
    if (
      isPlainObject(variables[parts[0]]) &&
      !isUndefined(variables[parts[0]][parts[1]])
    )
      return variables[parts[0]][parts[1]];
    else return variable;
  }

  private interpolateValue(value: string, variables: PBACVariables): string {
    return value.replace(/\${(.+?)}/g, (match, variable) => {
      return this.getVariableValue(variable, variables);
    });
  }

  getContextValue(key: string, context: PBACVariables): any {
    const parts = key.split('.');
    if (
      isPlainObject(context[parts[0]]) &&
      !isUndefined(context[parts[0]][parts[1]])
    ) {
      return context[parts[0]][parts[1]];
    } else {
      return key;
    }
  }

  evaluateNotPrincipal(principals: any, reference: PBACVariables['principal']) {
    return Object.keys(reference).find((key) => {
      return this.conditions['ForAllValues:StringEquals'].call(
        this,
        principals[key],
        reference[key],
      );
    });
  }

  evaluatePrincipal(
    principals: PBACPrincipal,
    reference: PBACVariables,
  ): boolean {
    return (
      Object.keys(reference).find((key) => {
        if (isEmpty(reference[key])) return false;
        return this.conditions['ForAnyValue:StringEquals'].call(
          this,
          principals[key],
          reference[key],
        );
      }) !== undefined
    );
  }

  evaluateAction(actions: string[], reference: string): string | undefined {
    return actions.find((action) => {
      return this.conditions.StringLike.call(this, reference, action);
    });
  }

  evaluateResource(
    resources: string | string[],
    reference: string,
    context: PBACVariables,
  ) {
    const myResources = Array.isArray(resources) ? resources : [resources];
    return myResources.find((resource) => {
      const value = this.interpolateValue(resource, context);
      return this.conditions.StringLike.call(this, reference, value);
    });
  }

  evaluateCondition(
    condition: PBACCondition | undefined,
    context: PBACVariables,
  ): boolean {
    if (!isPlainObject(condition) || !condition) {
      return true;
    }
    const conditions = this.conditions;
    return every(Object.keys(condition), (key) => {
      const expression = condition[key];
      const contextKey = Object.keys(expression)[0];
      let values = expression[contextKey];
      values = Array.isArray(values) ? values : [values];

      let prefix;
      if (key.indexOf(':') !== -1) {
        prefix = key.substring(0, key.indexOf(':'));
      }
      if (prefix === 'ForAnyValue' || prefix === 'ForAllValues') {
        return conditions[key].call(
          this,
          this.getContextValue(contextKey, context),
          values,
        );
      } else {
        return values.find((value: any) =>
          conditions[key].call(
            this,
            this.getContextValue(contextKey, context),
            value,
          ),
        );
      }
    });
  }

  throw(name: string, message: string, ...args: any[]): void {
    args.unshift(message);
    const e = new Error();
    e.name = name;
    e.message = util.format(args);
    throw e;
  }
}

export default PBAC;
