import { mkdirSync, writeFileSync } from "fs";
import { join, parse } from "path";
import { Application, DeclarationReflection, ParameterType, ReflectionKind, ReflectionSymbolId, ReflectionType, Renderer, } from "typedoc";
/**
 * Options for the type of coverage file to be written.
 * @enum
 */
export const CoverageOutputType = {
    /**
     * Write the coverage badge as an SVG file.
     */
    svg: "svg",
    /**
     * Write the coverage as a JSON file.
     */
    json: "json",
    /**
     * Write both the coverage badge as an SVG file and the coverage as a JSON file.
     */
    all: "all",
};
const svg = (color, label, ratio, width) => {
    const ratioGapWidth = 20;
    const ratioRectWidth = 40;
    const ratioRectX = width - ratioRectWidth;
    const ratioTextX = ratioRectX + ratioGapWidth;
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20">
  <script/>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <rect rx="3" width="${width}" height="20" fill="#555"/>
  <rect rx="3" x="${ratioRectX}" width="${ratioRectWidth}" height="20" fill="${color}"/>
  <path fill="${color}" d="M${ratioRectX} 0h4v20h-4z"/>
  <rect rx="3" width="${width}" height="20" fill="url(#a)"/>
  <g fill="#fff" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <g text-anchor="left">
      <text x="5" y="15" fill="#010101" fill-opacity=".3">${label}</text>
      <text x="5" y="14">${label}</text>
    </g>
    <g text-anchor="middle">
      <text x="${ratioTextX}" y="15" fill="#010101" fill-opacity=".3">${ratio}%</text>
      <text x="${ratioTextX}" y="14">${ratio}%</text>
    </g>
  </g>
</svg>
`.trim();
};
/**
 * Alias of {@linkcode coveragePlugin} which is used by TypeDoc when the plugin's name
 * is specified in the `plugins` option.
 */
export function load(app) {
    coveragePlugin(app);
}
/**
 * Load the `typedoc-plugin-coverage` plugin.
 * @param app - The {@linkcode Application} instance to load the plugin into.
 */
export function coveragePlugin(app) {
    app.options.addDeclaration({
        name: "coverageLabel",
        help: "The text to display on the coverage badge label. Defaults to 'document'.",
        defaultValue: "document",
    });
    app.options.addDeclaration({
        name: "coverageColor",
        help: "The color to use for the coverage badge background. "
            + "Defaults to a dynamic color depending on the current coverage percentage.",
        defaultValue: "",
    });
    app.options.addDeclaration({
        name: "coverageOutputPath",
        help: "The location where the SVG coverage badge will be written. Defaults to '<output directory>/coverage.svg'.",
        type: ParameterType.Path,
    });
    app.options.addDeclaration({
        name: "coverageOutputType",
        help: "Whether to write the coverage badge as an SVG file, JSON file or both. Defaults to 'svg'.",
        type: ParameterType.Map,
        map: CoverageOutputType,
        defaultValue: CoverageOutputType.svg,
    });
    app.options.addDeclaration({
        name: "coverageSvgWidth",
        help: "The width, in pixels, of the generated SVG file.",
        type: ParameterType.Number,
        defaultValue: 104,
    });
    // For TypeDoc 0.28.20 and later we can generate our output with the generate outputs event
    // which will work if the user is only using JSON or markdown output but prior to that, the
    // event didn't exist so we assume generation should occur during the HTML output generation.
    if ("EVENT_GENERATE_OUTPUTS_END" in Application) {
        // @ts-expect-error not yet released
        app.on(Application.EVENT_GENERATE_OUTPUTS_END, (project) => {
            generateCoverageOutputs(app, project);
        });
    }
    else {
        app.renderer.on(Renderer.EVENT_END, (event) => {
            generateCoverageOutputs(app, event.project);
        });
    }
}
// Override the function name so TypeDoc's log message shows the plugin name rather
// than the function name when loading via a config file that imports the function.
Object.defineProperty(coveragePlugin, "name", {
    value: "typedoc-plugin-coverage",
});
Object.defineProperty(load, "name", {
    value: "typedoc-plugin-coverage",
});
function generateCoverageOutputs(app, project) {
    const notDocumented = [];
    let actualCount = 0;
    let expectedCount = 0;
    const packagesRequiringDocumentation = app.options.isSet("packagesRequiringDocumentation")
        ? app.options.getValue("packagesRequiringDocumentation")
        : (project.packageName ?? ReflectionSymbolId.UNKNOWN_PACKAGE);
    const intentionallyNotDocumented = app.options.getValue("intentionallyNotDocumented");
    // This code is basically a copy/paste of TypeDoc 0.28.0's validateDocumentation function
    // https://github.com/TypeStrong/typedoc/blob/master/src/lib/validation/documentation.ts
    // where we record numbers checked rather than giving warnings.
    // ========================================================================================
    let kinds = app.options
        .getValue("requiredToBeDocumented")
        .reduce((acc, kindName) => acc | ReflectionKind[kindName], 0);
    // Functions, Constructors, and Accessors never have comments directly on them.
    // If they are required to be documented, what's really required is that their
    // contained signatures have a comment.
    if (kinds & ReflectionKind.FunctionOrMethod) {
        kinds |= ReflectionKind.CallSignature;
        kinds = kinds & ~ReflectionKind.FunctionOrMethod;
    }
    if (kinds & ReflectionKind.Constructor) {
        kinds |= ReflectionKind.ConstructorSignature;
        kinds = kinds & ~ReflectionKind.Constructor;
    }
    if (kinds & ReflectionKind.Accessor) {
        kinds |= ReflectionKind.GetSignature | ReflectionKind.SetSignature;
        kinds = kinds & ~ReflectionKind.Accessor;
    }
    const toProcess = project.getReflectionsByKind(kinds);
    const seen = new Set();
    outer: while (toProcess.length) {
        const ref = toProcess.shift();
        if (seen.has(ref))
            continue;
        seen.add(ref);
        // If we're a non-parameter inside a parameter, we shouldn't care. Parameters don't get deeply documented
        let r = ref.parent;
        while (r) {
            if (r.kindOf(ReflectionKind.Parameter)) {
                continue outer;
            }
            r = r.parent;
        }
        // Type aliases own their comments, even if they're function-likes.
        // So if we're a type literal owned by a type alias, don't do anything.
        if (ref.kindOf(ReflectionKind.TypeLiteral)
            && ref.parent?.kindOf(ReflectionKind.TypeAlias)) {
            toProcess.push(ref.parent);
            continue;
        }
        // Call signatures are considered documented if they have a comment directly, or their
        // container has a comment and they are directly within a type literal belonging to that container.
        if (ref.kindOf(ReflectionKind.CallSignature)
            && ref.parent?.kindOf(ReflectionKind.TypeLiteral)) {
            toProcess.push(ref.parent.parent);
            continue;
        }
        // Call signatures are considered documented if they are directly within a documented type alias.
        if (ref.kindOf(ReflectionKind.ConstructorSignature)
            && ref.parent?.parent?.kindOf(ReflectionKind.TypeAlias)) {
            toProcess.push(ref.parent.parent);
            continue;
        }
        if (ref instanceof DeclarationReflection) {
            const signatures = ref.type instanceof ReflectionType
                ? ref.type.declaration.getNonIndexSignatures()
                : ref.getNonIndexSignatures();
            if (signatures.length) {
                // We've been asked to validate this reflection, so we should validate that
                // signatures all have comments
                toProcess.push(...signatures);
                if (ref.kindOf(ReflectionKind.SignatureContainer)) {
                    // Comments belong to each signature, and will not be included on this object.
                    continue;
                }
            }
        }
        const symbolId = project.getSymbolIdFromReflection(ref);
        // #2644, signatures may be documented by their parent reflection.
        const hasComment = ref.hasComment()
            || (ref.kindOf(ReflectionKind.SomeSignature) && ref.parent?.hasComment());
        // Diverging from validateDocumentation here.
        if (!symbolId || !packagesRequiringDocumentation.includes(symbolId.packageName))
            continue;
        if (intentionallyNotDocumented.includes(ref.getFriendlyFullName()))
            continue;
        ++expectedCount;
        if (hasComment) {
            ++actualCount;
        }
        else {
            notDocumented.push(ref.getFullName());
        }
        app.logger.verbose(`[typedoc-plugin-coverage]: ${ref.getFullName()} ${ref.hasComment() ? "is" : "not"} considered documented.`);
    }
    const percentDocumented = expectedCount
        ? Math.floor((100 * actualCount) / expectedCount)
        : 0;
    let label = app.options.getValue("coverageLabel");
    let color = app.options.getValue("coverageColor");
    if (!color) {
        if (percentDocumented < 50) {
            color = "#db654f";
        }
        else if (percentDocumented < 90) {
            color = "#dab226";
        }
        else {
            color = "#4fc921";
        }
    }
    const width = app.options.getValue("coverageSvgWidth");
    const badge = svg(color, label, percentDocumented, width);
    const baseOutFile = app.options.getValue("coverageOutputPath")
        || join(app.options.getValue("html") || app.options.getValue("out"), "coverage.svg");
    const { dir, name } = parse(baseOutFile);
    mkdirSync(dir, { recursive: true });
    const outFileSvg = join(dir, `${name}.svg`);
    const outFileJson = join(dir, `${name}.json`);
    const outputType = app.options.getValue("coverageOutputType");
    switch (outputType) {
        case CoverageOutputType.svg:
            writeFileSync(outFileSvg, badge);
            break;
        case CoverageOutputType.json:
            writeFileSync(outFileJson, JSON.stringify({
                percent: percentDocumented,
                expected: expectedCount,
                actual: actualCount,
                notDocumented,
            }));
            break;
        case CoverageOutputType.all:
            writeFileSync(outFileJson, JSON.stringify({
                percent: percentDocumented,
                expected: expectedCount,
                actual: actualCount,
                notDocumented,
            }));
            writeFileSync(outFileSvg, badge);
            break;
        default:
            // This should never happen, but just in case.
            app.logger.warn(`[typedoc-plugin-coverage]: Invalid coverage output type: ${outputType}`);
    }
}
