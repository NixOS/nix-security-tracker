declare function setAttribute(el: Element, attr: string, v: string): () => void;
declare function setProperty<T extends Element, K extends keyof T & string>(el: T, prop: K, v: T[K]): () => void;
declare function setStyle(el: HTMLElement | null | undefined, style: Partial<CSSStyleDeclaration>): () => void;
declare function setStyleProperty(el: HTMLElement | null | undefined, prop: string, value: string): () => void;

export { setAttribute, setProperty, setStyle, setStyleProperty };
