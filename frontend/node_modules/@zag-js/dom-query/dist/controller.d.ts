interface ControlledElementOptions {
    /**
     * If false, controlled element following is disabled
     */
    followControlledElements?: boolean | undefined;
}
/**
 * Checks if an element is within a controlled element that should be considered "inside"
 * the component via aria-controls relationships.
 */
declare function isControlledElement(container: HTMLElement, element: HTMLElement): boolean;
/**
 * Finds controlled elements recursively starting from a search root.
 * Calls the provided callback for each valid controlled element found.
 */
declare function findControlledElements(searchRoot: HTMLElement, callback: (controlledElement: HTMLElement) => void): void;
/**
 * Gets all controlled elements that are outside the container but should be included
 * in the interaction boundary.
 */
declare function getControlledElements(container: HTMLElement): HTMLElement[];
/**
 * Checks if an element has an interactive container role.
 */
declare function isInteractiveContainerElement(element: Element): boolean;
/**
 * Checks if an element is a controller (has aria-controls and is expanded).
 */
declare function isControllerElement(element: Element): boolean;
/**
 * Checks if an element or its descendants have controllers.
 */
declare function hasControllerElements(element: Element): boolean;
/**
 * Checks if an element is controlled by any expanded controller.
 */
declare function isControlledByExpandedController(element: Element): boolean;

export { type ControlledElementOptions, findControlledElements, getControlledElements, hasControllerElements, isControlledByExpandedController, isControlledElement, isControllerElement, isInteractiveContainerElement };
