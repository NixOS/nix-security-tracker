// src/marquee.dom.ts
var dom = {
  getRootId: (ctx) => ctx.ids?.root ?? `marquee:${ctx.id}`,
  getViewportId: (ctx) => ctx.ids?.viewport ?? `marquee:${ctx.id}:viewport`,
  getContentId: (ctx, index) => ctx.ids?.content?.(index) ?? `marquee:${ctx.id}:content:${index}`,
  getRootEl: (ctx) => ctx.getById(dom.getRootId(ctx)),
  getViewportEl: (ctx) => ctx.getById(dom.getViewportId(ctx)),
  getContentEl: (ctx, index) => ctx.getById(dom.getContentId(ctx, index))
};
export {
  dom
};
