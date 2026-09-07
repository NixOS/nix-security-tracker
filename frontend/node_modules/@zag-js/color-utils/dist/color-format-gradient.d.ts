declare const generateRGB_R: (orientation: [string, string], dir: boolean, zValue: number) => {
    areaStyles: {
        backgroundImage: string;
    };
    areaGradientStyles: {
        backgroundImage: string;
        WebkitMaskImage: string;
        maskImage: string;
    };
};
declare const generateRGB_G: (orientation: [string, string], dir: boolean, zValue: number) => {
    areaStyles: {
        backgroundImage: string;
    };
    areaGradientStyles: {
        backgroundImage: string;
        WebkitMaskImage: string;
        maskImage: string;
    };
};
declare const generateRGB_B: (orientation: [string, string], dir: boolean, zValue: number) => {
    areaStyles: {
        backgroundImage: string;
    };
    areaGradientStyles: {
        backgroundImage: string;
        WebkitMaskImage: string;
        maskImage: string;
    };
};
declare const generateHSL_H: (orientation: [string, string], dir: boolean, zValue: number) => {
    areaStyles: {};
    areaGradientStyles: {
        background: string;
    };
};
declare const generateHSL_S: (orientation: [string, string], dir: boolean, alphaValue: number) => {
    areaStyles: {};
    areaGradientStyles: {
        background: string;
    };
};
declare const generateHSL_L: (orientation: [string, string], dir: boolean, zValue: number) => {
    areaStyles: {};
    areaGradientStyles: {
        backgroundImage: string;
    };
};
declare const generateHSB_H: (orientation: [string, string], dir: boolean, zValue: number) => {
    areaStyles: {};
    areaGradientStyles: {
        background: string;
    };
};
declare const generateHSB_S: (orientation: [string, string], dir: boolean, alphaValue: number) => {
    areaStyles: {};
    areaGradientStyles: {
        background: string;
    };
};
declare const generateHSB_B: (orientation: [string, string], dir: boolean, alphaValue: number) => {
    areaStyles: {};
    areaGradientStyles: {
        background: string;
    };
};

export { generateHSB_B, generateHSB_H, generateHSB_S, generateHSL_H, generateHSL_L, generateHSL_S, generateRGB_B, generateRGB_G, generateRGB_R };
