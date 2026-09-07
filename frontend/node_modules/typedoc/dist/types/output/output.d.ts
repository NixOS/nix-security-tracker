import type { ProjectReflection } from "#models";
import { type OutputSpecification } from "#node-utils";
import type { Application } from "../application.js";
export declare class Outputs {
    readonly application: Application;
    private outputs;
    private defaultOutput;
    constructor(application: Application);
    addOutput(name: string, output: (path: string, project: ProjectReflection) => Promise<void>): void;
    setDefaultOutputName(name: string): void;
    getOutputSpecs(): OutputSpecification[];
    writeOutputs(project: ProjectReflection): Promise<void>;
    writeOutput(output: OutputSpecification, project: ProjectReflection): Promise<void>;
}
