// src/create-machine.ts
import { ensureStateIndex } from "./state.mjs";
function createGuards() {
  return {
    and: (...guards) => {
      return function andGuard(params) {
        return guards.every((str) => params.guard(str));
      };
    },
    or: (...guards) => {
      return function orGuard(params) {
        return guards.some((str) => params.guard(str));
      };
    },
    not: (guard) => {
      return function notGuard(params) {
        return !params.guard(guard);
      };
    }
  };
}
function createMachine(config) {
  ensureStateIndex(config);
  return config;
}
function setup() {
  return {
    guards: createGuards(),
    createMachine: (config) => {
      return createMachine(config);
    },
    choose: (transitions) => {
      return function chooseFn({ choose }) {
        return choose(transitions)?.actions;
      };
    }
  };
}
export {
  createGuards,
  createMachine,
  setup
};
