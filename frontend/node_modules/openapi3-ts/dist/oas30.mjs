import { a as e, i as t, n, o as r, r as i, t as a } from "./server-qOUqr--r.mjs";
import * as o from "yaml";
//#region src/dsl/openapi-builder30.ts
var s = class e {
	static create(t) {
		return new e(t);
	}
	constructor(e) {
		this.rootDoc = e || {
			openapi: "3.0.0",
			info: {
				title: "app",
				version: "version"
			},
			paths: {},
			components: {
				schemas: {},
				responses: {},
				parameters: {},
				examples: {},
				requestBodies: {},
				headers: {},
				securitySchemes: {},
				links: {},
				callbacks: {}
			},
			tags: [],
			servers: []
		};
	}
	getSpec() {
		return this.rootDoc;
	}
	getSpecAsJson(e, t) {
		return JSON.stringify(this.rootDoc, e, t);
	}
	getSpecAsYaml(e, t) {
		return o.stringify(this.rootDoc, e, t);
	}
	static isValidOpenApiVersion(e) {
		e ||= "";
		let t = /(\d+)\.(\d+).(\d+)/.exec(e);
		return !!(t && parseInt(t[1], 10) >= 3);
	}
	addOpenApiVersion(t) {
		if (!e.isValidOpenApiVersion(t)) throw Error("Invalid OpenApi version: " + t + ". Follow convention: 3.x.y");
		return this.rootDoc.openapi = t, this;
	}
	addInfo(e) {
		return this.rootDoc.info = e, this;
	}
	addContact(e) {
		return this.rootDoc.info.contact = e, this;
	}
	addLicense(e) {
		return this.rootDoc.info.license = e, this;
	}
	addTitle(e) {
		return this.rootDoc.info.title = e, this;
	}
	addDescription(e) {
		return this.rootDoc.info.description = e, this;
	}
	addTermsOfService(e) {
		return this.rootDoc.info.termsOfService = e, this;
	}
	addVersion(e) {
		return this.rootDoc.info.version = e, this;
	}
	addPath(e, t) {
		return this.rootDoc.paths[e] = {
			...this.rootDoc.paths[e] || {},
			...t
		}, this;
	}
	addSchema(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.schemas = this.rootDoc.components.schemas || {}, this.rootDoc.components.schemas[e] = t, this;
	}
	addResponse(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.responses = this.rootDoc.components.responses || {}, this.rootDoc.components.responses[e] = t, this;
	}
	addParameter(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.parameters = this.rootDoc.components.parameters || {}, this.rootDoc.components.parameters[e] = t, this;
	}
	addExample(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.examples = this.rootDoc.components.examples || {}, this.rootDoc.components.examples[e] = t, this;
	}
	addRequestBody(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.requestBodies = this.rootDoc.components.requestBodies || {}, this.rootDoc.components.requestBodies[e] = t, this;
	}
	addHeader(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.headers = this.rootDoc.components.headers || {}, this.rootDoc.components.headers[e] = t, this;
	}
	addSecurityScheme(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.securitySchemes = this.rootDoc.components.securitySchemes || {}, this.rootDoc.components.securitySchemes[e] = t, this;
	}
	addLink(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.links = this.rootDoc.components.links || {}, this.rootDoc.components.links[e] = t, this;
	}
	addCallback(e, t) {
		return this.rootDoc.components = this.rootDoc.components || {}, this.rootDoc.components.callbacks = this.rootDoc.components.callbacks || {}, this.rootDoc.components.callbacks[e] = t, this;
	}
	addServer(e) {
		return this.rootDoc.servers = this.rootDoc.servers || [], this.rootDoc.servers.push(e), this;
	}
	addTag(e) {
		return this.rootDoc.tags = this.rootDoc.tags || [], this.rootDoc.tags.push(e), this;
	}
	addExternalDocs(e) {
		return this.rootDoc.externalDocs = e, this;
	}
};
//#endregion
//#region src/model/openapi30.ts
function c(t, n) {
	if (!e.isValidExtension(n)) return t[n];
}
function l(e) {
	return Object.prototype.hasOwnProperty.call(e, "$ref");
}
function u(e) {
	return !Object.prototype.hasOwnProperty.call(e, "$ref");
}
//#endregion
//#region src/oas30.ts
var d = /* @__PURE__ */ r({
	OpenApiBuilder: () => s,
	Server: () => a,
	ServerVariable: () => n,
	addExtension: () => i,
	getExtension: () => t,
	getPath: () => c,
	isReferenceObject: () => l,
	isSchemaObject: () => u
});
//#endregion
export { s as OpenApiBuilder, a as Server, n as ServerVariable, i as addExtension, t as getExtension, c as getPath, l as isReferenceObject, u as isSchemaObject, d as t };

//# sourceMappingURL=oas30.mjs.map