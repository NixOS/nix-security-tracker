import { MachineSchema, Machine, Service } from '@zag-js/core';

declare function useMachine<T extends MachineSchema>(machine: Machine<T>, userProps?: Partial<T["props"]>): Service<T>;

export { useMachine };
