/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const G = globalThis, ot = G.ShadowRoot && (G.ShadyCSS === void 0 || G.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, nt = Symbol(), dt = /* @__PURE__ */ new WeakMap();
let vt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== nt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ot && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = dt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && dt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ht = (o) => new vt(typeof o == "string" ? o : o + "", void 0, nt), st = (o, ...t) => {
  const e = o.length === 1 ? o[0] : t.reduce((i, n, s) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + o[s + 1], o[0]);
  return new vt(e, o, nt);
}, Lt = (o, t) => {
  if (ot) o.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), n = G.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = e.cssText, o.appendChild(i);
  }
}, ht = ot ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Ht(e);
})(o) : o;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Bt, defineProperty: zt, getOwnPropertyDescriptor: Rt, getOwnPropertyNames: Dt, getOwnPropertySymbols: qt, getPrototypeOf: It } = Object, J = globalThis, ut = J.trustedTypes, Ft = ut ? ut.emptyScript : "", Wt = J.reactiveElementPolyfillSupport, z = (o, t) => o, it = { toAttribute(o, t) {
  switch (t) {
    case Boolean:
      o = o ? Ft : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, t) {
  let e = o;
  switch (t) {
    case Boolean:
      e = o !== null;
      break;
    case Number:
      e = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(o);
      } catch {
        e = null;
      }
  }
  return e;
} }, xt = (o, t) => !Bt(o, t), pt = { attribute: !0, type: String, converter: it, reflect: !1, useDefault: !1, hasChanged: xt };
Symbol.metadata ??= Symbol("metadata"), J.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let U = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = pt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(t, i, e);
      n !== void 0 && zt(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: n, set: s } = Rt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(r) {
      this[e] = r;
    } };
    return { get: n, set(r) {
      const a = n?.call(this);
      s?.call(this, r), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? pt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(z("elementProperties"))) return;
    const t = It(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(z("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(z("properties"))) {
      const e = this.properties, i = [...Dt(e), ...qt(e)];
      for (const n of i) this.createProperty(n, e[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, n] of e) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const n = this._$Eu(e, i);
      n !== void 0 && this._$Eh.set(n, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const n of i) e.unshift(ht(n));
    } else t !== void 0 && e.push(ht(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Lt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const s = (i.converter?.toAttribute !== void 0 ? i.converter : it).toAttribute(e, i.type);
      this._$Em = t, s == null ? this.removeAttribute(n) : this.setAttribute(n, s), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const s = i.getPropertyOptions(n), r = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : it;
      this._$Em = n;
      const a = r.fromAttribute(e, s.type);
      this[n] = a ?? this._$Ej?.get(n) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, n = !1, s) {
    if (t !== void 0) {
      const r = this.constructor;
      if (n === !1 && (s = this[t]), i ??= r.getPropertyOptions(t), !((i.hasChanged ?? xt)(s, e) || i.useDefault && i.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: n, wrapped: s }, r) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, r ?? e ?? this[t]), s !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), n === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [n, s] of this._$Ep) this[n] = s;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, s] of i) {
        const { wrapped: r } = s, a = this[n];
        r !== !0 || this._$AL.has(n) || a === void 0 || this.C(n, void 0, s, a);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
U.elementStyles = [], U.shadowRootOptions = { mode: "open" }, U[z("elementProperties")] = /* @__PURE__ */ new Map(), U[z("finalized")] = /* @__PURE__ */ new Map(), Wt?.({ ReactiveElement: U }), (J.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const rt = globalThis, ft = (o) => o, V = rt.trustedTypes, mt = V ? V.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, At = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, Et = "?" + w, Gt = `<${Et}>`, C = document, R = () => C.createComment(""), D = (o) => o === null || typeof o != "object" && typeof o != "function", at = Array.isArray, Vt = (o) => at(o) || typeof o?.[Symbol.iterator] == "function", X = `[ 	
\f\r]`, N = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _t = /-->/g, gt = />/g, x = RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), yt = /'/g, bt = /"/g, Ct = /^(?:script|style|textarea|title)$/i, St = (o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }), p = St(1), j = St(2), S = Symbol.for("lit-noChange"), f = Symbol.for("lit-nothing"), $t = /* @__PURE__ */ new WeakMap(), A = C.createTreeWalker(C, 129);
function Ot(o, t) {
  if (!at(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return mt !== void 0 ? mt.createHTML(t) : t;
}
const Jt = (o, t) => {
  const e = o.length - 1, i = [];
  let n, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = N;
  for (let a = 0; a < e; a++) {
    const l = o[a];
    let c, u, h = -1, m = 0;
    for (; m < l.length && (r.lastIndex = m, u = r.exec(l), u !== null); ) m = r.lastIndex, r === N ? u[1] === "!--" ? r = _t : u[1] !== void 0 ? r = gt : u[2] !== void 0 ? (Ct.test(u[2]) && (n = RegExp("</" + u[2], "g")), r = x) : u[3] !== void 0 && (r = x) : r === x ? u[0] === ">" ? (r = n ?? N, h = -1) : u[1] === void 0 ? h = -2 : (h = r.lastIndex - u[2].length, c = u[1], r = u[3] === void 0 ? x : u[3] === '"' ? bt : yt) : r === bt || r === yt ? r = x : r === _t || r === gt ? r = N : (r = x, n = void 0);
    const b = r === x && o[a + 1].startsWith("/>") ? " " : "";
    s += r === N ? l + Gt : h >= 0 ? (i.push(c), l.slice(0, h) + At + l.slice(h) + w + b) : l + w + (h === -2 ? a : b);
  }
  return [Ot(o, s + (o[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class q {
  constructor({ strings: t, _$litType$: e }, i) {
    let n;
    this.parts = [];
    let s = 0, r = 0;
    const a = t.length - 1, l = this.parts, [c, u] = Jt(t, e);
    if (this.el = q.createElement(c, i), A.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (n = A.nextNode()) !== null && l.length < a; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const h of n.getAttributeNames()) if (h.endsWith(At)) {
          const m = u[r++], b = n.getAttribute(h).split(w), v = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: s, name: v[2], strings: b, ctor: v[1] === "." ? Kt : v[1] === "?" ? Yt : v[1] === "@" ? Xt : Z }), n.removeAttribute(h);
        } else h.startsWith(w) && (l.push({ type: 6, index: s }), n.removeAttribute(h));
        if (Ct.test(n.tagName)) {
          const h = n.textContent.split(w), m = h.length - 1;
          if (m > 0) {
            n.textContent = V ? V.emptyScript : "";
            for (let b = 0; b < m; b++) n.append(h[b], R()), A.nextNode(), l.push({ type: 2, index: ++s });
            n.append(h[m], R());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Et) l.push({ type: 2, index: s });
      else {
        let h = -1;
        for (; (h = n.data.indexOf(w, h + 1)) !== -1; ) l.push({ type: 7, index: s }), h += w.length - 1;
      }
      s++;
    }
  }
  static createElement(t, e) {
    const i = C.createElement("template");
    return i.innerHTML = t, i;
  }
}
function P(o, t, e = o, i) {
  if (t === S) return t;
  let n = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const s = D(t) ? void 0 : t._$litDirective$;
  return n?.constructor !== s && (n?._$AO?.(!1), s === void 0 ? n = void 0 : (n = new s(o), n._$AT(o, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = n : e._$Cl = n), n !== void 0 && (t = P(o, n._$AS(o, t.values), n, i)), t;
}
class Zt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, n = (t?.creationScope ?? C).importNode(e, !0);
    A.currentNode = n;
    let s = A.nextNode(), r = 0, a = 0, l = i[0];
    for (; l !== void 0; ) {
      if (r === l.index) {
        let c;
        l.type === 2 ? c = new I(s, s.nextSibling, this, t) : l.type === 1 ? c = new l.ctor(s, l.name, l.strings, this, t) : l.type === 6 && (c = new Qt(s, this, t)), this._$AV.push(c), l = i[++a];
      }
      r !== l?.index && (s = A.nextNode(), r++);
    }
    return A.currentNode = C, n;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class I {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, n) {
    this.type = 2, this._$AH = f, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = n, this._$Cv = n?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = P(this, t, e), D(t) ? t === f || t == null || t === "" ? (this._$AH !== f && this._$AR(), this._$AH = f) : t !== this._$AH && t !== S && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Vt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== f && D(this._$AH) ? this._$AA.nextSibling.data = t : this.T(C.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = q.createElement(Ot(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(e);
    else {
      const s = new Zt(n, this), r = s.u(this.options);
      s.p(e), this.T(r), this._$AH = s;
    }
  }
  _$AC(t) {
    let e = $t.get(t.strings);
    return e === void 0 && $t.set(t.strings, e = new q(t)), e;
  }
  k(t) {
    at(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, n = 0;
    for (const s of t) n === e.length ? e.push(i = new I(this.O(R()), this.O(R()), this, this.options)) : i = e[n], i._$AI(s), n++;
    n < e.length && (this._$AR(i && i._$AB.nextSibling, n), e.length = n);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = ft(t).nextSibling;
      ft(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Z {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, n, s) {
    this.type = 1, this._$AH = f, this._$AN = void 0, this.element = t, this.name = e, this._$AM = n, this.options = s, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = f;
  }
  _$AI(t, e = this, i, n) {
    const s = this.strings;
    let r = !1;
    if (s === void 0) t = P(this, t, e, 0), r = !D(t) || t !== this._$AH && t !== S, r && (this._$AH = t);
    else {
      const a = t;
      let l, c;
      for (t = s[0], l = 0; l < s.length - 1; l++) c = P(this, a[i + l], e, l), c === S && (c = this._$AH[l]), r ||= !D(c) || c !== this._$AH[l], c === f ? t = f : t !== f && (t += (c ?? "") + s[l + 1]), this._$AH[l] = c;
    }
    r && !n && this.j(t);
  }
  j(t) {
    t === f ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Kt extends Z {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === f ? void 0 : t;
  }
}
class Yt extends Z {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== f);
  }
}
class Xt extends Z {
  constructor(t, e, i, n, s) {
    super(t, e, i, n, s), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = P(this, t, e, 0) ?? f) === S) return;
    const i = this._$AH, n = t === f && i !== f || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, s = t !== f && (i === f || n);
    n && this.element.removeEventListener(this.name, this, i), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Qt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    P(this, t);
  }
}
const te = rt.litHtmlPolyfillSupport;
te?.(q, I), (rt.litHtmlVersions ??= []).push("3.3.3");
const ee = (o, t, e) => {
  const i = e?.renderBefore ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const s = e?.renderBefore ?? null;
    i._$litPart$ = n = new I(t.insertBefore(R(), s), s, void 0, e ?? {});
  }
  return n._$AI(o), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = globalThis;
let E = class extends U {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ee(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return S;
  }
};
E._$litElement$ = !0, E.finalized = !0, ct.litElementHydrateSupport?.({ LitElement: E });
const ie = ct.litElementPolyfillSupport;
ie?.({ LitElement: E });
(ct.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = { ATTRIBUTE: 1 }, ne = (o) => (...t) => ({ _$litDirective$: o, values: t });
let se = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, i) {
    this._$Ct = t, this._$AM = e, this._$Ci = i;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ut = "important", re = " !" + Ut, Pt = ne(class extends se {
  constructor(o) {
    if (super(o), o.type !== oe.ATTRIBUTE || o.name !== "style" || o.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(o) {
    return Object.keys(o).reduce((t, e) => {
      const i = o[e];
      return i == null ? t : t + `${e = e.includes("-") ? e : e.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${i};`;
    }, "");
  }
  update(o, [t]) {
    const { style: e } = o.element;
    if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
    for (const i of this.ft) t[i] == null && (this.ft.delete(i), i.includes("-") ? e.removeProperty(i) : e[i] = null);
    for (const i in t) {
      const n = t[i];
      if (n != null) {
        this.ft.add(i);
        const s = typeof n == "string" && n.endsWith(re);
        i.includes("-") || s ? e.setProperty(i, s ? n.slice(0, -11) : n, s ? Ut : "") : e[i] = n;
      }
    }
    return S;
  }
}), ae = {
  locked: "Bloqueado",
  unlocked: "Desbloqueado",
  locking: "Bloqueando",
  unlocking: "Desbloqueando",
  jammed: "Atascado",
  opening: "Abriendo",
  open: "Abierto",
  unavailable: "No disponible",
  unknown: "Desconocido",
  action_lock: "Bloquear",
  action_unlock: "Desbloquear",
  action_open: "Abrir",
  door_open: "Puerta abierta",
  door_closed: "Puerta cerrada",
  door_unavailable: "Puerta no disponible",
  battery_critical: "Batería crítica",
  charging: "Cargando",
  jammed_alert: "Atasco",
  confirm_title: "Abrir pestillo",
  confirm_text: "Se liberará el pestillo y la puerta podrá abrirse. ¿Continuar?",
  confirm: "Abrir",
  cancel: "Cancelar",
  many_locks: "Hay varias cerraduras. Elige una en la configuración de la tarjeta.",
  no_locks: "No hay ninguna entidad lock.",
  not_found: "No se encuentra {entity}",
  more_info: "Más información de {name}",
  editor_entity: "Cerradura",
  editor_entity_help: "Dominio lock. Vacío: se usa la única cerradura de la casa, si solo hay una.",
  editor_name: "Nombre",
  editor_name_help: "Vacío: nombre de la entidad.",
  editor_battery: "Sensor de batería",
  editor_battery_help: "Opcional. Si se deja vacío, se busca un sensor de batería del mismo dispositivo.",
  editor_door: "Sensor de puerta",
  editor_door_help: "Opcional. Binario con device_class door del mismo dispositivo.",
  editor_jammed: "Indicador de atasco",
  editor_jammed_help: "Opcional. Binario de problema del mismo dispositivo.",
  editor_language: "Idioma",
  editor_finish: "Acabado del cuerpo",
  editor_body: "Color del cuerpo",
  editor_base: "Color del aro base",
  editor_ring: "Color del anillo",
  editor_warning: "Color de aviso",
  editor_low: "Batería baja desde (%)",
  editor_low_help: "El porcentaje y el segmento superior pasan a aviso por debajo de este valor.",
  editor_show_name: "Mostrar nombre",
  editor_show_state: "Mostrar estado",
  editor_show_battery: "Mostrar batería",
  editor_show_door: "Mostrar puerta",
  editor_show_buttons: "Mostrar botones",
  editor_confirm: "Pedir confirmación al abrir",
  editor_section_entity: "Entidades",
  editor_section_look: "Apariencia",
  editor_section_options: "Opciones",
  finish_brushed: "Metal cepillado",
  finish_matte: "Mate",
  finish_gloss: "Brillo",
  lang_es: "Español",
  lang_en: "English",
  lang_auto: "Automático (idioma de Home Assistant)",
  auto_one: "Se usará {entity} si dejas esto vacío.",
  auto_many: "Hay varias cerraduras: hay que elegir una.",
  auto_none: "No hay entidades lock en este momento.",
  blank_auto: "Automática"
}, ce = {
  locked: "Locked",
  unlocked: "Unlocked",
  locking: "Locking",
  unlocking: "Unlocking",
  jammed: "Jammed",
  opening: "Opening",
  open: "Open",
  unavailable: "Unavailable",
  unknown: "Unknown",
  action_lock: "Lock",
  action_unlock: "Unlock",
  action_open: "Open",
  door_open: "Door open",
  door_closed: "Door closed",
  door_unavailable: "Door unavailable",
  battery_critical: "Battery critical",
  charging: "Charging",
  jammed_alert: "Jammed",
  confirm_title: "Unlatch",
  confirm_text: "The latch will release and the door can open. Continue?",
  confirm: "Open",
  cancel: "Cancel",
  many_locks: "There are several locks. Pick one in the card configuration.",
  no_locks: "No lock entity found.",
  not_found: "Entity not found: {entity}",
  more_info: "More info for {name}",
  editor_entity: "Lock",
  editor_entity_help: "Lock domain. Empty: use the only lock in the home, when there is exactly one.",
  editor_name: "Name",
  editor_name_help: "Empty: entity name.",
  editor_battery: "Battery sensor",
  editor_battery_help: "Optional. Empty: a battery sensor on the same device is used.",
  editor_door: "Door sensor",
  editor_door_help: "Optional. Binary sensor with device_class door on the same device.",
  editor_jammed: "Jammed indicator",
  editor_jammed_help: "Optional. Problem binary sensor on the same device.",
  editor_language: "Language",
  editor_finish: "Body finish",
  editor_body: "Body color",
  editor_base: "Base ring color",
  editor_ring: "Light ring color",
  editor_warning: "Warning color",
  editor_low: "Low battery below (%)",
  editor_low_help: "The percentage and the top segment switch to the warning color below this value.",
  editor_show_name: "Show name",
  editor_show_state: "Show state",
  editor_show_battery: "Show battery",
  editor_show_door: "Show door",
  editor_show_buttons: "Show buttons",
  editor_confirm: "Confirm before unlatch",
  editor_section_entity: "Entities",
  editor_section_look: "Appearance",
  editor_section_options: "Options",
  finish_brushed: "Brushed metal",
  finish_matte: "Matte",
  finish_gloss: "Gloss",
  lang_es: "Español",
  lang_en: "English",
  lang_auto: "Automatic (Home Assistant language)",
  auto_one: "{entity} will be used if you leave this empty.",
  auto_many: "Several locks found: pick one.",
  auto_none: "No lock entities right now.",
  blank_auto: "Automatic"
}, Q = { es: ae, en: ce };
function k(o, t) {
  return o === "en" ? "en" : o === "auto" ? (t?.locale?.language || t?.language || "es").toLowerCase().startsWith("es") ? "es" : "en" : "es";
}
function d(o, t, e) {
  let i = Q[o][t] ?? Q.en[t] ?? Q.es[t] ?? t;
  if (e)
    for (const [n, s] of Object.entries(e))
      i = i.replaceAll(`{${n}}`, s);
  return i;
}
function le(o) {
  switch (o) {
    case "locked":
    case "unlocked":
    case "locking":
    case "unlocking":
    case "jammed":
    case "opening":
    case "open":
    case "unavailable":
    case "unknown":
      return o;
    default:
      return "unknown";
  }
}
const y = {
  body_color: "#c5cad1",
  body_finish: "brushed",
  base_color: "#16171a",
  ring_color: "#ffffff",
  warning_color: "#ff3b30",
  low_battery: 20,
  language: "es",
  confirm_open: !0,
  show_name: !0,
  show_state: !0,
  show_battery: !0,
  show_door: !0,
  show_buttons: !0
}, de = ["brushed", "matte", "gloss"];
function L(o, t) {
  if (typeof o != "string") return t;
  const e = o.trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(e) ? e.toLowerCase() : /^(rgb|hsl)a?\(\s*[\d.%\s,/+-]+\)$/.test(e) ? e : /^[a-zA-Z]{3,20}$/.test(e) ? e.toLowerCase() : t;
}
function O(o, t) {
  return typeof o == "boolean" ? o : t;
}
function Mt(o) {
  return o === "en" || o === "es" || o === "auto" ? o : "es";
}
function Nt(o) {
  return de.includes(o) ? o : "brushed";
}
function jt(o) {
  const t = typeof o == "number" ? o : typeof o == "string" ? Number(o) : NaN;
  return Number.isFinite(t) ? Math.min(100, Math.max(0, t)) : y.low_battery;
}
function B(o) {
  if (typeof o != "string") return;
  const t = o.trim();
  return t.length > 0 ? t : void 0;
}
function $(o) {
  const t = o ?? {};
  return {
    entity: B(t.entity),
    name: typeof t.name == "string" && t.name.trim() ? t.name.trim() : void 0,
    battery_entity: B(t.battery_entity),
    door_entity: B(t.door_entity),
    jammed_entity: B(t.jammed_entity),
    show_name: O(t.show_name, y.show_name),
    show_state: O(t.show_state, y.show_state),
    show_battery: O(t.show_battery, y.show_battery),
    show_door: O(t.show_door, y.show_door),
    show_buttons: O(t.show_buttons, y.show_buttons),
    confirm_open: O(t.confirm_open, y.confirm_open),
    language: Mt(t.language),
    body_color: L(t.body_color, y.body_color),
    body_finish: Nt(t.body_finish),
    base_color: L(t.base_color, y.base_color),
    ring_color: L(t.ring_color, y.ring_color),
    warning_color: L(t.warning_color, y.warning_color),
    low_battery: jt(t.low_battery)
  };
}
function he(o, t) {
  if (t != null && !(typeof t == "string" && t.trim() === ""))
    switch (o) {
      case "entity":
      case "battery_entity":
      case "door_entity":
      case "jammed_entity":
        return B(t);
      case "name":
        return (typeof t == "string" ? t.trim() : "") || void 0;
      case "language": {
        const e = Mt(t);
        return e === y.language ? void 0 : e;
      }
      case "body_finish": {
        const e = Nt(t);
        return e === y.body_finish ? void 0 : e;
      }
      case "body_color":
      case "base_color":
      case "ring_color":
      case "warning_color": {
        const e = L(t, "");
        return e ? e === y[o] ? void 0 : e : void 0;
      }
      case "low_battery": {
        const e = jt(t);
        return e === y.low_battery ? void 0 : e;
      }
      case "show_name":
      case "show_state":
      case "show_battery":
      case "show_door":
      case "show_buttons":
      case "confirm_open": {
        const e = !!t;
        return e === y[o] ? void 0 : e;
      }
      default:
        return;
    }
}
class ue extends E {
  static {
    this.styles = st`
    :host {
      display: block;
      font-family: var(--ha-font-family, var(--primary-font-family, system-ui, sans-serif));
      color: var(--primary-text-color, #212121);
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 4px 0 8px;
    }
    h3 {
      margin: 6px 0 0;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--secondary-text-color, #727272);
    }
    label,
    .lbl {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    select,
    input[type="text"],
    input[type="number"] {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      background: var(--card-background-color, var(--primary-background-color, #fff));
      color: inherit;
      font: inherit;
    }
    .helper {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.35;
      color: var(--secondary-text-color, #727272);
    }
    .color {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    input[type="color"] {
      width: 48px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      background: transparent;
      border-radius: 8px;
    }
    code {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .check {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .check input {
      width: 16px;
      height: 16px;
    }
  `;
  }
  #t;
  #e = {};
  #i = !1;
  set hass(t) {
    this.#t = t, this.requestUpdate(), this.#p();
  }
  get hass() {
    return this.#t;
  }
  setConfig(t) {
    this.#e = { ...t ?? {} }, this.requestUpdate();
  }
  firstUpdated() {
    this.#p();
  }
  render() {
    const t = k($(this.#e).language, this.#t), e = $(this.#e), i = this.#n(), n = this.#s(t, i);
    return p`
      <div class="form">
        <h3>${d(t, "editor_section_entity")}</h3>
        ${this.#o("entity", ["lock"], "editor_entity", n)}
        ${this.#h("name", "editor_name", "editor_name_help", e.name ?? "")}
        ${this.#o("battery_entity", ["sensor"], "editor_battery", d(t, "editor_battery_help"))}
        ${this.#o("door_entity", ["binary_sensor"], "editor_door", d(t, "editor_door_help"))}
        ${this.#o("jammed_entity", ["binary_sensor"], "editor_jammed", d(t, "editor_jammed_help"))}

        <h3>${d(t, "editor_section_look")}</h3>
        ${this.#l("language", "editor_language", [
      ["es", d(t, "lang_es")],
      ["en", d(t, "lang_en")],
      ["auto", d(t, "lang_auto")]
    ], e.language)}
        ${this.#l("body_finish", "editor_finish", [
      ["brushed", d(t, "finish_brushed")],
      ["matte", d(t, "finish_matte")],
      ["gloss", d(t, "finish_gloss")]
    ], e.body_finish)}
        ${this.#d("body_color", "editor_body", e.body_color)}
        ${this.#d("base_color", "editor_base", e.base_color)}
        ${this.#d("ring_color", "editor_ring", e.ring_color)}
        ${this.#d("warning_color", "editor_warning", e.warning_color)}

        <h3>${d(t, "editor_section_options")}</h3>
        ${this.#u("low_battery", "editor_low", "editor_low_help", e.low_battery)}
        ${this.#r("show_name", "editor_show_name", e.show_name)}
        ${this.#r("show_state", "editor_show_state", e.show_state)}
        ${this.#r("show_battery", "editor_show_battery", e.show_battery)}
        ${this.#r("show_door", "editor_show_door", e.show_door)}
        ${this.#r("show_buttons", "editor_show_buttons", e.show_buttons)}
        ${this.#r("confirm_open", "editor_confirm", e.confirm_open)}
      </div>
    `;
  }
  #n() {
    return Object.keys(this.#t?.states ?? {}).filter((t) => t.startsWith("lock.")).sort();
  }
  #s(t, e) {
    const i = d(t, "editor_entity_help");
    return e.length === 1 ? `${i} ${d(t, "auto_one", { entity: e[0] })}` : e.length === 0 ? `${i} ${d(t, "auto_none")}` : `${i} ${d(t, "auto_many")}`;
  }
  #o(t, e, i, n) {
    const s = k($(this.#e).language, this.#t), r = this.#e[t] ?? "", a = d(s, i);
    if (this.#i && this.#t && customElements.get("ha-entity-picker"))
      return p`
        <ha-entity-picker
          .hass=${this.#t}
          .label=${a}
          .helper=${n}
          .includeDomains=${e}
          .value=${r}
          allow-custom-entity
          @value-changed=${(c) => {
        c.stopPropagation(), this.#c(t, c.detail?.value ?? "");
      }}
        ></ha-entity-picker>
      `;
    if (this.#i && this.#t && customElements.get("ha-selector"))
      return p`
        <ha-selector
          .hass=${this.#t}
          .label=${a}
          .helper=${n}
          .selector=${{ entity: { domain: e } }}
          .value=${r}
          @value-changed=${(c) => {
        c.stopPropagation(), this.#c(t, c.detail?.value ?? "");
      }}
        ></ha-selector>
      `;
    const l = Object.keys(this.#t?.states ?? {}).filter((c) => e.some((u) => c.startsWith(`${u}.`))).sort();
    return p`
      <div>
        <label for=${t}>${a}</label>
        <select
          id=${t}
          .value=${r}
          @change=${(c) => this.#c(t, c.target.value)}
        >
          <option value="" ?selected=${r === ""}>${d(s, "blank_auto")}</option>
          ${l.map(
      (c) => p`<option value=${c} ?selected=${c === r}>${this.#a(c)}</option>`
    )}
          ${r && !l.includes(r) ? p`<option value=${r} selected>${r}</option>` : f}
        </select>
        <div class="helper">${n}</div>
      </div>
    `;
  }
  #a(t) {
    const e = this.#t?.states[t]?.attributes?.friendly_name;
    return typeof e == "string" && e !== t ? `${e} (${t})` : t;
  }
  #h(t, e, i, n) {
    const s = k($(this.#e).language, this.#t);
    return p`
      <div>
        <label for=${t}>${d(s, e)}</label>
        <input
          id=${t}
          type="text"
          .value=${n}
          @input=${(r) => this.#c(t, r.target.value)}
        />
        <div class="helper">${d(s, i)}</div>
      </div>
    `;
  }
  #l(t, e, i, n) {
    const s = k($(this.#e).language, this.#t);
    return p`
      <div>
        <label for=${t}>${d(s, e)}</label>
        <select
          id=${t}
          .value=${n}
          @change=${(r) => this.#c(t, r.target.value)}
        >
          ${i.map(
      ([r, a]) => p`<option value=${r} ?selected=${r === n}>${a}</option>`
    )}
        </select>
      </div>
    `;
  }
  #d(t, e, i) {
    const n = k($(this.#e).language, this.#t), s = /^#[0-9a-f]{6}$/.test(i) ? i : y[t];
    return p`
      <div>
        <label for=${t}>${d(n, e)}</label>
        <div class="color">
          <input
            id=${t}
            type="color"
            .value=${s}
            @input=${(r) => this.#c(t, r.target.value)}
          />
          <code>${i}</code>
        </div>
      </div>
    `;
  }
  #u(t, e, i, n) {
    const s = k($(this.#e).language, this.#t);
    return p`
      <div>
        <label for=${t}>${d(s, e)}</label>
        <input
          id=${t}
          type="number"
          min="0"
          max="100"
          step="1"
          .value=${String(n)}
          @change=${(r) => this.#c(t, Number(r.target.value))}
        />
        <div class="helper">${d(s, i)}</div>
      </div>
    `;
  }
  #r(t, e, i) {
    const n = k($(this.#e).language, this.#t);
    return p`
      <label class="check">
        <input
          type="checkbox"
          .checked=${i}
          @change=${(s) => this.#c(t, s.target.checked)}
        />
        ${d(n, e)}
      </label>
    `;
  }
  #c(t, e) {
    const i = { ...this.#e }, n = he(t, e);
    n === void 0 ? delete i[t] : Object.assign(i, { [t]: n }), JSON.stringify(i) !== JSON.stringify(this.#e) && (this.#e = i, this.requestUpdate(), this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: i },
        bubbles: !0,
        composed: !0
      })
    ));
  }
  async #p() {
    if (customElements.get("ha-entity-picker") || customElements.get("ha-selector")) {
      this.#i || (this.#i = !0, this.requestUpdate());
      return;
    }
    const t = window.loadCardHelpers;
    if (!t) return;
    try {
      await (await (await t()).createCardElement?.({ type: "entities", entities: [] }))?.constructor?.getConfigElement?.();
    } catch {
    }
    const e = !!(customElements.get("ha-entity-picker") || customElements.get("ha-selector"));
    e !== this.#i && (this.#i = e, this.requestUpdate());
  }
}
customElements.get("nuki-lock-card-editor") || customElements.define("nuki-lock-card-editor", ue);
function kt(o, t, e, i) {
  const n = (i - 90) * Math.PI / 180;
  return { x: o + e * Math.cos(n), y: t + e * Math.sin(n) };
}
function F(o, t, e, i, n) {
  const s = kt(o, t, e, i), r = kt(o, t, e, n);
  let a = n - i;
  for (; a < 0; ) a += 360;
  for (; a >= 360; ) a -= 360;
  const l = a > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${e} ${e} 0 ${l} 1 ${r.x.toFixed(2)} ${r.y.toFixed(2)}`;
}
function pe(o, t) {
  const e = o === "locking" || o === "unlocking" || o === "opening", i = o === "jammed", n = o === "unavailable" || o === "unknown";
  let s = 12, r = 348, a = "on";
  return o === "unlocked" || e ? (s = 46, r = 314, a = "off") : o === "open" ? (s = 68, r = 292, a = "off") : i ? a = "warn" : n && (a = "dim"), t && !i && !n && (a = "warn"), {
    arcStart: s,
    arcEnd: r,
    pip: a,
    alarm: i,
    dim: n,
    spin: o === "unlocking" ? "ccw" : e ? "cw" : null,
    pulse: o === "open",
    pipBlink: t && !i && !n
  };
}
function fe(o) {
  switch (o) {
    case "locked":
    case "unlocked":
    case "locking":
    case "unlocking":
    case "opening":
    case "open":
    case "jammed":
    case "unavailable":
    case "unknown":
      return o;
    default:
      return o ? "unknown" : "unavailable";
  }
}
const _ = 100, g = 100, T = 70;
class me extends E {
  static {
    this.styles = st`
    :host {
      display: block;
      line-height: 0;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .ring-group.blink {
      animation: nuki-blink 1.15s ease-in-out infinite;
    }
    .ring-group.dim-blink {
      animation: nuki-dim 2.4s ease-in-out infinite;
    }
    .ring-group.pulse {
      animation: nuki-pulse 2.6s ease-in-out infinite;
    }
    .pip.blink {
      animation: nuki-pip 1.2s ease-in-out infinite;
    }
    @keyframes nuki-blink {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.42;
      }
    }
    @keyframes nuki-dim {
      0%,
      100% {
        opacity: 0.4;
      }
      50% {
        opacity: 1;
      }
    }
    @keyframes nuki-pip {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.15;
      }
    }
    @keyframes nuki-pulse {
      0%,
      100% {
        opacity: 0.78;
      }
      50% {
        opacity: 1;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .ring-group.blink,
      .ring-group.dim-blink,
      .ring-group.pulse,
      .pip.blink {
        animation: none;
      }
    }
  `;
  }
  #t = "unavailable";
  #e = "#c5cad1";
  #i = "brushed";
  #n = "#16171a";
  #s = "#ffffff";
  #o = "#ff3b30";
  #a = !1;
  get mode() {
    return this.#t;
  }
  set mode(t) {
    this.#t !== t && (this.#t = t, this.requestUpdate());
  }
  get bodyColor() {
    return this.#e;
  }
  set bodyColor(t) {
    this.#e !== t && (this.#e = t, this.requestUpdate());
  }
  get finish() {
    return this.#i;
  }
  set finish(t) {
    this.#i !== t && (this.#i = t, this.requestUpdate());
  }
  get baseColor() {
    return this.#n;
  }
  set baseColor(t) {
    this.#n !== t && (this.#n = t, this.requestUpdate());
  }
  get ringColor() {
    return this.#s;
  }
  set ringColor(t) {
    this.#s !== t && (this.#s = t, this.requestUpdate());
  }
  get warningColor() {
    return this.#o;
  }
  set warningColor(t) {
    this.#o !== t && (this.#o = t, this.requestUpdate());
  }
  get alert() {
    return this.#a;
  }
  set alert(t) {
    this.#a !== t && (this.#a = t, this.requestUpdate());
  }
  render() {
    const t = pe(this.#t, this.#a), e = t.alarm ? this.#o : t.dim ? "#9aa1a9" : this.#s, i = t.pip === "warn" ? this.#o : t.pip === "dim" ? "#9aa1a9" : t.pip === "on" ? e : "#2c3036", n = this.#i === "brushed" ? 0.55 : this.#i === "gloss" ? 0.12 : 0, s = this.#i === "gloss" ? 0.85 : this.#i === "matte" ? 0.22 : 0.5, r = F(_, g, T, t.arcStart, t.arcEnd), a = F(_, g, T, -9, 9), l = F(_, g, T, 0, 32), c = typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches, u = t.alarm ? "ring-group blink" : t.dim ? "ring-group dim-blink" : t.pulse ? "ring-group pulse" : "ring-group", h = t.spin === "ccw" ? "360 100 100" : "0 100 100", m = t.spin === "ccw" ? "0 100 100" : "360 100 100";
    return j`
      <svg viewBox="0 0 200 200" role="presentation" aria-hidden="true">
        <defs>
          <radialGradient id="baseShade" cx="50%" cy="32%" r="75%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
            <stop offset="55%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.38" />
          </radialGradient>
          <radialGradient id="metalShade" cx="50%" cy="36%" r="68%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="${s}" />
            <stop offset="42%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.32" />
          </radialGradient>
          <linearGradient id="metalFall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
            <stop offset="48%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.22" />
          </linearGradient>
          <pattern id="grain" width="2.2" height="2.2" patternUnits="userSpaceOnUse">
            <rect width="2.2" height="2.2" fill="transparent" />
            <line x1="0.4" y1="0" x2="0.4" y2="2.2" stroke="#ffffff" stroke-opacity="0.45" stroke-width="0.35" />
            <line x1="1.4" y1="0" x2="1.4" y2="2.2" stroke="#000000" stroke-opacity="0.28" stroke-width="0.3" />
          </pattern>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
          <clipPath id="metalClip">
            <circle cx="${_}" cy="${g}" r="84" />
          </clipPath>
        </defs>

        <circle cx="${_}" cy="${g}" r="97" fill="${this.#n}" />
        <circle cx="${_}" cy="${g}" r="97" fill="url(#baseShade)" />
        <circle cx="${_}" cy="${g}" r="96.2" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.2" />
        <path
          d=${F(_, g, 93, 206, 334)}
          fill="none"
          stroke="#ffffff"
          stroke-opacity="0.35"
          stroke-width="1.4"
          stroke-linecap="round"
        />

        <g clip-path="url(#metalClip)">
          <circle cx="${_}" cy="${g}" r="84" fill="${this.#e}" />
          <circle cx="${_}" cy="${g}" r="84" fill="url(#metalFall)" />
          <circle cx="${_}" cy="${g}" r="84" fill="url(#metalShade)" />
          <circle cx="${_}" cy="${g}" r="84" fill="url(#grain)" opacity="${n}" />
          <ellipse cx="100" cy="62" rx="46" ry="22" fill="#ffffff" opacity="${this.#i === "matte" ? 0.08 : 0.16}" />
        </g>
        <circle cx="${_}" cy="${g}" r="84" fill="none" stroke="#000000" stroke-opacity="0.28" stroke-width="1" />

        <circle
          cx="${_}"
          cy="${g}"
          r="${T}"
          fill="none"
          stroke="#000000"
          stroke-opacity="0.38"
          stroke-width="11"
        />
        <circle
          cx="${_}"
          cy="${g}"
          r="${T}"
          fill="none"
          stroke="#ffffff"
          stroke-opacity="0.08"
          stroke-width="11"
        />

        <g class=${u} style=${Pt({ opacity: t.dim ? "0.85" : "1" })}>
          <path
            d=${r}
            fill="none"
            stroke=${e}
            stroke-width="12"
            stroke-linecap="round"
            opacity="0.55"
            filter="url(#glow)"
          />
          <path
            d=${r}
            fill="none"
            stroke=${e}
            stroke-width="7"
            stroke-linecap="round"
          />
          <path
            d=${r}
            fill="none"
            stroke="#ffffff"
            stroke-width="2.2"
            stroke-linecap="round"
            opacity=${t.alarm ? "0.45" : "0.82"}
          />
          <path
            class=${t.pipBlink ? "pip blink" : "pip"}
            d=${a}
            fill="none"
            stroke=${i}
            stroke-width=${t.pip === "off" ? "6" : "7.5"}
            stroke-linecap="round"
            opacity=${t.pip === "off" ? "0.95" : "1"}
            filter=${t.pip === "off" ? "none" : "url(#soft)"}
          />
        </g>

        ${t.spin ? j`
                <g opacity="0.98">
                  ${c ? j`` : j`<animateTransform attributeName="transform" type="rotate" from=${h} to=${m} dur="1.15s" repeatCount="indefinite" />`}
                  <path d=${l} fill="none" stroke=${e} stroke-width="12" stroke-linecap="round" opacity="0.45" filter="url(#glow)" />
                  <path d=${l} fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
                </g>
              ` : j``}

        <circle cx="${_}" cy="${g}" r="48" fill="none" stroke="#000000" stroke-opacity="0.14" stroke-width="1" />
        <circle cx="${_}" cy="${g}" r="47.2" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="0.6" />
      </svg>
    `;
  }
}
customElements.get("nuki-lock-face") || customElements.define("nuki-lock-face", me);
const _e = 40;
function Tt(o) {
  return o.split(".", 1)[0] ?? "";
}
function ge(o) {
  return Object.keys(o.states ?? {}).filter((t) => Tt(t) === "lock").sort();
}
function ye(o, t, e) {
  const i = o.entities;
  if (!i) return [];
  const n = [];
  for (const [s, r] of Object.entries(i)) {
    if (!r || r.device_id !== t) continue;
    const a = r.entity_id || s;
    if (a === e) continue;
    const c = o.states?.[a]?.attributes ?? {}, u = typeof c.device_class == "string" ? c.device_class : "", h = typeof c.unit_of_measurement == "string" ? c.unit_of_measurement : void 0, m = typeof c.friendly_name == "string" ? c.friendly_name : "", b = `${a} ${m} ${r.name ?? ""} ${r.translation_key ?? ""}`.toLowerCase();
    n.push({
      id: a,
      domain: Tt(a),
      deviceClass: u,
      unit: h,
      haystack: b,
      category: r.entity_category
    });
  }
  return n;
}
function H(o, t, e) {
  let i, n = Number.NEGATIVE_INFINITY;
  for (const s of o) {
    const r = t(s);
    r >= e && r > n && (i = s, n = r);
  }
  return i;
}
function be(o) {
  if (o.domain !== "sensor") return -1;
  const t = o.deviceClass === "battery", e = /(battery|bater)/.test(o.haystack);
  if (!t && !(o.unit === "%" && e)) return -1;
  let i = 0;
  return t && (i += 50), o.unit === "%" && (i += 30), e && (i += 10), /(keypad|teclado|door sensor|sensor de puerta|doorsensor)/.test(o.haystack) && (i -= 40), o.category === "diagnostic" && (i -= 5), i;
}
function $e(o) {
  return o.domain !== "binary_sensor" || o.deviceClass !== "door" ? -1 : 10;
}
function ke(o) {
  if (o.domain !== "binary_sensor") return -1;
  const t = /(jam|blocked|atas|bloqueo)/.test(o.haystack);
  return o.deviceClass === "problem" || o.deviceClass === "safety" ? t ? 20 : 10 : t ? 8 : -1;
}
function we(o) {
  if (o.domain !== "binary_sensor" || o.deviceClass !== "battery") return -1;
  let t = 10;
  return /(critical|critic|crít|baja)/.test(o.haystack) && (t += 15), /(keypad|teclado|door sensor|sensor de puerta|doorsensor)/.test(o.haystack) && (t -= 25), t;
}
function ve(o) {
  return o.domain === "binary_sensor" && o.deviceClass === "battery_charging" ? 10 : -1;
}
function W(o) {
  const t = o?.trim();
  return t || void 0;
}
function tt(o, t) {
  const e = t ?? {}, i = ge(o);
  let n = W(e.entity), s;
  n || (i.length === 1 ? n = i[0] : i.length === 0 ? s = "none" : s = "many");
  const r = { lock: n, missing: s }, a = W(e.battery_entity), l = W(e.door_entity), c = W(e.jammed_entity);
  if (a && (r.battery = a), l && (r.door = l), c && (r.jammed = c), !n) return r;
  const u = o.entities?.[n]?.device_id;
  if (!u) return r;
  const h = ye(o, u, n);
  return r.battery || (r.battery = H(h, be, _e)?.id), r.door || (r.door = H(h, $e, 1)?.id), r.jammed || (r.jammed = H(h, ke, 8)?.id), r.batteryCritical = H(h, we, 1)?.id, r.charging = H(h, ve, 1)?.id, r;
}
function xe(o) {
  if (o == null || o === "" || o === "unknown" || o === "unavailable") return null;
  const t = Number(o);
  return Number.isFinite(t) ? Math.min(100, Math.max(0, t)) : null;
}
function et(o) {
  return o === "on" || o === "open" || o === "true";
}
function Ae(o) {
  return o == null || o === "unknown" || o === "unavailable" ? "unavailable" : o === "on" || o === "open" ? "open" : o === "off" || o === "closed" ? "closed" : "unavailable";
}
const Ee = 1;
function Ce() {
  return window;
}
async function Se(o, t) {
  const e = d(t, "confirm_title"), i = d(t, "confirm_text"), n = d(t, "confirm"), s = d(t, "cancel"), r = Ce().loadCardHelpers;
  if (!r) return "fallback";
  try {
    const a = await r();
    return a?.showConfirmationDialog ? await new Promise((l) => {
      let c = !1;
      const u = (m) => {
        c || (c = !0, l(m));
      }, h = a.showConfirmationDialog(o, {
        title: e,
        text: i,
        confirmText: n,
        dismissText: s,
        confirm: () => u(!0),
        cancel: () => u(!1)
      });
      h && typeof h.then == "function" && h.then(
        (m) => u(!!m),
        () => u(!1)
      );
    }) : "fallback";
  } catch {
    return "fallback";
  }
}
class Oe extends E {
  static {
    this.styles = st`
    :host {
      display: block;
      font-family: var(--ha-font-family, var(--primary-font-family, system-ui, sans-serif));
      --nuki-muted: var(--secondary-text-color, #727272);
    }
    ha-card {
      height: 100%;
    }
    .wrap {
      position: relative;
      box-sizing: border-box;
      padding: 16px 16px 14px;
      color: var(--primary-text-color, #212121);
      container-type: inline-size;
    }
    .name {
      margin: 0 0 4px;
      text-align: center;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    .knob {
      width: min(232px, 86%);
      margin: 6px auto 10px;
      padding: 0;
      border: 0;
      background: transparent;
      display: block;
      cursor: pointer;
      border-radius: 50%;
      filter: drop-shadow(0 10px 12px rgba(0, 0, 0, 0.28));
    }
    .knob:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 6px;
    }
    .knob.static {
      cursor: default;
    }
    .state {
      margin: 0;
      text-align: center;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.01em;
      line-height: 1.2;
    }
    .state.warn {
      color: var(--nuki-warn, #ff3b30);
    }
    .state.dim {
      color: var(--nuki-muted);
    }
    .meta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      min-height: 0;
    }
    .door,
    .battery {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      font-size: 13px;
      line-height: 1.2;
      color: var(--nuki-muted);
      font-variant-numeric: tabular-nums;
    }
    .door.open {
      color: var(--primary-text-color, #212121);
      font-weight: 600;
    }
    .battery.warn {
      color: var(--nuki-warn, #ff3b30);
      font-weight: 600;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      margin-top: 6px;
      padding: 2px 8px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--nuki-warn, #ff3b30) 16%, transparent);
      color: var(--nuki-warn, #ff3b30);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .message {
      margin: 8px 0 0;
      text-align: center;
      font-size: 14px;
      line-height: 1.4;
      color: var(--nuki-muted);
    }
    .actions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 14px;
    }
    .actions.two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    button.action {
      appearance: none;
      border: 0;
      border-radius: 12px;
      min-height: 42px;
      padding: 8px 4px;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.15;
      cursor: pointer;
      color: var(--primary-text-color, #212121);
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    }
    button.action.active {
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
      background: color-mix(in srgb, var(--nuki-ring, #fff) 22%, var(--secondary-background-color, #ececec));
      box-shadow: inset 0 0 0 2px var(--nuki-ring, var(--primary-color, #03a9f4));
    }
    button.action:hover:not(:disabled) {
      filter: brightness(1.04);
    }
    button.action:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    button.action:disabled {
      opacity: 0.45;
      cursor: default;
    }
    .modal-back {
      position: absolute;
      inset: 0;
      z-index: 4;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgba(0, 0, 0, 0.48);
      border-radius: inherit;
    }
    .modal {
      width: min(280px, 100%);
      box-sizing: border-box;
      padding: 16px;
      border-radius: 16px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      color: var(--primary-text-color, #212121);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.32);
    }
    .modal h2 {
      margin: 0 0 8px;
      font-size: 18px;
    }
    .modal p {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: var(--nuki-muted);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    .modal-actions button {
      appearance: none;
      border: 0;
      border-radius: 10px;
      padding: 8px 12px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
      color: var(--primary-text-color, #212121);
    }
    .modal-actions button.confirm {
      background: var(--nuki-warn, #ff3b30);
      color: #fff;
    }
    @container (max-width: 280px) {
      .actions {
        grid-template-columns: 1fr;
      }
      .state {
        font-size: 18px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      button.action {
        transition: none;
      }
    }
  `;
  }
  #t;
  #e;
  #i = !1;
  #n = !1;
  /** True when Home Assistant's dialog helper is unavailable and we draw our own. */
  #s = !1;
  set hass(t) {
    this.#t = t, this.requestUpdate();
  }
  get hass() {
    return this.#t;
  }
  setConfig(t) {
    if (!t || typeof t != "object" || Array.isArray(t))
      throw new Error("Configuración no válida");
    if (t.entity != null && t.entity !== "" && (typeof t.entity != "string" || !t.entity.trim().startsWith("lock.")))
      throw new Error("La entidad debe pertenecer al dominio lock (lock.xxx)");
    this.#e = t, this.requestUpdate();
  }
  getCardSize() {
    return 8;
  }
  getGridOptions() {
    return { columns: 6, min_columns: 6, max_columns: 12 };
  }
  /** Older sections layout API. */
  getLayoutOptions() {
    return this.getGridOptions();
  }
  static getConfigElement() {
    return document.createElement("nuki-lock-card-editor");
  }
  static getStubConfig(t) {
    const e = Object.keys(t?.states ?? {}).filter((s) => s.startsWith("lock.")).sort(), n = e.find((s) => {
      const r = t?.states[s]?.state;
      return r && r !== "unavailable" && r !== "unknown";
    }) ?? e[0];
    return n ? { entity: n } : {};
  }
  render() {
    if (!this.#e) return p``;
    const t = $(this.#e), e = k(t.language, this.#t), i = this.#t ? tt(this.#t, this.#e) : { missing: "none" }, n = i.lock && this.#t ? this.#t.states[i.lock] : void 0, s = fe(n?.state), r = i.jammed ? et(this.#t?.states[i.jammed]?.state) : !1, a = i.batteryCritical ? et(this.#t?.states[i.batteryCritical]?.state) : !1, l = i.charging ? et(this.#t?.states[i.charging]?.state) : !1, c = i.battery ? xe(this.#t?.states[i.battery]?.state) : null, u = c != null && c <= t.low_battery, h = a || u || r && s !== "jammed", m = t.name || (typeof n?.attributes.friendly_name == "string" ? n.attributes.friendly_name : void 0) || i.lock, b = n?.attributes.supported_features, v = typeof b != "number" || (b & Ee) !== 0, K = !i.lock || !n || s === "unavailable" || s === "unknown" || this.#i, Y = s === "locked" || s === "locking" ? "lock" : s === "unlocked" || s === "unlocking" ? "unlock" : s === "open" || s === "opening" ? "open" : null, M = i.door ? Ae(this.#t?.states[i.door]?.state) : void 0, lt = this.#a(e, i, !!n);
    return p`
      <ha-card>
        <div
          class="wrap"
          style=${Pt({
      "--nuki-ring": t.ring_color,
      "--nuki-warn": t.warning_color
    })}
        >
          ${t.show_name && m ? p`<div class="name">${m}</div>` : f}
          ${i.lock ? p`
                <button
                  type="button"
                  class="knob"
                  aria-label=${d(e, "more_info", { name: m || i.lock })}
                  @click=${() => this.#h(i.lock)}
                >
                  ${this.#o(t, s, h)}
                </button>
              ` : p`<div class="knob static">${this.#o(t, "unavailable", !1)}</div>`}
          ${t.show_state ? p`<p class="state ${s === "jammed" ? "warn" : s === "unavailable" || s === "unknown" ? "dim" : ""}" aria-live="polite">
                ${n ? d(e, le(n.state)) : d(e, "unavailable")}
              </p>` : f}
          ${lt ? p`<p class="message">${lt}</p>` : f}
          ${r && s !== "jammed" ? p`<div class="chip">${d(e, "jammed_alert")}</div>` : f}
          <div class="meta">
            ${t.show_door && M ? p`<p class="door ${M === "open" ? "open" : ""}">
                  ${wt(M === "open")}
                  ${M === "open" ? d(e, "door_open") : M === "closed" ? d(e, "door_closed") : d(e, "door_unavailable")}
                </p>` : f}
            ${t.show_battery && (i.battery || i.batteryCritical) ? p`<p class="battery ${u || a ? "warn" : ""}">
                  ${Ue(c)}
                  ${c != null ? `${Math.round(c)} %` : a ? d(e, "battery_critical") : "—"}
                  ${l ? p`<span>· ${d(e, "charging")}</span>` : f}
                </p>` : f}
          </div>
          ${t.show_buttons ? p`
                <div class="actions ${v ? "" : "two"}">
                  <button
                    type="button"
                    class="action ${Y === "lock" ? "active" : ""}"
                    ?disabled=${K}
                    @click=${() => this.#l("lock")}
                  >
                    ${d(e, "action_lock")}
                  </button>
                  <button
                    type="button"
                    class="action ${Y === "unlock" ? "active" : ""}"
                    ?disabled=${K}
                    @click=${() => this.#l("unlock")}
                  >
                    ${d(e, "action_unlock")}
                  </button>
                  ${v ? p`
                        <button
                          type="button"
                          class="action ${Y === "open" ? "active" : ""}"
                          title=${d(e, "confirm_title")}
                          ?disabled=${K}
                          @click=${() => this.#l("open")}
                        >
                          ${d(e, "action_open")}
                        </button>
                      ` : f}
                </div>
              ` : f}
          ${this.#n && this.#s ? p`
                <div class="modal-back">
                  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="nuki-confirm-title">
                    <h2 id="nuki-confirm-title">${d(e, "confirm_title")}</h2>
                    <p>${d(e, "confirm_text")}</p>
                    <div class="modal-actions">
                      <button type="button" @click=${() => this.#u()}>${d(e, "cancel")}</button>
                      <button type="button" class="confirm" @click=${() => this.#d()}>
                        ${d(e, "confirm")}
                      </button>
                    </div>
                  </div>
                </div>
              ` : f}
        </div>
      </ha-card>
    `;
  }
  #o(t, e, i) {
    return p`
      <nuki-lock-face
        .mode=${e}
        .bodyColor=${t.body_color}
        .finish=${t.body_finish}
        .baseColor=${t.base_color}
        .ringColor=${t.ring_color}
        .warningColor=${t.warning_color}
        .alert=${i}
      ></nuki-lock-face>
    `;
  }
  #a(t, e, i) {
    return !this.#t || e.lock && i ? null : e.lock && !i ? d(t, "not_found", { entity: e.lock }) : e.missing === "many" ? d(t, "many_locks") : d(t, "no_locks");
  }
  #h(t) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: t },
        bubbles: !0,
        composed: !0
      })
    );
  }
  async #l(t) {
    if (!this.#t || !this.#e || this.#i) return;
    const e = tt(this.#t, this.#e).lock;
    if (e) {
      if (t === "open" && $(this.#e).confirm_open) {
        const i = await Se(this, k($(this.#e).language, this.#t));
        if (i === "fallback") {
          this.#s = !0, this.#n = !0, this.requestUpdate();
          return;
        }
        if (!i) return;
      }
      await this.#r(t, e);
    }
  }
  async #d() {
    this.#n = !1, this.#s = !1;
    const t = this.#t && this.#e ? tt(this.#t, this.#e).lock : void 0;
    t ? await this.#r("open", t) : this.requestUpdate();
  }
  #u() {
    this.#n = !1, this.#s = !1, this.requestUpdate();
  }
  async #r(t, e) {
    if (this.#t) {
      this.#i = !0, this.requestUpdate();
      try {
        await this.#t.callService("lock", t, { entity_id: e });
      } catch (i) {
        const n = i instanceof Error ? i.message : String(i);
        this.dispatchEvent(
          new CustomEvent("hass-notification", {
            detail: { message: n },
            bubbles: !0,
            composed: !0
          })
        );
      } finally {
        this.#i = !1, this.requestUpdate();
      }
    }
  }
}
function Ue(o) {
  const t = o == null ? 0 : Math.max(0, Math.min(20, o / 100 * 20));
  return p`
    <svg width="26" height="13" viewBox="0 0 28 14" aria-hidden="true">
      <rect x="0.75" y="0.75" width="23.5" height="12.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"></rect>
      <rect x="25" y="4" width="2.2" height="6" rx="0.6" fill="currentColor"></rect>
      <rect x="2.2" y="2.2" width=${t.toFixed(2)} height="9.6" rx="1" fill="currentColor"></rect>
    </svg>
  `;
}
function wt(o) {
  return p`
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      ${o ? p`<path d="M3 2.5h5.2v9H3z" fill="none" stroke="currentColor" stroke-width="1.4"></path>
            <path d="M8.2 2.5 11.5 4v7.2L8.2 11.5" fill="none" stroke="currentColor" stroke-width="1.4"></path>` : p`<rect x="3.2" y="2" width="7.6" height="10" rx="0.6" fill="none" stroke="currentColor" stroke-width="1.4"></rect>
            <circle cx="9" cy="7.2" r="0.7" fill="currentColor"></circle>`}
    </svg>
  `;
}
customElements.get("nuki-lock-card") || customElements.define("nuki-lock-card", Oe);
window.customCards = window.customCards || [];
window.customCards.some((o) => o.type === "nuki-lock-card") || window.customCards.push({
  type: "nuki-lock-card",
  name: "Nuki Lock",
  description: "Nuki Smart Lock Pro (5.ª generación): anillo LED, batería y puerta",
  preview: !0,
  documentationURL: "https://github.com/agasky74/nuki-card"
});
export {
  Oe as NukiLockCard
};
