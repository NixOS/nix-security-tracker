// src/get-era-format.ts
function getEraFormat(date) {
  if (!date) return void 0;
  const id = date.calendar.identifier;
  if (id === "gregory" || id === "iso8601") {
    return date.era === "BC" ? "short" : void 0;
  }
  return "short";
}
export {
  getEraFormat
};
