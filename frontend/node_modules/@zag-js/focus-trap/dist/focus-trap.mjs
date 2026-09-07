import {
  __publicField
} from "./chunk-QZ7TP4HQ.mjs";

// src/focus-trap.ts
import {
  addDomEvent,
  contains,
  getActiveElement,
  getControlledElements,
  getDocument,
  getEventTarget,
  getFocusables,
  getTabbables,
  getTabIndex,
  hasControllerElements,
  isControlledByExpandedController,
  isControlledElement,
  isDocument,
  isFocusable,
  isTabbable
} from "@zag-js/dom-query";
var activeFocusTraps = {
  activateTrap(trapStack, trap) {
    if (trapStack.length > 0) {
      const activeTrap = trapStack[trapStack.length - 1];
      if (activeTrap !== trap) {
        activeTrap.pause();
      }
    }
    const trapIndex = trapStack.indexOf(trap);
    if (trapIndex === -1) {
      trapStack.push(trap);
    } else {
      trapStack.splice(trapIndex, 1);
      trapStack.push(trap);
    }
  },
  deactivateTrap(trapStack, trap) {
    const trapIndex = trapStack.indexOf(trap);
    if (trapIndex !== -1) {
      trapStack.splice(trapIndex, 1);
    }
    if (trapStack.length > 0) {
      trapStack[trapStack.length - 1].unpause();
    }
  }
};
var sharedTrapStack = [];
var FocusTrap = class {
  constructor(elements, options) {
    __publicField(this, "trapStack");
    __publicField(this, "config");
    __publicField(this, "doc");
    __publicField(this, "state", {
      containers: [],
      containerGroups: [],
      tabbableGroups: [],
      nodeFocusedBeforeActivation: null,
      mostRecentlyFocusedNode: null,
      active: false,
      paused: false,
      delayInitialFocusTimer: void 0,
      recentNavEvent: void 0
    });
    // Used to only pass `focusVisible` on keyboard-driven return focus.
    __publicField(this, "lastInteractionType", "keyboard");
    // Track portal containers that contain controlled elements
    __publicField(this, "portalContainers", /* @__PURE__ */ new Set());
    __publicField(this, "listenerCleanups", []);
    __publicField(this, "handleFocus", (event) => {
      const target = getEventTarget(event);
      const targetContained = this.findContainerIndex(target, event) >= 0;
      if (targetContained || isDocument(target)) {
        if (targetContained) {
          this.state.mostRecentlyFocusedNode = target;
        }
      } else {
        event.stopImmediatePropagation();
        let nextNode;
        let navAcrossContainers = true;
        if (this.state.mostRecentlyFocusedNode) {
          if (getTabIndex(this.state.mostRecentlyFocusedNode) > 0) {
            const mruContainerIdx = this.findContainerIndex(this.state.mostRecentlyFocusedNode);
            const { tabbableNodes } = this.state.containerGroups[mruContainerIdx];
            if (tabbableNodes.length > 0) {
              const mruTabIdx = tabbableNodes.findIndex((node) => node === this.state.mostRecentlyFocusedNode);
              if (mruTabIdx >= 0) {
                if (this.config.isKeyForward(this.state.recentNavEvent)) {
                  if (mruTabIdx + 1 < tabbableNodes.length) {
                    nextNode = tabbableNodes[mruTabIdx + 1];
                    navAcrossContainers = false;
                  }
                } else {
                  if (mruTabIdx - 1 >= 0) {
                    nextNode = tabbableNodes[mruTabIdx - 1];
                    navAcrossContainers = false;
                  }
                }
              }
            }
          } else {
            if (!this.state.containerGroups.some((g) => g.tabbableNodes.some((n) => getTabIndex(n) > 0))) {
              navAcrossContainers = false;
            }
          }
        } else {
          navAcrossContainers = false;
        }
        if (navAcrossContainers) {
          nextNode = this.findNextNavNode({
            // move FROM the MRU node, not event-related node (which will be the node that is
            //  outside the trap causing the focus escape we're trying to fix)
            target: this.state.mostRecentlyFocusedNode,
            isBackward: this.config.isKeyBackward(this.state.recentNavEvent)
          });
        }
        if (nextNode) {
          this.tryFocus(nextNode);
        } else {
          this.tryFocus(this.state.mostRecentlyFocusedNode || this.getInitialFocusNode());
        }
      }
      this.state.recentNavEvent = void 0;
    });
    __publicField(this, "handlePointerDown", (event) => {
      this.lastInteractionType = "pointer";
      const target = getEventTarget(event);
      if (this.findContainerIndex(target, event) >= 0) {
        return;
      }
      if (valueOrHandler(this.config.clickOutsideDeactivates, event)) {
        this.deactivate({ returnFocus: this.config.returnFocusOnDeactivate });
        return;
      }
      if (valueOrHandler(this.config.allowOutsideClick, event)) {
        return;
      }
      event.preventDefault();
    });
    __publicField(this, "handleClick", (event) => {
      const target = getEventTarget(event);
      if (this.findContainerIndex(target, event) >= 0) {
        return;
      }
      if (valueOrHandler(this.config.clickOutsideDeactivates, event)) {
        return;
      }
      if (valueOrHandler(this.config.allowOutsideClick, event)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    });
    __publicField(this, "handleTabKey", (event) => {
      this.lastInteractionType = "keyboard";
      if (this.config.isKeyForward(event) || this.config.isKeyBackward(event)) {
        this.state.recentNavEvent = event;
        const isBackward = this.config.isKeyBackward(event);
        const destinationNode = this.findNextNavNode({ event, isBackward });
        if (!destinationNode) return;
        if (isTabEvent(event)) {
          event.preventDefault();
        }
        this.tryFocus(destinationNode);
      }
    });
    __publicField(this, "handleEscapeKey", (event) => {
      if (isEscapeEvent(event) && valueOrHandler(this.config.escapeDeactivates, event) !== false) {
        event.preventDefault();
        this.deactivate();
      }
    });
    __publicField(this, "_mutationObserver");
    __publicField(this, "setupMutationObserver", () => {
      const win = this.doc.defaultView || window;
      this._mutationObserver = new win.MutationObserver((mutations) => {
        const isFocusedNodeRemoved = mutations.some((mutation) => {
          const removedNodes = Array.from(mutation.removedNodes);
          return removedNodes.some((node) => node === this.state.mostRecentlyFocusedNode);
        });
        if (isFocusedNodeRemoved) {
          this.tryFocus(this.getInitialFocusNode());
        }
        const hasControlledChanges = mutations.some((mutation) => {
          if (mutation.type === "attributes" && (mutation.attributeName === "aria-controls" || mutation.attributeName === "aria-expanded")) {
            return true;
          }
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            return Array.from(mutation.addedNodes).some((node) => {
              if (node.nodeType !== Node.ELEMENT_NODE) return false;
              const element = node;
              if (hasControllerElements(element)) {
                return true;
              }
              if (element.id && !this.state.containers.some((c) => c.contains(element))) {
                return isControlledByExpandedController(element);
              }
              return false;
            });
          }
          return false;
        });
        if (hasControlledChanges && this.state.active && !this.state.paused) {
          this.updateTabbableNodes();
          this.updatePortalContainers();
        }
      });
    });
    __publicField(this, "updateObservedNodes", () => {
      this._mutationObserver?.disconnect();
      if (this.state.active && !this.state.paused) {
        this.state.containers.map((container) => {
          this._mutationObserver?.observe(container, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ["aria-controls", "aria-expanded"]
          });
        });
        this.portalContainers.forEach((portalContainer) => {
          this.observePortalContainer(portalContainer);
        });
      }
    });
    __publicField(this, "getInitialFocusNode", () => {
      let node = this.getNodeForOption("initialFocus", { hasFallback: true });
      if (node === false) {
        return false;
      }
      if (node === void 0 || node && !isFocusable(node)) {
        const activeElement = getActiveElement(this.doc);
        if (activeElement && this.findContainerIndex(activeElement) >= 0) {
          node = activeElement;
        } else {
          const firstTabbableGroup = this.state.tabbableGroups[0];
          const firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
          node = firstTabbableNode || this.getNodeForOption("fallbackFocus");
        }
      } else if (node === null) {
        node = this.getNodeForOption("fallbackFocus");
      }
      if (!node) {
        throw new Error("Your focus-trap needs to have at least one focusable element");
      }
      if (!node.isConnected) {
        node = this.getNodeForOption("fallbackFocus");
      }
      if (!node || !node.isConnected) {
        throw new Error("Your focus-trap needs to have at least one focusable element");
      }
      return node;
    });
    __publicField(this, "tryFocus", (node, focusOptions) => {
      if (node === false) return;
      if (node === getActiveElement(this.doc)) return;
      if (!node || !node.focus) {
        this.tryFocus(this.getInitialFocusNode());
        return;
      }
      node.focus({ preventScroll: !!this.config.preventScroll, ...focusOptions });
      this.state.mostRecentlyFocusedNode = node;
      if (isSelectableInput(node)) {
        node.select();
      }
    });
    __publicField(this, "deactivate", (deactivateOptions) => {
      if (!this.state.active) return this;
      const options = {
        onDeactivate: this.config.onDeactivate,
        onPostDeactivate: this.config.onPostDeactivate,
        checkCanReturnFocus: this.config.checkCanReturnFocus,
        ...deactivateOptions
      };
      clearTimeout(this.state.delayInitialFocusTimer);
      this.state.delayInitialFocusTimer = void 0;
      this.removeListeners();
      this.state.active = false;
      this.state.paused = false;
      this.updateObservedNodes();
      activeFocusTraps.deactivateTrap(this.trapStack, this);
      this.portalContainers.clear();
      const onDeactivate = this.getOption(options, "onDeactivate");
      const onPostDeactivate = this.getOption(options, "onPostDeactivate");
      const checkCanReturnFocus = this.getOption(options, "checkCanReturnFocus");
      const returnFocus = this.getOption(options, "returnFocus", "returnFocusOnDeactivate");
      onDeactivate?.();
      const finishDeactivation = () => {
        delay(() => {
          if (returnFocus && this.isSafeToOverrideFocus()) {
            const returnFocusNode = this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation);
            const focusOptions = this.lastInteractionType === "keyboard" ? { focusVisible: true } : void 0;
            this.tryFocus(returnFocusNode, focusOptions);
          }
          onPostDeactivate?.();
        });
      };
      if (returnFocus && checkCanReturnFocus) {
        const returnFocusNode = this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation);
        checkCanReturnFocus(returnFocusNode).then(finishDeactivation, finishDeactivation);
        return this;
      }
      finishDeactivation();
      return this;
    });
    __publicField(this, "pause", (pauseOptions) => {
      if (this.state.paused || !this.state.active) {
        return this;
      }
      const onPause = this.getOption(pauseOptions, "onPause");
      const onPostPause = this.getOption(pauseOptions, "onPostPause");
      this.state.paused = true;
      onPause?.();
      this.removeListeners();
      this.updateObservedNodes();
      onPostPause?.();
      return this;
    });
    __publicField(this, "unpause", (unpauseOptions) => {
      if (!this.state.paused || !this.state.active) {
        return this;
      }
      const onUnpause = this.getOption(unpauseOptions, "onUnpause");
      const onPostUnpause = this.getOption(unpauseOptions, "onPostUnpause");
      this.state.paused = false;
      onUnpause?.();
      try {
        this.updateTabbableNodes();
      } catch {
      }
      this.attachListeners();
      try {
        this.commitInitialFocus();
      } catch {
      }
      this.updateObservedNodes();
      onPostUnpause?.();
      return this;
    });
    __publicField(this, "updateContainerElements", (containerElements) => {
      this.state.containers = Array.isArray(containerElements) ? containerElements.filter(Boolean) : [containerElements].filter(Boolean);
      if (this.state.active) {
        this.updateTabbableNodes();
      }
      this.updateObservedNodes();
      return this;
    });
    __publicField(this, "getReturnFocusNode", (previousActiveElement) => {
      const node = this.getNodeForOption("setReturnFocus", {
        params: [previousActiveElement]
      });
      return node ? node : node === false ? false : previousActiveElement;
    });
    __publicField(this, "getOption", (configOverrideOptions, optionName, configOptionName) => {
      return configOverrideOptions && configOverrideOptions[optionName] !== void 0 ? configOverrideOptions[optionName] : (
        // @ts-expect-error
        this.config[configOptionName || optionName]
      );
    });
    __publicField(this, "getNodeForOption", (optionName, { hasFallback = false, params = [] } = {}) => {
      let optionValue = this.config[optionName];
      if (typeof optionValue === "function") optionValue = optionValue(...params);
      if (optionValue === true) optionValue = void 0;
      if (!optionValue) {
        if (optionValue === void 0 || optionValue === false) {
          return optionValue;
        }
        throw new Error(`\`${optionName}\` was specified but was not a node, or did not return a node`);
      }
      let node = optionValue;
      if (typeof optionValue === "string") {
        try {
          node = this.doc.querySelector(optionValue);
        } catch (err) {
          throw new Error(`\`${optionName}\` appears to be an invalid selector; error="${err.message}"`);
        }
        if (!node) {
          if (!hasFallback) {
            throw new Error(`\`${optionName}\` as selector refers to no known node`);
          }
        }
      }
      return node;
    });
    __publicField(this, "findNextNavNode", (opts) => {
      const { event, isBackward = false } = opts;
      const target = opts.target || getEventTarget(event);
      this.updateTabbableNodes();
      let destinationNode = null;
      if (this.state.tabbableGroups.length > 0) {
        const containerIndex = this.findContainerIndex(target, event);
        const containerGroup = containerIndex >= 0 ? this.state.containerGroups[containerIndex] : void 0;
        if (containerIndex < 0) {
          if (isBackward) {
            destinationNode = this.state.tabbableGroups[this.state.tabbableGroups.length - 1].lastTabbableNode;
          } else {
            destinationNode = this.state.tabbableGroups[0].firstTabbableNode;
          }
        } else if (isBackward) {
          let startOfGroupIndex = this.state.tabbableGroups.findIndex(
            ({ firstTabbableNode }) => target === firstTabbableNode
          );
          if (startOfGroupIndex < 0 && (containerGroup?.container === target || isFocusable(target) && !isTabbable(target) && !containerGroup?.nextTabbableNode(target, false))) {
            startOfGroupIndex = containerIndex;
          }
          if (startOfGroupIndex >= 0) {
            const destinationGroupIndex = startOfGroupIndex === 0 ? this.state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
            const destinationGroup = this.state.tabbableGroups[destinationGroupIndex];
            destinationNode = getTabIndex(target) >= 0 ? destinationGroup.lastTabbableNode : destinationGroup.lastDomTabbableNode;
          } else if (!isTabEvent(event)) {
            destinationNode = containerGroup?.nextTabbableNode(target, false);
          }
        } else {
          let lastOfGroupIndex = this.state.tabbableGroups.findIndex(
            ({ lastTabbableNode }) => target === lastTabbableNode
          );
          if (lastOfGroupIndex < 0 && (containerGroup?.container === target || isFocusable(target) && !isTabbable(target) && !containerGroup?.nextTabbableNode(target))) {
            lastOfGroupIndex = containerIndex;
          }
          if (lastOfGroupIndex >= 0) {
            const destinationGroupIndex = lastOfGroupIndex === this.state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;
            const destinationGroup = this.state.tabbableGroups[destinationGroupIndex];
            destinationNode = getTabIndex(target) >= 0 ? destinationGroup.firstTabbableNode : destinationGroup.firstDomTabbableNode;
          } else if (!isTabEvent(event)) {
            destinationNode = containerGroup?.nextTabbableNode(target);
          }
        }
      } else {
        destinationNode = this.getNodeForOption("fallbackFocus");
      }
      return destinationNode;
    });
    this.trapStack = options.trapStack || sharedTrapStack;
    const config = {
      returnFocusOnDeactivate: true,
      escapeDeactivates: true,
      delayInitialFocus: true,
      followControlledElements: true,
      isKeyForward,
      isKeyBackward,
      ...options
    };
    this.doc = config.document || getDocument(Array.isArray(elements) ? elements[0] : elements);
    this.config = config;
    this.updateContainerElements(elements);
    this.setupMutationObserver();
  }
  addPortalContainer(controlledElement) {
    const portalContainer = controlledElement.parentElement;
    if (portalContainer && !this.portalContainers.has(portalContainer)) {
      this.portalContainers.add(portalContainer);
      if (this.state.active && !this.state.paused) {
        this.observePortalContainer(portalContainer);
      }
    }
  }
  observePortalContainer(portalContainer) {
    this._mutationObserver?.observe(portalContainer, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-controls", "aria-expanded"]
    });
  }
  updatePortalContainers() {
    if (!this.config.followControlledElements) return;
    this.state.containers.forEach((container) => {
      const controlledElements = getControlledElements(container);
      controlledElements.forEach((controlledElement) => {
        this.addPortalContainer(controlledElement);
      });
    });
  }
  get active() {
    return this.state.active;
  }
  get paused() {
    return this.state.paused;
  }
  findContainerIndex(element, event) {
    const composedPath = typeof event?.composedPath === "function" ? event.composedPath() : void 0;
    return this.state.containerGroups.findIndex(
      ({ container, tabbableNodes }) => container.contains(element) || composedPath?.includes(container) || tabbableNodes.find((node) => node === element) || this.isControlledElement(container, element) || this.isPersistentElement(element, event)
    );
  }
  isControlledElement(container, element) {
    if (!this.config.followControlledElements) return false;
    return isControlledElement(container, element);
  }
  isPersistentElement(element, event) {
    const persistentElements = this.config.persistentElements;
    if (!persistentElements || persistentElements.length === 0) return false;
    const composedPath = typeof event?.composedPath === "function" ? event.composedPath() : void 0;
    return persistentElements.some((getEl) => {
      const el = getEl();
      return contains(el, element) || el != null && composedPath?.includes(el);
    });
  }
  updateTabbableNodes() {
    this.state.containerGroups = this.state.containers.map((container) => {
      const tabbableNodes = getTabbables(container, { getShadowRoot: this.config.getShadowRoot });
      const focusableNodes = getFocusables(container, { getShadowRoot: this.config.getShadowRoot });
      const firstTabbableNode = tabbableNodes[0];
      const lastTabbableNode = tabbableNodes[tabbableNodes.length - 1];
      const firstDomTabbableNode = firstTabbableNode;
      const lastDomTabbableNode = lastTabbableNode;
      let posTabIndexesFound = false;
      for (let i = 0; i < tabbableNodes.length; i++) {
        if (getTabIndex(tabbableNodes[i]) > 0) {
          posTabIndexesFound = true;
          break;
        }
      }
      function nextTabbableNode(node, forward = true) {
        const nodeIdx = tabbableNodes.indexOf(node);
        if (nodeIdx >= 0) {
          return tabbableNodes[nodeIdx + (forward ? 1 : -1)];
        }
        const focusableIdx = focusableNodes.indexOf(node);
        if (focusableIdx < 0) return void 0;
        if (forward) {
          for (let i = focusableIdx + 1; i < focusableNodes.length; i++) {
            if (isTabbable(focusableNodes[i])) return focusableNodes[i];
          }
        } else {
          for (let i = focusableIdx - 1; i >= 0; i--) {
            if (isTabbable(focusableNodes[i])) return focusableNodes[i];
          }
        }
        return void 0;
      }
      return {
        container,
        tabbableNodes,
        focusableNodes,
        posTabIndexesFound,
        firstTabbableNode,
        lastTabbableNode,
        firstDomTabbableNode,
        lastDomTabbableNode,
        nextTabbableNode
      };
    });
    this.state.tabbableGroups = this.state.containerGroups.filter((group) => group.tabbableNodes.length > 0);
    if (this.state.tabbableGroups.length <= 0 && !this.getNodeForOption("fallbackFocus")) {
      throw new Error(
        "Your focus-trap must have at least one container with at least one tabbable node in it at all times"
      );
    }
    if (this.state.containerGroups.find((g) => g.posTabIndexesFound) && this.state.containerGroups.length > 1) {
      throw new Error(
        "At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps."
      );
    }
  }
  attachListeners() {
    if (!this.state.active) return;
    activeFocusTraps.activateTrap(this.trapStack, this);
    this.listenerCleanups.push(
      addDomEvent(this.doc, "focusin", this.handleFocus, true),
      addDomEvent(this.doc, "mousedown", this.handlePointerDown, { capture: true, passive: false }),
      addDomEvent(this.doc, "touchstart", this.handlePointerDown, { capture: true, passive: false }),
      addDomEvent(this.doc, "click", this.handleClick, { capture: true, passive: false }),
      addDomEvent(this.doc, "keydown", this.handleTabKey, { capture: true, passive: false }),
      addDomEvent(this.doc, "keydown", this.handleEscapeKey)
    );
    return this;
  }
  commitInitialFocus() {
    this.state.delayInitialFocusTimer = this.config.delayInitialFocus ? delay(() => {
      this.tryFocus(this.getInitialFocusNode());
    }) : this.tryFocus(this.getInitialFocusNode());
    return this;
  }
  addListeners() {
    if (!this.state.active) return;
    this.attachListeners();
    this.commitInitialFocus();
    return this;
  }
  removeListeners() {
    if (!this.state.active) return;
    this.listenerCleanups.forEach((cleanup) => cleanup());
    this.listenerCleanups = [];
    return this;
  }
  containsElement(element) {
    return this.state.containers.some((container) => contains(container, element));
  }
  // Don't override focus that something else (incl. another trap in the stack) already claimed since deactivation.
  isSafeToOverrideFocus() {
    const activeEl = getActiveElement(this.doc);
    if (!activeEl || activeEl === this.doc.body) return true;
    if (this.containsElement(activeEl)) return true;
    return this.trapStack.some((trap) => trap !== this && trap.containsElement(activeEl));
  }
  activate(activateOptions) {
    if (this.state.active) {
      return this;
    }
    const onActivate = this.getOption(activateOptions, "onActivate");
    const onPostActivate = this.getOption(activateOptions, "onPostActivate");
    const checkCanFocusTrap = this.getOption(activateOptions, "checkCanFocusTrap");
    if (!checkCanFocusTrap) {
      this.updateTabbableNodes();
    }
    this.state.active = true;
    this.state.paused = false;
    this.state.nodeFocusedBeforeActivation = getActiveElement(this.doc);
    onActivate?.();
    const finishActivation = () => {
      if (checkCanFocusTrap) {
        this.updateTabbableNodes();
      }
      this.addListeners();
      this.updateObservedNodes();
      onPostActivate?.();
    };
    if (checkCanFocusTrap) {
      checkCanFocusTrap(this.state.containers.concat()).then(finishActivation, finishActivation);
      return this;
    }
    finishActivation();
    return this;
  }
};
var isKeyboardEvent = (event) => event?.type === "keydown";
var isTabEvent = (event) => isKeyboardEvent(event) && event?.key === "Tab";
var isKeyForward = (e) => isKeyboardEvent(e) && e.key === "Tab" && !e?.shiftKey;
var isKeyBackward = (e) => isKeyboardEvent(e) && e.key === "Tab" && e?.shiftKey;
var valueOrHandler = (value, ...params) => typeof value === "function" ? value(...params) : value;
var isEscapeEvent = (event) => !event.isComposing && event.key === "Escape";
var delay = (fn) => setTimeout(fn, 0);
var isSelectableInput = (node) => node.localName === "input" && "select" in node && typeof node.select === "function";
export {
  FocusTrap
};
