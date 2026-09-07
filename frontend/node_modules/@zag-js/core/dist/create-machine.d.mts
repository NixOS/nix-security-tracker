import { MachineSchema, GuardFn, Machine, Transition, Params } from './types.mjs';

declare function createGuards<T extends MachineSchema>(): {
    and: (...guards: Array<GuardFn<T> | T["guard"]>) => (params: any) => boolean;
    or: (...guards: Array<GuardFn<T> | T["guard"]>) => (params: any) => boolean;
    not: (guard: GuardFn<T> | T["guard"]) => (params: any) => boolean;
};
declare function createMachine<T extends MachineSchema>(config: Machine<T>): Machine<T>;
declare function setup<T extends MachineSchema>(): {
    guards: {
        and: (...guards: (T["guard"] | GuardFn<T>)[]) => (params: any) => boolean;
        or: (...guards: (T["guard"] | GuardFn<T>)[]) => (params: any) => boolean;
        not: (guard: T["guard"] | GuardFn<T>) => (params: any) => boolean;
    };
    createMachine: (config: Machine<T>) => Machine<T>;
    choose: (transitions: Transition<T> | Transition<T>[]) => ({ choose }: Params<T>) => T["action"][] | undefined;
};

export { createGuards, createMachine, setup };
