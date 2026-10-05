const page = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>832401313 计算器</title>
<style>
:root{font-family:system-ui,"Microsoft YaHei",sans-serif;color:#eaf0ff;background:#0e1424}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top left,#273657,#0e1424 42rem)}button,input{font:inherit}.shell{width:min(1080px,calc(100% - 32px));margin:auto;padding:42px 0 64px}.eyebrow{margin:0 0 8px;color:#91a9ff;font-size:12px;font-weight:700;letter-spacing:.18em}.hero{margin-bottom:24px}h1,h2,p{margin-top:0}h1{margin-bottom:8px;font-size:clamp(30px,6vw,54px);letter-spacing:-.04em}.subtitle{color:#aeb9cf;line-height:1.7}.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:20px}.card{border:1px solid #2d3b5b;border-radius:22px;background:rgba(20,29,50,.92);box-shadow:0 20px 60px #0004;padding:22px}.display label{display:block;margin-bottom:8px;color:#93a4c9;font-size:13px}.display input{width:100%;border:1px solid #40527c;border-radius:13px;padding:16px;color:#f8fbff;background:#0e1629;font-size:21px;outline:0}.display input:focus{border-color:#91a9ff}.result{min-height:48px;padding-top:16px;color:#f8d889;font-size:32px;font-weight:700}.message{min-height:23px;color:#aeb9cf;font-size:13px}.error{color:#ff9a9a}.success{color:#8de0bd}.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.key{min-height:56px;border:1px solid #344565;border-radius:13px;color:#eef3ff;background:#1b2945;cursor:pointer;font-size:19px}.key:hover{background:#293b61}.op{color:#b9c7ff;background:#263664}.eq{color:#102032;background:#8de0bd;font-weight:800}.muted{color:#b7c2da;background:#152039;font-size:14px}.hint{margin:14px 0 0;color:#7e8eaf;font-size:12px}.heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.heading h2{margin:0;font-size:23px}.small{border:1px solid #40527c;border-radius:9px;padding:7px 11px;color:#cbd6f4;background:transparent;cursor:pointer}.history{display:grid;gap:9px;max-height:540px;overflow:auto}.item{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #2e3c5b;border-radius:13px;padding:12px;background:#151f36}.expr{margin-bottom:4px;color:#eef3ff;font-family:Consolas,monospace}.meta{color:#8392b1;font-size:11px}.del{border:0;color:#ff9a9a;background:transparent;cursor:pointer;font-size:12px}.empty{color:#8392b1;font-size:14px;line-height:1.7}@media(max-width:760px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main class="shell">
<section class="hero"><p class="eyebrow">SOFTWARE ENGINEERING PRACTICE</p><h1>计算器</h1><p class="subtitle">表达式交给后端计算，成功记录保存到 D1 数据库。</p></section>
<section class="grid">
<div class="card">
<div class="display"><label for="expression">表达式</label><input id="expression" placeholder="例如：(1 + 2) * 3" autocomplete="off"><div id="result" class="result">等待输入</div><div id="message" class="message"></div></div>
<div class="keys"><button class="key muted" data-action="clear">清空</button><button class="key muted" data-action="backspace">退格</button><button class="key op" data-value="(">(</button><button class="key op" data-value=")">)</button><button class="key" data-value="7">7</button><button class="key" data-value="8">8</button><button class="key" data-value="9">9</button><button class="key op" data-value="/">÷</button><button class="key" data-value="4">4</button><button class="key" data-value="5">5</button><button class="key" data-value="6">6</button><button class="key op" data-value="*">×</button><button class="key" data-value="1">1</button><button class="key" data-value="2">2</button><button class="key" data-value="3">3</button><button class="key op" data-value="-">−</button><button class="key" data-value="0">0</button><button class="key" data-value=".">.</button><button class="key op" data-value="+">＋</button><button class="key eq" data-action="calculate">=</button></div>
<p class="hint">也可以在输入框键入表达式后按 Enter。</p>
</div>
<aside class="card"><div class="heading"><div><p class="eyebrow">DATABASE HISTORY</p><h2>计算历史</h2></div><button id="refresh" class="small">刷新</button></div><div id="history" class="history"><p class="empty">正在读取历史记录……</p></div></aside>
</section>
</main>
<script>
const input=document.querySelector('#expression'), result=document.querySelector('#result'), message=document.querySelector('#message'), history=document.querySelector('#history');
function say(text,type){message.textContent=text;message.className='message '+(type||'')}
async function calculate(){const expression=input.value.trim();if(!expression){say('请先输入表达式。','error');return}say('正在请求后端计算……');try{const res=await fetch('/api/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({expression})});const data=await res.json();if(!res.ok||!data.success)throw Error(data.message||'计算失败');result.textContent=String(data.result);say('计算成功，记录已保存。','success');await loadHistory()}catch(error){result.textContent='—';say(error.message||'请求失败。','error')}}
async function loadHistory(){try{const res=await fetch('/api/history');const data=await res.json();if(!res.ok||!data.success)throw Error(data.message||'读取失败');renderHistory(data.history)}catch(error){history.innerHTML='<p class="empty">历史记录读取失败：'+error.message+'</p>'}}
function renderHistory(records){history.innerHTML='';if(!records.length){history.innerHTML='<p class="empty">还没有成功的计算记录。</p>';return}records.forEach(record=>{const item=document.createElement('article');item.className='item';const details=document.createElement('div');const expr=document.createElement('div');expr.className='expr';expr.textContent=record.expression;const meta=document.createElement('div');meta.className='meta';meta.textContent=record.created_at+' · 结果 '+record.result;details.append(expr,meta);const del=document.createElement('button');del.className='del';del.textContent='删除';del.onclick=()=>deleteHistory(record.id);item.append(details,del);history.append(item)})}
async function deleteHistory(id){try{const res=await fetch('/api/history/'+id,{method:'DELETE'});const data=await res.json();if(!res.ok||!data.success)throw Error(data.message||'删除失败');say('历史记录已删除。','success');await loadHistory()}catch(error){say(error.message||'删除失败。','error')}}
document.querySelectorAll('.key').forEach(button=>button.onclick=()=>{const action=button.dataset.action,value=button.dataset.value;if(action==='clear'){input.value='';result.textContent='等待输入';say('')}else if(action==='backspace'){input.value=input.value.slice(0,-1);input.focus()}else if(action==='calculate'){calculate()}else if(value){input.value+=value;input.focus()}});input.onkeydown=event=>{if(event.key==='Enter')calculate()};document.querySelector('#refresh').onclick=loadHistory;loadHistory();
</script>
</body>
</html>`;

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,DELETE,OPTIONS", "access-control-allow-headers": "content-type" } });

function tokenize(expression) {
  if (typeof expression !== "string" || !expression.trim()) throw new Error("Expression cannot be empty");
  if (expression.length > 200) throw new Error("Expression is too long");
  const tokens = [];
  let position = 0;
  const pattern = /\d+(?:\.\d*)?|\.\d+|[()+\-*/]/y;
  while (position < expression.length) {
    if (/\s/.test(expression[position])) { position += 1; continue; }
    pattern.lastIndex = position;
    const match = pattern.exec(expression);
    if (!match) throw new Error("Invalid character: " + expression[position]);
    tokens.push(match[0]);
    position = pattern.lastIndex;
  }
  return tokens;
}

class Parser {
  constructor(tokens) { this.tokens = tokens; this.position = 0; }
  current() { return this.tokens[this.position]; }
  take() { const token = this.current(); if (token === undefined) throw new Error("Incomplete expression"); this.position += 1; return token; }
  parse() { const value = this.expression(); if (this.current() !== undefined) throw new Error("Unexpected token: " + this.current()); return value; }
  expression() { let value = this.term(); while (["+", "-"].includes(this.current())) { const op = this.take(); const right = this.term(); value = op === "+" ? value + right : value - right; } return value; }
  term() { let value = this.unary(); while (["*", "/"].includes(this.current())) { const op = this.take(); const right = this.unary(); if (op === "/" && right === 0) throw new Error("Division by zero is not allowed"); value = op === "*" ? value * right : value / right; } return value; }
  unary() { if (this.current() === "+") { this.take(); return this.unary(); } if (this.current() === "-") { this.take(); return -this.unary(); } return this.primary(); }
  primary() { const token = this.current(); if (token === "(") { this.take(); const value = this.expression(); if (this.current() !== ")") throw new Error("Missing closing parenthesis"); this.take(); return value; } if (token === undefined || [")", "+", "-", "*", "/"].includes(token)) throw new Error("A number or opening parenthesis was expected"); this.take(); const value = Number(token); if (!Number.isFinite(value)) throw new Error("Invalid number"); return value; }
}

function calculateExpression(expression) { const value = new Parser(tokenize(expression)).parse(); if (!Number.isFinite(value)) throw new Error("Result is not finite"); return Object.is(value, -0) ? 0 : value; }

async function api(request, env) {
  if (!env.DB) return json({ success: false, message: "Database binding is unavailable" }, 503);
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,DELETE,OPTIONS", "access-control-allow-headers": "content-type" } });
  try {
    if (url.pathname === "/api/calculate" && request.method === "POST") {
      const body = await request.json();
      const expression = body?.expression;
      const result = calculateExpression(expression);
      const createdAt = new Date().toISOString();
      const insert = await env.DB.prepare("INSERT INTO calculation_history (expression, result, created_at) VALUES (?, ?, ?)").bind(expression, String(result), createdAt).run();
      return json({ success: true, id: insert.meta.last_row_id, expression, result, created_at: createdAt });
    }
    if (url.pathname === "/api/history" && request.method === "GET") {
      const rows = await env.DB.prepare("SELECT id, expression, result, created_at FROM calculation_history ORDER BY id DESC").all();
      return json({ success: true, history: rows.results.map(row => ({ id: row.id, expression: row.expression, result: Number(row.result), created_at: row.created_at })) });
    }
    const match = url.pathname.match(/^\/api\/history\/(\d+)$/);
    if (match && request.method === "DELETE") {
      const deleted = await env.DB.prepare("DELETE FROM calculation_history WHERE id = ?").bind(Number(match[1])).run();
      if (!deleted.meta.changes) return json({ success: false, message: "History record not found" }, 404);
      return json({ success: true, message: "History record deleted" });
    }
    return json({ success: false, message: "Not found" }, 404);
  } catch (error) {
    return json({ success: false, message: error?.message || "Request failed" }, 400);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return api(request, env);
    if (url.pathname !== "/" && url.pathname !== "/index.html") return new Response("Not found", { status: 404 });
    return new Response(page, { headers: { "content-type": "text/html; charset=utf-8" } });
  },
};

