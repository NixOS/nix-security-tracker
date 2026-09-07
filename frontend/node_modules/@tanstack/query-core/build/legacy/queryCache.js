import { i as _classPrivateFieldInitSpec, n as _classPrivateFieldGet2, t as _classPrivateFieldSet2 } from "./classPrivateFieldSet2-CV7wyte-.js";
import { hashQueryKeyByOptions, matchQuery } from "./utils.js";
import { Subscribable } from "./subscribable.js";
import { notifyManager } from "./notifyManager.js";
import { Query } from "./query.js";
//#region src/queryCache.ts
var _queries = /* @__PURE__ */ new WeakMap();
var QueryCache = class extends Subscribable {
	constructor(config = {}) {
		super();
		this.config = config;
		_classPrivateFieldInitSpec(this, _queries, void 0);
		_classPrivateFieldSet2(_queries, this, /* @__PURE__ */ new Map());
	}
	build(client, options, state) {
		const queryKey = options.queryKey;
		const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
		let query = this.get(queryHash);
		if (!query) {
			query = new Query({
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
		if (!_classPrivateFieldGet2(_queries, this).has(query.queryHash)) {
			_classPrivateFieldGet2(_queries, this).set(query.queryHash, query);
			this.notify({
				type: "added",
				query
			});
		}
	}
	remove(query) {
		const queryInMap = _classPrivateFieldGet2(_queries, this).get(query.queryHash);
		if (queryInMap) {
			query.destroy();
			if (queryInMap === query) _classPrivateFieldGet2(_queries, this).delete(query.queryHash);
			this.notify({
				type: "removed",
				query
			});
		}
	}
	clear() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				this.remove(query);
			});
		});
	}
	get(queryHash) {
		return _classPrivateFieldGet2(_queries, this).get(queryHash);
	}
	getAll() {
		return [..._classPrivateFieldGet2(_queries, this).values()];
	}
	find(filters) {
		const defaultedFilters = {
			exact: true,
			...filters
		};
		return this.getAll().find((query) => matchQuery(defaultedFilters, query));
	}
	findAll(filters = {}) {
		const queries = this.getAll();
		return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
	}
	notify(event) {
		notifyManager.batch(() => {
			this.listeners.forEach((listener) => {
				listener(event);
			});
		});
	}
	onFocus() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				query.onFocus();
			});
		});
	}
	onOnline() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				query.onOnline();
			});
		});
	}
};
//#endregion
export { QueryCache };

//# sourceMappingURL=queryCache.js.map