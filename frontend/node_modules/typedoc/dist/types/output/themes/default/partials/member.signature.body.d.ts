import type { DefaultThemeRenderContext } from "../DefaultThemeRenderContext.js";
import { JSX } from "#utils";
import type { SignatureReflection } from "#models";
export declare function memberSignatureBody(context: DefaultThemeRenderContext, props: SignatureReflection, { hideSources }?: {
    hideSources?: boolean;
}): JSX.Element;
