Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_classPrivateFieldSet2 = require("./classPrivateFieldSet2-Bo0ZyOIv.cjs");
const require_utils = require("./utils.cjs");
const require_subscribable = require("./subscribable.cjs");
const require_notifyManager = require("./notifyManager.cjs");
const require_query = require("./query.cjs");
//#region src/queryCache.ts
var _queries = /* @__PURE__ */ new WeakMap();
var QueryCache = class extends require_subscribable.Subscribable {
	constructor(config = {}) {
		super();
		this.config = config;
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _queries, void 0);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_queries, this, /* @__PURE__ */ new Map());
	}
	build(client, options, state) {
		const queryKey = options.queryKey;
		const queryHash = options.queryHash ?? require_utils.hashQueryKeyByOptions(queryKey, options);
		let query = this.get(queryHash);
		if (!query) {
			query = new require_query.Query({
				client,
				queryKey,
				queryHash,
				options: client.defaultQueryOptions(options),
				state,
				defaultOptions: client.getQueryDefaults(queryKey)
			});
			this.add(query);
		}
		return query;
	}
	add(query) {
		if (!require_classPrivateFieldSet2._classPrivateFieldGet2(_queries, this).has(query.queryHash)) {
			require_classPrivateFieldSet2._classPrivateFieldGet2(_queries, this).set(query.queryHash, query);
			this.notify({
				type: "added",
				query
			});
		}
	}
	remove(query) {
		const queryInMap = require_classPrivateFieldSet2._classPrivateFieldGet2(_queries, this).get(query.queryHash);
		if (queryInMap) {
			query.destroy();
			if (queryInMap === query) require_classPrivateFieldSet2._classPrivateFieldGet2(_queries, this).delete(query.queryHash);
			this.notify({
				type: "removed",
				query
			});
		}
	}
	clear() {
		require_notifyManager.notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				this.remove(query);
			});
		});
	}
	get(queryHash) {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_queries, this).get(queryHash);
	}
	getAll() {
		return [...require_classPrivateFieldSet2._classPrivateFieldGet2(_queries, this).values()];
	}
	find(filters) {
		const defaultedFilters = {
			exact: true,
			...filters
		};
		return this.getAll().find((query) => require_utils.matchQuery(defaultedFilters, query));
	}
	findAll(filters = {}) {
		const queries = this.getAll();
		return Object.keys(filters).length > 0 ? queries.filter((query) => require_utils.matchQuery(filters, query)) : queries;
	}
	notify(event) {
		require_notifyManager.notifyManager.batch(() => {
			this.listeners.forEach((listener) => {
				listener(event);
			});
		});
	}
	onFocus() {
		require_notifyManager.notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				query.onFocus();
			});
		});
	}
	onOnline() {
		require_notifyManager.notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				query.onOnline();
			});
		});
	}
};
//#endregion
exports.QueryCache = QueryCache;

//# sourceMappingURL=queryCache.cjs.map