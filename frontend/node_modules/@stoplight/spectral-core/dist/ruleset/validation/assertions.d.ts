import { RulesetSourceContext } from './errors';
import type { FileRuleDefinition, RuleDefinition, RulesetDefinition } from '../types';
export declare function assertValidRuleset(ruleset: unknown, format?: 'js' | 'json', sourceContext?: RulesetSourceContext): asserts ruleset is RulesetDefinition;
export declare function assertValidRule(rule: FileRuleDefinition, name: string): asserts rule is RuleDefinition;
