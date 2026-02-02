import { app as S, ipcMain as f, dialog as Re, BrowserWindow as ae } from "electron";
import { fileURLToPath as Oe } from "node:url";
import b, { resolve as ee } from "node:path";
import L from "fs";
import ie from "path";
import Ie from "os";
import De from "crypto";
import { createRequire as ce } from "node:module";
import Ne, { promises as te } from "node:fs";
import { randomFillSync as Se, randomUUID as Le } from "node:crypto";
var _ = { exports: {} };
const xe = "17.2.3", Ue = {
  version: xe
}, K = L, F = ie, Pe = Ie, Ce = De, $e = Ue, X = $e.version, re = [
  "🔐 encrypt with Dotenvx: https://dotenvx.com",
  "🔐 prevent committing .env to code: https://dotenvx.com/precommit",
  "🔐 prevent building .env in docker: https://dotenvx.com/prebuild",
  "📡 add observability to secrets: https://dotenvx.com/ops",
  "👥 sync secrets across teammates & machines: https://dotenvx.com/ops",
  "🗂️ backup and recover secrets: https://dotenvx.com/ops",
  "✅ audit secrets and track compliance: https://dotenvx.com/ops",
  "🔄 add secrets lifecycle management: https://dotenvx.com/ops",
  "🔑 add access controls to secrets: https://dotenvx.com/ops",
  "🛠️  run anywhere with `dotenvx run -- yourcommand`",
  "⚙️  specify custom .env file path with { path: '/custom/path/.env' }",
  "⚙️  enable debug logging with { debug: true }",
  "⚙️  override existing env vars with { override: true }",
  "⚙️  suppress all logs with { quiet: true }",
  "⚙️  write to custom object with { processEnv: myObject }",
  "⚙️  load multiple .env files with { path: ['.env.local', '.env'] }"
];
function Be() {
  return re[Math.floor(Math.random() * re.length)];
}
function O(e) {
  return typeof e == "string" ? !["false", "0", "no", "off", ""].includes(e.toLowerCase()) : !!e;
}
function Fe() {
  return process.stdout.isTTY;
}
function je(e) {
  return Fe() ? `\x1B[2m${e}\x1B[0m` : e;
}
const Me = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function Ve(e) {
  const t = {};
  let r = e.toString();
  r = r.replace(/\r\n?/mg, `
`);
  let n;
  for (; (n = Me.exec(r)) != null; ) {
    const o = n[1];
    let s = n[2] || "";
    s = s.trim();
    const a = s[0];
    s = s.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), a === '"' && (s = s.replace(/\\n/g, `
`), s = s.replace(/\\r/g, "\r")), t[o] = s;
  }
  return t;
}
function ke(e) {
  e = e || {};
  const t = he(e);
  e.path = t;
  const r = h.configDotenv(e);
  if (!r.parsed) {
    const a = new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);
    throw a.code = "MISSING_DATA", a;
  }
  const n = ue(e).split(","), o = n.length;
  let s;
  for (let a = 0; a < o; a++)
    try {
      const i = n[a].trim(), u = Ke(r, i);
      s = h.decrypt(u.ciphertext, u.key);
      break;
    } catch (i) {
      if (a + 1 >= o)
        throw i;
    }
  return h.parse(s);
}
function Ye(e) {
  console.error(`[dotenv@${X}][WARN] ${e}`);
}
function N(e) {
  console.log(`[dotenv@${X}][DEBUG] ${e}`);
}
function le(e) {
  console.log(`[dotenv@${X}] ${e}`);
}
function ue(e) {
  return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function Ke(e, t) {
  let r;
  try {
    r = new URL(t);
  } catch (i) {
    if (i.code === "ERR_INVALID_URL") {
      const u = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw u.code = "INVALID_DOTENV_KEY", u;
    }
    throw i;
  }
  const n = r.password;
  if (!n) {
    const i = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw i.code = "INVALID_DOTENV_KEY", i;
  }
  const o = r.searchParams.get("environment");
  if (!o) {
    const i = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw i.code = "INVALID_DOTENV_KEY", i;
  }
  const s = `DOTENV_VAULT_${o.toUpperCase()}`, a = e.parsed[s];
  if (!a) {
    const i = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${s} in your .env.vault file.`);
    throw i.code = "NOT_FOUND_DOTENV_ENVIRONMENT", i;
  }
  return { ciphertext: a, key: n };
}
function he(e) {
  let t = null;
  if (e && e.path && e.path.length > 0)
    if (Array.isArray(e.path))
      for (const r of e.path)
        K.existsSync(r) && (t = r.endsWith(".vault") ? r : `${r}.vault`);
    else
      t = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
  else
    t = F.resolve(process.cwd(), ".env.vault");
  return K.existsSync(t) ? t : null;
}
function ne(e) {
  return e[0] === "~" ? F.join(Pe.homedir(), e.slice(1)) : e;
}
function He(e) {
  const t = O(process.env.DOTENV_CONFIG_DEBUG || e && e.debug), r = O(process.env.DOTENV_CONFIG_QUIET || e && e.quiet);
  (t || !r) && le("Loading env from encrypted .env.vault");
  const n = h._parseVault(e);
  let o = process.env;
  return e && e.processEnv != null && (o = e.processEnv), h.populate(o, n, e), { parsed: n };
}
function Xe(e) {
  const t = F.resolve(process.cwd(), ".env");
  let r = "utf8", n = process.env;
  e && e.processEnv != null && (n = e.processEnv);
  let o = O(n.DOTENV_CONFIG_DEBUG || e && e.debug), s = O(n.DOTENV_CONFIG_QUIET || e && e.quiet);
  e && e.encoding ? r = e.encoding : o && N("No encoding is specified. UTF-8 is used by default");
  let a = [t];
  if (e && e.path)
    if (!Array.isArray(e.path))
      a = [ne(e.path)];
    else {
      a = [];
      for (const c of e.path)
        a.push(ne(c));
    }
  let i;
  const u = {};
  for (const c of a)
    try {
      const E = h.parse(K.readFileSync(c, { encoding: r }));
      h.populate(u, E, e);
    } catch (E) {
      o && N(`Failed to load ${c} ${E.message}`), i = E;
    }
  const l = h.populate(n, u, e);
  if (o = O(n.DOTENV_CONFIG_DEBUG || o), s = O(n.DOTENV_CONFIG_QUIET || s), o || !s) {
    const c = Object.keys(l).length, E = [];
    for (const x of a)
      try {
        const U = F.relative(process.cwd(), x);
        E.push(U);
      } catch (U) {
        o && N(`Failed to load ${x} ${U.message}`), i = U;
      }
    le(`injecting env (${c}) from ${E.join(",")} ${je(`-- tip: ${Be()}`)}`);
  }
  return i ? { parsed: u, error: i } : { parsed: u };
}
function Ge(e) {
  if (ue(e).length === 0)
    return h.configDotenv(e);
  const t = he(e);
  return t ? h._configVault(e) : (Ye(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`), h.configDotenv(e));
}
function qe(e, t) {
  const r = Buffer.from(t.slice(-64), "hex");
  let n = Buffer.from(e, "base64");
  const o = n.subarray(0, 12), s = n.subarray(-16);
  n = n.subarray(12, -16);
  try {
    const a = Ce.createDecipheriv("aes-256-gcm", r, o);
    return a.setAuthTag(s), `${a.update(n)}${a.final()}`;
  } catch (a) {
    const i = a instanceof RangeError, u = a.message === "Invalid key length", l = a.message === "Unsupported state or unable to authenticate data";
    if (i || u) {
      const c = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw c.code = "INVALID_DOTENV_KEY", c;
    } else if (l) {
      const c = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw c.code = "DECRYPTION_FAILED", c;
    } else
      throw a;
  }
}
function We(e, t, r = {}) {
  const n = !!(r && r.debug), o = !!(r && r.override), s = {};
  if (typeof t != "object") {
    const a = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw a.code = "OBJECT_REQUIRED", a;
  }
  for (const a of Object.keys(t))
    Object.prototype.hasOwnProperty.call(e, a) ? (o === !0 && (e[a] = t[a], s[a] = t[a]), n && N(o === !0 ? `"${a}" is already defined and WAS overwritten` : `"${a}" is already defined and was NOT overwritten`)) : (e[a] = t[a], s[a] = t[a]);
  return s;
}
const h = {
  configDotenv: Xe,
  _configVault: He,
  _parseVault: ke,
  config: Ge,
  decrypt: qe,
  parse: Ve,
  populate: We
};
_.exports.configDotenv = h.configDotenv;
_.exports._configVault = h._configVault;
_.exports._parseVault = h._parseVault;
var de = _.exports.config = h.config;
_.exports.decrypt = h.decrypt;
_.exports.parse = h.parse;
_.exports.populate = h.populate;
_.exports = h;
const ze = ce(import.meta.url), Je = ze("better-sqlite3");
let I;
function fe() {
  const e = S.getPath("userData"), t = ie.join(e, "ollama-desktop-pro.db");
  return L.existsSync(e) || L.mkdirSync(e, { recursive: !0 }), I = new Je(t), I.pragma("journal_mode = WAL"), I.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      custom_instructions TEXT,
      context_enabled INTEGER DEFAULT 1,
      refer_count INTEGER DEFAULT 5,
      max_tokens INTEGER DEFAULT 10000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      thinking TEXT,
      tool_calls TEXT,
      images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prompt_templates (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      description TEXT,
      category TEXT,
      variables TEXT,
      project_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    -- Seed Templates
    INSERT OR IGNORE INTO prompt_templates (id, key, title, prompt, category) VALUES 
    ('1', 'summary', 'Summarize', 'Please summarize the following text in 3 bullet points.', 'General'),
    ('2', 'code-review', 'Code Review', 'Review the following code for performance and security issues.', 'Programming');
  `), console.log("Database initialized at:", t), I;
}
const pe = () => (I || fe(), I), p = [];
for (let e = 0; e < 256; ++e)
  p.push((e + 256).toString(16).slice(1));
function Qe(e, t = 0) {
  return (p[e[t + 0]] + p[e[t + 1]] + p[e[t + 2]] + p[e[t + 3]] + "-" + p[e[t + 4]] + p[e[t + 5]] + "-" + p[e[t + 6]] + p[e[t + 7]] + "-" + p[e[t + 8]] + p[e[t + 9]] + "-" + p[e[t + 10]] + p[e[t + 11]] + p[e[t + 12]] + p[e[t + 13]] + p[e[t + 14]] + p[e[t + 15]]).toLowerCase();
}
const $ = new Uint8Array(256);
let P = $.length;
function Ze() {
  return P > $.length - 16 && (Se($), P = 0), $.slice(P, P += 16);
}
const se = { randomUUID: Le };
function et(e, t, r) {
  var o;
  e = e || {};
  const n = e.random ?? ((o = e.rng) == null ? void 0 : o.call(e)) ?? Ze();
  if (n.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, Qe(n);
}
function C(e, t, r) {
  return se.randomUUID && !e ? se.randomUUID() : et(e);
}
var m = typeof globalThis < "u" && globalThis || typeof self < "u" && self || // eslint-disable-next-line no-undef
typeof global < "u" && global || {}, y = {
  searchParams: "URLSearchParams" in m,
  iterable: "Symbol" in m && "iterator" in Symbol,
  blob: "FileReader" in m && "Blob" in m && function() {
    try {
      return new Blob(), !0;
    } catch {
      return !1;
    }
  }(),
  formData: "FormData" in m,
  arrayBuffer: "ArrayBuffer" in m
};
function tt(e) {
  return e && DataView.prototype.isPrototypeOf(e);
}
if (y.arrayBuffer)
  var rt = [
    "[object Int8Array]",
    "[object Uint8Array]",
    "[object Uint8ClampedArray]",
    "[object Int16Array]",
    "[object Uint16Array]",
    "[object Int32Array]",
    "[object Uint32Array]",
    "[object Float32Array]",
    "[object Float64Array]"
  ], nt = ArrayBuffer.isView || function(e) {
    return e && rt.indexOf(Object.prototype.toString.call(e)) > -1;
  };
function D(e) {
  if (typeof e != "string" && (e = String(e)), /[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(e) || e === "")
    throw new TypeError('Invalid character in header field name: "' + e + '"');
  return e.toLowerCase();
}
function G(e) {
  return typeof e != "string" && (e = String(e)), e;
}
function q(e) {
  var t = {
    next: function() {
      var r = e.shift();
      return { done: r === void 0, value: r };
    }
  };
  return y.iterable && (t[Symbol.iterator] = function() {
    return t;
  }), t;
}
function d(e) {
  this.map = {}, e instanceof d ? e.forEach(function(t, r) {
    this.append(r, t);
  }, this) : Array.isArray(e) ? e.forEach(function(t) {
    if (t.length != 2)
      throw new TypeError("Headers constructor: expected name/value pair to be length 2, found" + t.length);
    this.append(t[0], t[1]);
  }, this) : e && Object.getOwnPropertyNames(e).forEach(function(t) {
    this.append(t, e[t]);
  }, this);
}
d.prototype.append = function(e, t) {
  e = D(e), t = G(t);
  var r = this.map[e];
  this.map[e] = r ? r + ", " + t : t;
};
d.prototype.delete = function(e) {
  delete this.map[D(e)];
};
d.prototype.get = function(e) {
  return e = D(e), this.has(e) ? this.map[e] : null;
};
d.prototype.has = function(e) {
  return this.map.hasOwnProperty(D(e));
};
d.prototype.set = function(e, t) {
  this.map[D(e)] = G(t);
};
d.prototype.forEach = function(e, t) {
  for (var r in this.map)
    this.map.hasOwnProperty(r) && e.call(t, this.map[r], r, this);
};
d.prototype.keys = function() {
  var e = [];
  return this.forEach(function(t, r) {
    e.push(r);
  }), q(e);
};
d.prototype.values = function() {
  var e = [];
  return this.forEach(function(t) {
    e.push(t);
  }), q(e);
};
d.prototype.entries = function() {
  var e = [];
  return this.forEach(function(t, r) {
    e.push([r, t]);
  }), q(e);
};
y.iterable && (d.prototype[Symbol.iterator] = d.prototype.entries);
function j(e) {
  if (!e._noBody) {
    if (e.bodyUsed)
      return Promise.reject(new TypeError("Already read"));
    e.bodyUsed = !0;
  }
}
function me(e) {
  return new Promise(function(t, r) {
    e.onload = function() {
      t(e.result);
    }, e.onerror = function() {
      r(e.error);
    };
  });
}
function st(e) {
  var t = new FileReader(), r = me(t);
  return t.readAsArrayBuffer(e), r;
}
function ot(e) {
  var t = new FileReader(), r = me(t), n = /charset=([A-Za-z0-9_-]+)/.exec(e.type), o = n ? n[1] : "utf-8";
  return t.readAsText(e, o), r;
}
function at(e) {
  for (var t = new Uint8Array(e), r = new Array(t.length), n = 0; n < t.length; n++)
    r[n] = String.fromCharCode(t[n]);
  return r.join("");
}
function oe(e) {
  if (e.slice)
    return e.slice(0);
  var t = new Uint8Array(e.byteLength);
  return t.set(new Uint8Array(e)), t.buffer;
}
function Ee() {
  return this.bodyUsed = !1, this._initBody = function(e) {
    this.bodyUsed = this.bodyUsed, this._bodyInit = e, e ? typeof e == "string" ? this._bodyText = e : y.blob && Blob.prototype.isPrototypeOf(e) ? this._bodyBlob = e : y.formData && FormData.prototype.isPrototypeOf(e) ? this._bodyFormData = e : y.searchParams && URLSearchParams.prototype.isPrototypeOf(e) ? this._bodyText = e.toString() : y.arrayBuffer && y.blob && tt(e) ? (this._bodyArrayBuffer = oe(e.buffer), this._bodyInit = new Blob([this._bodyArrayBuffer])) : y.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(e) || nt(e)) ? this._bodyArrayBuffer = oe(e) : this._bodyText = e = Object.prototype.toString.call(e) : (this._noBody = !0, this._bodyText = ""), this.headers.get("content-type") || (typeof e == "string" ? this.headers.set("content-type", "text/plain;charset=UTF-8") : this._bodyBlob && this._bodyBlob.type ? this.headers.set("content-type", this._bodyBlob.type) : y.searchParams && URLSearchParams.prototype.isPrototypeOf(e) && this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"));
  }, y.blob && (this.blob = function() {
    var e = j(this);
    if (e)
      return e;
    if (this._bodyBlob)
      return Promise.resolve(this._bodyBlob);
    if (this._bodyArrayBuffer)
      return Promise.resolve(new Blob([this._bodyArrayBuffer]));
    if (this._bodyFormData)
      throw new Error("could not read FormData body as blob");
    return Promise.resolve(new Blob([this._bodyText]));
  }), this.arrayBuffer = function() {
    if (this._bodyArrayBuffer) {
      var e = j(this);
      return e || (ArrayBuffer.isView(this._bodyArrayBuffer) ? Promise.resolve(
        this._bodyArrayBuffer.buffer.slice(
          this._bodyArrayBuffer.byteOffset,
          this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
        )
      ) : Promise.resolve(this._bodyArrayBuffer));
    } else {
      if (y.blob)
        return this.blob().then(st);
      throw new Error("could not read as ArrayBuffer");
    }
  }, this.text = function() {
    var e = j(this);
    if (e)
      return e;
    if (this._bodyBlob)
      return ot(this._bodyBlob);
    if (this._bodyArrayBuffer)
      return Promise.resolve(at(this._bodyArrayBuffer));
    if (this._bodyFormData)
      throw new Error("could not read FormData body as text");
    return Promise.resolve(this._bodyText);
  }, y.formData && (this.formData = function() {
    return this.text().then(lt);
  }), this.json = function() {
    return this.text().then(JSON.parse);
  }, this;
}
var it = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
function ct(e) {
  var t = e.toUpperCase();
  return it.indexOf(t) > -1 ? t : e;
}
function R(e, t) {
  if (!(this instanceof R))
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
  t = t || {};
  var r = t.body;
  if (e instanceof R) {
    if (e.bodyUsed)
      throw new TypeError("Already read");
    this.url = e.url, this.credentials = e.credentials, t.headers || (this.headers = new d(e.headers)), this.method = e.method, this.mode = e.mode, this.signal = e.signal, !r && e._bodyInit != null && (r = e._bodyInit, e.bodyUsed = !0);
  } else
    this.url = String(e);
  if (this.credentials = t.credentials || this.credentials || "same-origin", (t.headers || !this.headers) && (this.headers = new d(t.headers)), this.method = ct(t.method || this.method || "GET"), this.mode = t.mode || this.mode || null, this.signal = t.signal || this.signal || function() {
    if ("AbortController" in m) {
      var s = new AbortController();
      return s.signal;
    }
  }(), this.referrer = null, (this.method === "GET" || this.method === "HEAD") && r)
    throw new TypeError("Body not allowed for GET or HEAD requests");
  if (this._initBody(r), (this.method === "GET" || this.method === "HEAD") && (t.cache === "no-store" || t.cache === "no-cache")) {
    var n = /([?&])_=[^&]*/;
    if (n.test(this.url))
      this.url = this.url.replace(n, "$1_=" + (/* @__PURE__ */ new Date()).getTime());
    else {
      var o = /\?/;
      this.url += (o.test(this.url) ? "&" : "?") + "_=" + (/* @__PURE__ */ new Date()).getTime();
    }
  }
}
R.prototype.clone = function() {
  return new R(this, { body: this._bodyInit });
};
function lt(e) {
  var t = new FormData();
  return e.trim().split("&").forEach(function(r) {
    if (r) {
      var n = r.split("="), o = n.shift().replace(/\+/g, " "), s = n.join("=").replace(/\+/g, " ");
      t.append(decodeURIComponent(o), decodeURIComponent(s));
    }
  }), t;
}
function ut(e) {
  var t = new d(), r = e.replace(/\r?\n[\t ]+/g, " ");
  return r.split("\r").map(function(n) {
    return n.indexOf(`
`) === 0 ? n.substr(1, n.length) : n;
  }).forEach(function(n) {
    var o = n.split(":"), s = o.shift().trim();
    if (s) {
      var a = o.join(":").trim();
      try {
        t.append(s, a);
      } catch (i) {
        console.warn("Response " + i.message);
      }
    }
  }), t;
}
Ee.call(R.prototype);
function g(e, t) {
  if (!(this instanceof g))
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
  if (t || (t = {}), this.type = "default", this.status = t.status === void 0 ? 200 : t.status, this.status < 200 || this.status > 599)
    throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].");
  this.ok = this.status >= 200 && this.status < 300, this.statusText = t.statusText === void 0 ? "" : "" + t.statusText, this.headers = new d(t.headers), this.url = t.url || "", this._initBody(e);
}
Ee.call(g.prototype);
g.prototype.clone = function() {
  return new g(this._bodyInit, {
    status: this.status,
    statusText: this.statusText,
    headers: new d(this.headers),
    url: this.url
  });
};
g.error = function() {
  var e = new g(null, { status: 200, statusText: "" });
  return e.ok = !1, e.status = 0, e.type = "error", e;
};
var ht = [301, 302, 303, 307, 308];
g.redirect = function(e, t) {
  if (ht.indexOf(t) === -1)
    throw new RangeError("Invalid status code");
  return new g(null, { status: t, headers: { location: e } });
};
var A = m.DOMException;
try {
  new A();
} catch {
  A = function(t, r) {
    this.message = t, this.name = r;
    var n = Error(t);
    this.stack = n.stack;
  }, A.prototype = Object.create(Error.prototype), A.prototype.constructor = A;
}
function ye(e, t) {
  return new Promise(function(r, n) {
    var o = new R(e, t);
    if (o.signal && o.signal.aborted)
      return n(new A("Aborted", "AbortError"));
    var s = new XMLHttpRequest();
    function a() {
      s.abort();
    }
    s.onload = function() {
      var l = {
        statusText: s.statusText,
        headers: ut(s.getAllResponseHeaders() || "")
      };
      o.url.indexOf("file://") === 0 && (s.status < 200 || s.status > 599) ? l.status = 200 : l.status = s.status, l.url = "responseURL" in s ? s.responseURL : l.headers.get("X-Request-URL");
      var c = "response" in s ? s.response : s.responseText;
      setTimeout(function() {
        r(new g(c, l));
      }, 0);
    }, s.onerror = function() {
      setTimeout(function() {
        n(new TypeError("Network request failed"));
      }, 0);
    }, s.ontimeout = function() {
      setTimeout(function() {
        n(new TypeError("Network request timed out"));
      }, 0);
    }, s.onabort = function() {
      setTimeout(function() {
        n(new A("Aborted", "AbortError"));
      }, 0);
    };
    function i(l) {
      try {
        return l === "" && m.location.href ? m.location.href : l;
      } catch {
        return l;
      }
    }
    if (s.open(o.method, i(o.url), !0), o.credentials === "include" ? s.withCredentials = !0 : o.credentials === "omit" && (s.withCredentials = !1), "responseType" in s && (y.blob ? s.responseType = "blob" : y.arrayBuffer && (s.responseType = "arraybuffer")), t && typeof t.headers == "object" && !(t.headers instanceof d || m.Headers && t.headers instanceof m.Headers)) {
      var u = [];
      Object.getOwnPropertyNames(t.headers).forEach(function(l) {
        u.push(D(l)), s.setRequestHeader(l, G(t.headers[l]));
      }), o.headers.forEach(function(l, c) {
        u.indexOf(c) === -1 && s.setRequestHeader(c, l);
      });
    } else
      o.headers.forEach(function(l, c) {
        s.setRequestHeader(c, l);
      });
    o.signal && (o.signal.addEventListener("abort", a), s.onreadystatechange = function() {
      s.readyState === 4 && o.signal.removeEventListener("abort", a);
    }), s.send(typeof o._bodyInit > "u" ? null : o._bodyInit);
  });
}
ye.polyfill = !0;
m.fetch || (m.fetch = ye, m.Headers = d, m.Request = R, m.Response = g);
const ge = "11434", Te = `http://127.0.0.1:${ge}`, dt = "0.6.3";
var ft = Object.defineProperty, pt = (e, t, r) => t in e ? ft(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, M = (e, t, r) => (pt(e, typeof t != "symbol" ? t + "" : t, r), r);
class W extends Error {
  constructor(t, r) {
    super(t), this.error = t, this.status_code = r, this.name = "ResponseError", Error.captureStackTrace && Error.captureStackTrace(this, W);
  }
}
class mt {
  constructor(t, r, n) {
    M(this, "abortController"), M(this, "itr"), M(this, "doneCallback"), this.abortController = t, this.itr = r, this.doneCallback = n;
  }
  abort() {
    this.abortController.abort();
  }
  async *[Symbol.asyncIterator]() {
    for await (const t of this.itr) {
      if ("error" in t)
        throw new Error(t.error);
      if (yield t, t.done || t.status === "success") {
        this.doneCallback();
        return;
      }
    }
    throw new Error("Did not receive done or success response in stream.");
  }
}
const z = async (e) => {
  var n;
  if (e.ok)
    return;
  let t = `Error ${e.status}: ${e.statusText}`, r = null;
  if ((n = e.headers.get("content-type")) != null && n.includes("application/json"))
    try {
      r = await e.json(), t = r.error || t;
    } catch {
      console.log("Failed to parse error response as JSON");
    }
  else
    try {
      console.log("Getting text from response"), t = await e.text() || t;
    } catch {
      console.log("Failed to get text from error response");
    }
  throw new W(t, e.status);
};
function Et() {
  var e;
  if (typeof window < "u" && window.navigator) {
    const t = navigator;
    return "userAgentData" in t && ((e = t.userAgentData) != null && e.platform) ? `${t.userAgentData.platform.toLowerCase()} Browser/${navigator.userAgent};` : navigator.platform ? `${navigator.platform.toLowerCase()} Browser/${navigator.userAgent};` : `unknown Browser/${navigator.userAgent};`;
  } else if (typeof process < "u")
    return `${process.arch} ${process.platform} Node.js/${process.version}`;
  return "";
}
function yt(e) {
  if (e instanceof Headers) {
    const t = {};
    return e.forEach((r, n) => {
      t[n] = r;
    }), t;
  } else return Array.isArray(e) ? Object.fromEntries(e) : e || {};
}
const gt = (e, t) => e[t], J = async (e, t, r = {}) => {
  const n = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": `ollama-js/${dt} (${Et()})`
  };
  r.headers = yt(r.headers);
  try {
    const s = new URL(t);
    if (s.protocol === "https:" && s.hostname === "ollama.com") {
      const a = typeof process == "object" && process !== null && typeof process.env == "object" && process.env !== null ? gt(process.env, "OLLAMA_API_KEY") : void 0;
      !(r.headers.authorization || r.headers.Authorization) && a && (r.headers.Authorization = `Bearer ${a}`);
    }
  } catch (s) {
    console.error("error parsing url", s);
  }
  const o = Object.fromEntries(
    Object.entries(r.headers).filter(
      ([s]) => !Object.keys(n).some(
        (a) => a.toLowerCase() === s.toLowerCase()
      )
    )
  );
  return r.headers = {
    ...n,
    ...o
  }, e(t, r);
}, V = async (e, t, r) => {
  const n = await J(e, t, {
    headers: r == null ? void 0 : r.headers
  });
  return await z(n), n;
}, T = async (e, t, r, n) => {
  const s = ((i) => i !== null && typeof i == "object" && !Array.isArray(i))(r) ? JSON.stringify(r) : r, a = await J(e, t, {
    method: "POST",
    body: s,
    signal: n == null ? void 0 : n.signal,
    headers: n == null ? void 0 : n.headers
  });
  return await z(a), a;
}, Tt = async (e, t, r, n) => {
  const o = await J(e, t, {
    method: "DELETE",
    body: JSON.stringify(r),
    headers: n == null ? void 0 : n.headers
  });
  return await z(o), o;
}, wt = async function* (e) {
  const t = new TextDecoder("utf-8");
  let r = "";
  const n = e.getReader();
  for (; ; ) {
    const { done: o, value: s } = await n.read();
    if (o)
      break;
    r += t.decode(s, { stream: !0 });
    const a = r.split(`
`);
    r = a.pop() ?? "";
    for (const i of a)
      try {
        yield JSON.parse(i);
      } catch {
        console.warn("invalid json: ", i);
      }
  }
  r += t.decode();
  for (const o of r.split(`
`).filter((s) => s !== ""))
    try {
      yield JSON.parse(o);
    } catch {
      console.warn("invalid json: ", o);
    }
}, bt = (e) => {
  if (!e)
    return Te;
  let t = e.includes("://");
  e.startsWith(":") && (e = `http://127.0.0.1${e}`, t = !0), t || (e = `http://${e}`);
  const r = new URL(e);
  let n = r.port;
  n || (t ? n = r.protocol === "https:" ? "443" : "80" : n = ge);
  let o = "";
  r.username && (o = r.username, r.password && (o += `:${r.password}`), o += "@");
  let s = `${r.protocol}//${o}${r.hostname}:${n}${r.pathname}`;
  return s.endsWith("/") && (s = s.slice(0, -1)), s;
};
var _t = Object.defineProperty, vt = (e, t, r) => t in e ? _t(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, k = (e, t, r) => (vt(e, typeof t != "symbol" ? t + "" : t, r), r);
let we = class {
  constructor(t) {
    k(this, "config"), k(this, "fetch"), k(this, "ongoingStreamedRequests", []), this.config = {
      host: "",
      headers: t == null ? void 0 : t.headers
    }, t != null && t.proxy || (this.config.host = bt((t == null ? void 0 : t.host) ?? Te)), this.fetch = (t == null ? void 0 : t.fetch) ?? fetch;
  }
  // Abort any ongoing streamed requests to Ollama
  abort() {
    for (const t of this.ongoingStreamedRequests)
      t.abort();
    this.ongoingStreamedRequests.length = 0;
  }
  /**
   * Processes a request to the Ollama server. If the request is streamable, it will return a
   * AbortableAsyncIterator that yields the response messages. Otherwise, it will return the response
   * object.
   * @param endpoint {string} - The endpoint to send the request to.
   * @param request {object} - The request object to send to the endpoint.
   * @protected {T | AbortableAsyncIterator<T>} - The response object or a AbortableAsyncIterator that yields
   * response messages.
   * @throws {Error} - If the response body is missing or if the response is an error.
   * @returns {Promise<T | AbortableAsyncIterator<T>>} - The response object or a AbortableAsyncIterator that yields the streamed response.
   */
  async processStreamableRequest(t, r) {
    r.stream = r.stream ?? !1;
    const n = `${this.config.host}/api/${t}`;
    if (r.stream) {
      const s = new AbortController(), a = await T(this.fetch, n, r, {
        signal: s.signal,
        headers: this.config.headers
      });
      if (!a.body)
        throw new Error("Missing body");
      const i = wt(a.body), u = new mt(
        s,
        i,
        () => {
          const l = this.ongoingStreamedRequests.indexOf(u);
          l > -1 && this.ongoingStreamedRequests.splice(l, 1);
        }
      );
      return this.ongoingStreamedRequests.push(u), u;
    }
    return await (await T(this.fetch, n, r, {
      headers: this.config.headers
    })).json();
  }
  /**
   * Encodes an image to base64 if it is a Uint8Array.
   * @param image {Uint8Array | string} - The image to encode.
   * @returns {Promise<string>} - The base64 encoded image.
   */
  async encodeImage(t) {
    if (typeof t != "string") {
      const r = new Uint8Array(t);
      let n = "";
      const o = r.byteLength;
      for (let s = 0; s < o; s++)
        n += String.fromCharCode(r[s]);
      return btoa(n);
    }
    return t;
  }
  /**
   * Generates a response from a text prompt.
   * @param request {GenerateRequest} - The request object.
   * @returns {Promise<GenerateResponse | AbortableAsyncIterator<GenerateResponse>>} - The response object or
   * an AbortableAsyncIterator that yields response messages.
   */
  async generate(t) {
    return t.images && (t.images = await Promise.all(t.images.map(this.encodeImage.bind(this)))), this.processStreamableRequest("generate", t);
  }
  /**
   * Chats with the model. The request object can contain messages with images that are either
   * Uint8Arrays or base64 encoded strings. The images will be base64 encoded before sending the
   * request.
   * @param request {ChatRequest} - The request object.
   * @returns {Promise<ChatResponse | AbortableAsyncIterator<ChatResponse>>} - The response object or an
   * AbortableAsyncIterator that yields response messages.
   */
  async chat(t) {
    if (t.messages)
      for (const r of t.messages)
        r.images && (r.images = await Promise.all(
          r.images.map(this.encodeImage.bind(this))
        ));
    return this.processStreamableRequest("chat", t);
  }
  /**
   * Creates a new model from a stream of data.
   * @param request {CreateRequest} - The request object.
   * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or a stream of progress responses.
   */
  async create(t) {
    return this.processStreamableRequest("create", {
      ...t
    });
  }
  /**
   * Pulls a model from the Ollama registry. The request object can contain a stream flag to indicate if the
   * response should be streamed.
   * @param request {PullRequest} - The request object.
   * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or
   * an AbortableAsyncIterator that yields response messages.
   */
  async pull(t) {
    return this.processStreamableRequest("pull", {
      name: t.model,
      stream: t.stream,
      insecure: t.insecure
    });
  }
  /**
   * Pushes a model to the Ollama registry. The request object can contain a stream flag to indicate if the
   * response should be streamed.
   * @param request {PushRequest} - The request object.
   * @returns {Promise<ProgressResponse | AbortableAsyncIterator<ProgressResponse>>} - The response object or
   * an AbortableAsyncIterator that yields response messages.
   */
  async push(t) {
    return this.processStreamableRequest("push", {
      name: t.model,
      stream: t.stream,
      insecure: t.insecure
    });
  }
  /**
   * Deletes a model from the server. The request object should contain the name of the model to
   * delete.
   * @param request {DeleteRequest} - The request object.
   * @returns {Promise<StatusResponse>} - The response object.
   */
  async delete(t) {
    return await Tt(
      this.fetch,
      `${this.config.host}/api/delete`,
      { name: t.model },
      { headers: this.config.headers }
    ), { status: "success" };
  }
  /**
   * Copies a model from one name to another. The request object should contain the name of the
   * model to copy and the new name.
   * @param request {CopyRequest} - The request object.
   * @returns {Promise<StatusResponse>} - The response object.
   */
  async copy(t) {
    return await T(this.fetch, `${this.config.host}/api/copy`, { ...t }, {
      headers: this.config.headers
    }), { status: "success" };
  }
  /**
   * Lists the models on the server.
   * @returns {Promise<ListResponse>} - The response object.
   * @throws {Error} - If the response body is missing.
   */
  async list() {
    return await (await V(this.fetch, `${this.config.host}/api/tags`, {
      headers: this.config.headers
    })).json();
  }
  /**
   * Shows the metadata of a model. The request object should contain the name of the model.
   * @param request {ShowRequest} - The request object.
   * @returns {Promise<ShowResponse>} - The response object.
   */
  async show(t) {
    return await (await T(this.fetch, `${this.config.host}/api/show`, {
      ...t
    }, {
      headers: this.config.headers
    })).json();
  }
  /**
   * Embeds text input into vectors.
   * @param request {EmbedRequest} - The request object.
   * @returns {Promise<EmbedResponse>} - The response object.
   */
  async embed(t) {
    return await (await T(this.fetch, `${this.config.host}/api/embed`, {
      ...t
    }, {
      headers: this.config.headers
    })).json();
  }
  /**
   * Embeds a text prompt into a vector.
   * @param request {EmbeddingsRequest} - The request object.
   * @returns {Promise<EmbeddingsResponse>} - The response object.
   */
  async embeddings(t) {
    return await (await T(this.fetch, `${this.config.host}/api/embeddings`, {
      ...t
    }, {
      headers: this.config.headers
    })).json();
  }
  /**
   * Lists the running models on the server
   * @returns {Promise<ListResponse>} - The response object.
   * @throws {Error} - If the response body is missing.
   */
  async ps() {
    return await (await V(this.fetch, `${this.config.host}/api/ps`, {
      headers: this.config.headers
    })).json();
  }
  /**
   * Returns the Ollama server version.
   * @returns {Promise<VersionResponse>} - The server version object.
   */
  async version() {
    return await (await V(this.fetch, `${this.config.host}/api/version`, {
      headers: this.config.headers
    })).json();
  }
  /**
   * Performs web search using the Ollama web search API
   * @param request {WebSearchRequest} - The search request containing query and options
   * @returns {Promise<WebSearchResponse>} - The search results
   * @throws {Error} - If the request is invalid or the server returns an error
   */
  async webSearch(t) {
    if (!t.query || t.query.length === 0)
      throw new Error("Query is required");
    return await (await T(this.fetch, "https://ollama.com/api/web_search", { ...t }, {
      headers: this.config.headers
    })).json();
  }
  /**
   * Fetches a single page using the Ollama web fetch API
   * @param request {WebFetchRequest} - The fetch request containing a URL
   * @returns {Promise<WebFetchResponse>} - The fetch result
   * @throws {Error} - If the request is invalid or the server returns an error
   */
  async webFetch(t) {
    if (!t.url || t.url.length === 0)
      throw new Error("URL is required");
    return await (await T(this.fetch, "https://ollama.com/api/web_fetch", { ...t }, { headers: this.config.headers })).json();
  }
};
new we();
class Q extends we {
  async encodeImage(t) {
    if (typeof t != "string")
      return Buffer.from(t).toString("base64");
    try {
      if (Ne.existsSync(t)) {
        const r = await te.readFile(ee(t));
        return Buffer.from(r).toString("base64");
      }
    } catch {
    }
    return t;
  }
  /**
   * checks if a file exists
   * @param path {string} - The path to the file
   * @private @internal
   * @returns {Promise<boolean>} - Whether the file exists or not
   */
  async fileExists(t) {
    try {
      return await te.access(t), !0;
    } catch {
      return !1;
    }
  }
  async create(t) {
    if (t.from && await this.fileExists(ee(t.from)))
      throw Error("Creating with a local path is not currently supported from ollama-js");
    return t.stream ? super.create(t) : super.create(t);
  }
}
new Q();
de();
const be = "http://localhost:11434";
let v = new Q({ host: be });
function Y(e) {
  return new Q({
    host: be,
    headers: e ? { Authorization: `Bearer ${e.replace(/"/g, "").trim()}` } : {}
  });
}
const B = {
  initialize() {
    try {
      const t = pe().prepare("SELECT value FROM settings WHERE key = ?").get("ollamaApiKey"), r = t ? t.value : null, n = process.env.Ollama_API_KEY || process.env.OLLAMA_API_KEY, o = r || n;
      o ? (console.log("[OllamaService] Initializing with API Key from " + (r ? "DB" : "ENV")), v = Y(o)) : (console.log("[OllamaService] Initializing without API Key"), v = Y());
    } catch (e) {
      console.error("[OllamaService] Init failed:", e);
    }
  },
  updateApiKey(e) {
    console.log("[OllamaService] Updating API Key"), v = Y(e);
  },
  async getModels() {
    try {
      return (await v.list()).models || [];
    } catch (e) {
      return console.error("[Ollama] Error fetching models:", e), [];
    }
  },
  async chat(e, t) {
    console.log(`
--- [Ollama IPC] Chat Request ---`), console.log(`Model: ${e.model}`);
    try {
      const r = [...e.messages], n = e.tools;
      let o = 0;
      const s = 5;
      for (; o < s; ) {
        o++;
        const a = await v.chat({
          model: e.model,
          messages: r,
          tools: n,
          stream: !0
        });
        let i = "", u = "", l = [];
        for await (const c of a)
          c.message.thinking && (u += c.message.thinking), c.message.content && (i += c.message.content), c.message.tool_calls && (l = [...l, ...c.message.tool_calls]), t.sender.send("ollama-chat-chunk", {
            content: c.message.content || "",
            thinking: c.message.thinking || "",
            tool_calls: c.message.tool_calls,
            done: !1
          });
        if (l.length > 0) {
          r.push({
            role: "assistant",
            content: i,
            thinking: u,
            tool_calls: l
          });
          for (const c of l)
            try {
              console.log(`[Ollama] Executing tool: ${c.function.name}`);
              let E;
              c.function.name === "webSearch" ? E = await v.webSearch({ query: c.function.arguments.query }) : c.function.name === "webFetch" && (E = await v.webFetch({ url: c.function.arguments.url })), r.push({
                role: "tool",
                content: JSON.stringify(E)
              });
            } catch (E) {
              console.error(`[Ollama] Tool Execution Error (${c.function.name}):`, E.message || E);
              const x = E.status_code === 401 ? "Unauthorized: Please verify your Ollama API Key in .env. It should be a Cloud Token, not an SSH key." : E.message || "Tool execution failed";
              r.push({
                role: "tool",
                content: JSON.stringify({ error: x })
              });
            }
          continue;
        }
        return t.sender.send("ollama-chat-chunk", { done: !0 }), { content: i, thinking: u };
      }
      throw new Error("Maximum tool iterations reached");
    } catch (r) {
      throw console.error("[Ollama] Chat Error:", r), t.sender.send("ollama-chat-chunk", { error: r.message, done: !0 }), r;
    }
  }
}, At = ce(import.meta.url), Rt = At("pdf-parse");
function Ot() {
  const e = pe();
  f.handle("ollama-get-models", async () => await B.getModels()), f.handle("ollama-chat", async (t, r) => await B.chat(r, t)), f.handle("get-projects", () => e.prepare("SELECT * FROM projects ORDER BY created_at DESC").all()), f.handle("create-project", (t, r) => {
    const n = C();
    return e.prepare(`
      INSERT INTO projects (id, name, description, icon, custom_instructions, context_enabled, refer_count, max_tokens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      n,
      r.name,
      r.description,
      r.icon,
      r.customInstructions,
      r.contextEnabled ? 1 : 0,
      r.referCount,
      r.maxTokens
    ), n;
  }), f.handle("get-chats", (t, r) => r ? e.prepare("SELECT * FROM chats WHERE project_id = ? ORDER BY updated_at DESC").all(r) : e.prepare("SELECT * FROM chats WHERE project_id IS NULL ORDER BY updated_at DESC").all()), f.handle("create-chat", (t, r) => {
    const n = C();
    return e.prepare("INSERT INTO chats (id, project_id, title, model) VALUES (?, ?, ?, ?)").run(n, r.project_id, r.title, r.model), n;
  }), f.handle("delete-chat", (t, r) => (e.prepare("DELETE FROM messages WHERE chat_id = ?").run(r), e.prepare("DELETE FROM chats WHERE id = ?").run(r), !0)), f.handle("get-messages", (t, r) => e.prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC").all(r)), f.handle("add-message", (t, r) => {
    const n = C();
    return e.prepare(`
      INSERT INTO messages (id, chat_id, role, content, thinking, tool_calls, images)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      n,
      r.chatId,
      r.role,
      r.content,
      r.thinking,
      JSON.stringify(r.toolCalls),
      JSON.stringify(r.images)
    ), e.prepare("UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(r.chatId), n;
  }), f.handle("get-templates", () => e.prepare("SELECT * FROM prompt_templates ORDER BY category, title").all()), f.handle("create-template", (t, r) => {
    const n = C();
    return e.prepare("INSERT INTO prompt_templates (id, key, title, prompt) VALUES (?, ?, ?, ?)").run(n, r.key, r.title, r.prompt), n;
  }), f.handle("update-template", (t, r) => (e.prepare("UPDATE prompt_templates SET key = ?, title = ?, prompt = ? WHERE id = ?").run(r.key, r.title, r.prompt, r.id), !0)), f.handle("delete-template", (t, r) => (e.prepare("DELETE FROM prompt_templates WHERE id = ?").run(r), !0)), f.handle("get-setting", (t, r) => {
    const n = e.prepare("SELECT value FROM settings WHERE key = ?").get(r);
    return n ? n.value : null;
  }), f.handle("set-setting", (t, r, n) => {
    e.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(r, n), r === "ollamaApiKey" && B.updateApiKey(n);
  }), f.handle("read-file", async (t, r) => {
    var n;
    try {
      const o = L.readFileSync(r), s = (n = r.split(".").pop()) == null ? void 0 : n.toLowerCase();
      return s === "pdf" ? { type: "text", content: (await Rt(o)).text, name: r.split(/[/\\]/).pop() } : ["png", "jpg", "jpeg", "webp", "gif"].includes(s || "") ? { type: "image", content: o.toString("base64"), name: r.split(/[/\\]/).pop() } : { type: "text", content: o.toString("utf-8"), name: r.split(/[/\\]/).pop() };
    } catch (o) {
      throw console.error("File read error:", o), o;
    }
  }), f.handle("save-file", async (t, { content: r, defaultPath: n }) => {
    const { filePath: o } = await Re.showSaveDialog({
      defaultPath: n,
      filters: [{ name: "Markdown", extensions: ["md"] }]
    });
    return o ? (L.writeFileSync(o, r), !0) : !1;
  });
}
de();
const _e = Oe(import.meta.url), Z = b.dirname(_e);
globalThis.__filename = _e;
globalThis.__dirname = Z;
process.env.APP_ROOT = b.join(Z, "..");
const H = process.env.VITE_DEV_SERVER_URL, Ft = b.join(process.env.APP_ROOT, "dist-electron"), ve = b.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = H ? b.join(process.env.APP_ROOT, "public") : ve;
let w;
function Ae() {
  w = new ae({
    width: 1200,
    height: 800,
    icon: b.join(process.env.VITE_PUBLIC, "olla-icon.png"),
    webPreferences: {
      preload: b.join(Z, "preload.mjs")
    }
  }), w.webContents.on("did-finish-load", () => {
    w == null || w.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), H ? w.loadURL(H) : w.loadFile(b.join(ve, "index.html"));
}
S.on("window-all-closed", () => {
  process.platform !== "darwin" && (S.quit(), w = null);
});
S.on("activate", () => {
  ae.getAllWindows().length === 0 && Ae();
});
S.whenReady().then(() => {
  fe(), B.initialize(), Ot(), Ae();
});
export {
  Ft as MAIN_DIST,
  ve as RENDERER_DIST,
  H as VITE_DEV_SERVER_URL
};
