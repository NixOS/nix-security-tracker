import "./chunk-QZ7TP4HQ.mjs";

// src/color-format-gradient.ts
var generateRGB_R = (orientation, dir, zValue) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
  const result = {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,0),rgb(${zValue},255,0))`
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,255),rgb(${zValue},255,255))`,
      WebkitMaskImage: maskImage,
      maskImage
    }
  };
  return result;
};
var generateRGB_G = (orientation, dir, zValue) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
  const result = {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},0),rgb(255,${zValue},0))`
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},255),rgb(255,${zValue},255))`,
      WebkitMaskImage: maskImage,
      maskImage
    }
  };
  return result;
};
var generateRGB_B = (orientation, dir, zValue) => {
  const maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
  const result = {
    areaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,0,${zValue}),rgb(255,0,${zValue}))`
    },
    areaGradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,255,${zValue}),rgb(255,255,${zValue}))`,
      WebkitMaskImage: maskImage,
      maskImage
    }
  };
  return result;
};
var generateHSL_H = (orientation, dir, zValue) => {
  const result = {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(dir)]}, hsla(0,0%,0%,1) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,1) 100%)`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,50%),hsla(0,0%,50%,0))`,
        `hsl(${zValue}, 100%, 50%)`
      ].join(",")
    }
  };
  return result;
};
var generateHSL_S = (orientation, dir, alphaValue) => {
  const result = {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(!dir)]}, hsla(0,0%,0%,${alphaValue}) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,${alphaValue}) 100%)`,
        `linear-gradient(to ${orientation[Number(dir)]},hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        "hsl(0, 0%, 50%)"
      ].join(",")
    }
  };
  return result;
};
var generateHSL_L = (orientation, dir, zValue) => {
  const result = {
    areaStyles: {},
    areaGradientStyles: {
      backgroundImage: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,${zValue}%),hsla(0,0%,${zValue}%,0))`,
        `linear-gradient(to ${orientation[Number(dir)]},hsl(0,100%,${zValue}%),hsl(60,100%,${zValue}%),hsl(120,100%,${zValue}%),hsl(180,100%,${zValue}%),hsl(240,100%,${zValue}%),hsl(300,100%,${zValue}%),hsl(360,100%,${zValue}%))`
      ].join(",")
    }
  };
  return result;
};
var generateHSB_H = (orientation, dir, zValue) => {
  const result = {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(dir)]},hsl(0,0%,0%),hsla(0,0%,0%,0))`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,100%),hsla(0,0%,100%,0))`,
        `hsl(${zValue}, 100%, 50%)`
      ].join(",")
    }
  };
  return result;
};
var generateHSB_S = (orientation, dir, alphaValue) => {
  const result = {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsla(0,0%,0%,${alphaValue}),hsla(0,0%,0%,0))`,
        `linear-gradient(to ${orientation[Number(dir)]},hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,0%),hsl(0,0%,100%))`
      ].join(",")
    }
  };
  return result;
};
var generateHSB_B = (orientation, dir, alphaValue) => {
  const result = {
    areaStyles: {},
    areaGradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsla(0,0%,100%,${alphaValue}),hsla(0,0%,100%,0))`,
        `linear-gradient(to ${orientation[Number(dir)]},hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        "#000"
      ].join(",")
    }
  };
  return result;
};
export {
  generateHSB_B,
  generateHSB_H,
  generateHSB_S,
  generateHSL_H,
  generateHSL_L,
  generateHSL_S,
  generateRGB_B,
  generateRGB_G,
  generateRGB_R
};
