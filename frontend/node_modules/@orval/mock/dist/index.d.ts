import * as _orval_core0 from "@orval/core";
import { GenerateMockImports, GeneratorOptions, GeneratorVerbOptions, GlobalMockOptions } from "@orval/core";

//#region src/index.d.ts
declare const DEFAULT_MOCK_OPTIONS: GlobalMockOptions;
declare const generateMockImports: GenerateMockImports;
declare const generateMock: (generatorVerbOptions: GeneratorVerbOptions, generatorOptions: Omit<GeneratorOptions, "mock"> & {
  mock: GlobalMockOptions;
}) => _orval_core0.ClientMockGeneratorBuilder;
//#endregion
export { DEFAULT_MOCK_OPTIONS, generateMock, generateMockImports };
//# sourceMappingURL=index.d.ts.map