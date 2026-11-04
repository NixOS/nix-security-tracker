import { inject } from "regexparam";

const suggestions = "/suggestions";
const issues = "/issues";
const user = "/user";

export const paths = {
  home: "/",
  suggestions,
  suggestionById: `${suggestions}/by-id/:id`,
  suggestionByCve: `${suggestions}/by-cve/:cveId`,
  issues,
  issue: `${issues}/:code`,
  notifications: "/notifications",
  user,
  userSubscriptions: `${user}/subscriptions`,
  userTokens: `${user}/tokens`,
} as const;

export const suggestionPath = (id: number) => inject(paths.suggestionById, { id: String(id) });
export const issuePath = (code: string) => inject(paths.issue, { code });
