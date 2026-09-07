//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = class e {
	static isValidExtension(e) {
		return /^x-/.test(e);
	}
	getExtension(t) {
		if (!e.isValidExtension(t)) throw Error(`Invalid specification extension: '${t}'. Extensions must start with prefix 'x-`);
		return this[t] ? this[t] : null;
	}
	addExtension(t, n) {
		if (!e.isValidExtension(t)) throw Error(`Invalid specification extension: '${t}'. Extensions must start with prefix 'x-`);
		this[t] = n;
	}
	listExtensions() {
		let t = [];
		for (let n in this) Object.prototype.hasOwnProperty.call(this, n) && e.isValidExtension(n) && t.push(n);
		return t;
	}
};
//#endregion
//#region src/model/oas-common.ts
function r(e, t) {
	if (e && n.isValidExtension(t)) return e[t];
}
function i(e, t, r) {
	e && n.isValidExtension(t) && (e[t] = r);
}
//#endregion
//#region src/model/server.ts
var a = class {
	constructor(e, t) {
		this.url = e, this.description = t, this.variables = {};
	}
	addVariable(e, t) {
		this.variables[e] = t;
	}
}, o = class {
	constructor(e, t, n) {
		this.default = e, this.enum = t, this.description = n;
	}
};
//#endregion
export { n as a, r as i, o as n, t as o, i as r, a as t };

//# sourceMappingURL=server-qOUqr--r.mjs.map