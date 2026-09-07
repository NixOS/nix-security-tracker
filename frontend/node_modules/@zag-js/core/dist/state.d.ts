import { MachineSchema, Machine, MachineState, TransitionMatch } from './types.js';

declare function ensureStateIndex<T extends MachineSchema>(machine: Machine<T>): Map<string, MachineState<T, string>>;
type StateChain<T extends MachineSchema> = Array<{
    path: string;
    state: MachineState<T>;
}>;
declare function getStateChain<T extends MachineSchema>(machine: Machine<T>, state: T["state"] | undefined): StateChain<T>;
declare function resolveStateValue<T extends MachineSchema>(machine: Machine<T>, value: T["state"] | string, source?: string): T["state"];
declare function getStateDefinition<T extends MachineSchema>(machine: Machine<T>, state: T["state"]): MachineState<T, string>;
declare function findTransition<T extends MachineSchema>(machine: Machine<T>, state: T["state"], eventType: string): TransitionMatch<T>;
declare function getExitEnterStates<T extends MachineSchema>(machine: Machine<T>, prevState: T["state"] | undefined, nextState: T["state"], reenter?: boolean): {
    exiting: {
        path: string;
        state: MachineState<T, string>;
    }[];
    entering: {
        path: string;
        state: MachineState<T, string>;
    }[];
};
declare function matchesState(current: string | undefined, value: string): boolean;
declare function hasTag<T extends MachineSchema>(machine: Machine<T>, state: T["state"], tag: T["tag"]): boolean;

export { ensureStateIndex, findTransition, getExitEnterStates, getStateChain, getStateDefinition, hasTag, matchesState, resolveStateValue };
