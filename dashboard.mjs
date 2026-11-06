import {dimensions, metrics, select, withheld} from './model.mjs';
import {createPoller} from './refresh.mjs';

const pages = {
  overview:['Executive Command Center','See what follow-up records tell you','Review recorded answers, customer feedback and order issues.'],
  branches:['Branch Intelligence','Compare outcomes across branches','Compare issue rates with their eligible feedback counts.'],
  voice:['Voice of Customer','Explore recurring feedback themes','Review candidates identified by bilingual comment rules.'],
  satisfaction:['Satisfaction vs. Problems','High ratings can coexist with issues','See how recorded scores overlap with structured issue status.'],
  operations:['Xelevate Follow-up Operations','Track follow-up activity','Explore anonymous workload and recorded outcomes.'],
  trust:['Data Trust Center','Understand the limits of the data','Review coverage, withheld categories and metric definitions.']
};
const labels = {branch:'Branch',answer:'Recorded answer',issue:'Problem status',rating:'Rating band',theme:'Issue theme',agent:'Agent alias',period:'Follow-up month'};
const $ = id => document.getElementById(id);
const node = (tag,text,cls) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (cls) el.className = cls;
  return el;
};
let dataset, filters = {}, page, rendered, contextKey;
const formatCount = n => n.toLocaleString('en-EG');
const rate = (n,d) => d >= 20 && n >= 5 && d-n >= 5 ? (100*n/d).toFixed(1)+'%' : 'Suppressed';
const options = key => [...new Set(dataset?.cells.map(c=>c[key]))].filter(x=>x !== withheld).sort();

function readRoute() {
  const [route, query] = location.hash.slice(1).split('?');
  if (route === 'main') return;
  page = Object.hasOwn(pages,route) ? route : 'overview';
  const parameters = new URLSearchParams(query);
  filters = Object.fromEntries(dimensions.map(key => [key,[...new Set(parameters.getAll(key))]
    .filter(value => !dataset || options(key).includes(value))]));
}
function href(target, selected = filters) {
  const params = new URLSearchParams();
  for (const key of dimensions) for (const item of selected[key] || []) params.append(key,item);
  return '#'+target+(params.size ? '?'+params : '');
}
function toggle(key,value,multi) {
  const current = filters[key] || [];
  filters[key] = current.includes(value) ? current.filter(item=>item!==value) : multi ? [...current,value] : [value];
  location.hash = href(page);
}
function card(title) {
  const box = node('article',undefined,'card');
  box.append(node('h2',title));
  return box;
}
function bars(key, title = labels[key], extra) {
  const box = card(title);
  const groups = Map.groupBy(select(dataset.cells,filters,key),cell=>cell[key]);
  const rows = [...groups].map(([label,cells])=>[label,metrics(cells)]).sort((a,b)=>key==='period'
    ? a[0].localeCompare(b[0]) : b[1].total-a[1].total);
  const list = node('div',undefined,'bars');
  if (!rows.length) list.append(node('p','No matching records'));
  const max = Math.max(1,...rows.map(([,m])=>m.total));
  for (const [label,m] of rows) {
    const selected = filters[key]?.includes(label);
    const button = node('button',undefined,'bar'+(filters[key]?.length && !selected ? ' dim' : ''));
    button.disabled = label === withheld;
    button.setAttribute('aria-pressed',String(Boolean(selected)));
    const value = extra ? extra(m) : formatCount(m.total);
    button.title = label + ' · ' + value + ' · ' + formatCount(m.total) + ' published records';
    button.setAttribute('aria-label',button.title);
    const bar = node('i');
    bar.style.setProperty('--width',(100*m.total/max)+'%');
    bar.setAttribute('aria-hidden','true');
    button.append(node('span',label),bar,node('span',value));
    button.onclick = event => toggle(key,label,event.ctrlKey || event.metaKey);
    list.append(button);
  }
  box.append(list);
  return box;
}

function kpis(m) {
  const box = node('div',undefined,'kpis');
  for (const [label,value,detail] of [
    ['Recorded follow-ups',formatCount(m.total),'Published record count'],
    ['Recorded answer rate',rate(m.answered,m.knownAnswer),m.answered+' / '+m.knownAnswer+' classified answers'],
    ['Feedback status coverage',rate(m.eligible,m.answered),m.eligible+' / '+m.answered+' recorded Yes'],
    ['Structured issue rate',rate(m.issues,m.eligible),m.issues+' / '+m.eligible+' eligible records'],
    ['Recorded high ratings',rate(m.high,m.rated),m.high+' / '+m.rated+' visible eligible ratings'],
    ['Rating coverage',rate(m.rated,m.eligible),m.rated+' / '+m.eligible+' eligible records']
  ]) {
    const tile = node('article',undefined,'card');
    const showFraction = value !== 'Suppressed' || detail === 'Published record count';
    tile.append(node('span',label),node('strong',value),node('small',showFraction ? detail : 'Insufficient published sample'));
    box.append(tile);
  }
  return box;
}
function matrix(rows) {
  const box = card('Rating band by structured issue status');
  const table = node('table',undefined,'table');
  const header = table.createTHead().insertRow();
  for (const label of ['Rating band','Issue Yes','Issue No','Unknown','Withheld']) header.append(node('th',label));
  const body = table.createTBody();
  for (const [rating,cells] of Map.groupBy(rows,c=>c.rating)) {
    const row = body.insertRow();
    const heading = node('th',rating); heading.scope = 'row'; row.append(heading);
    for (const issue of ['Yes','No','Unknown',withheld]) {
      const n = metrics(cells.filter(c=>c.issue===issue)).total;
      row.insertCell().textContent = n ? formatCount(n) : '—';
    }
  }
  box.append(table);
  return box;
}
function render() {
  const selected = dataset ? select(dataset.cells,filters) : [];
  const m = metrics(selected);
  const [name,title,sub] = pages[page];
  const route = href(page);
  const active = Object.values(filters).flat();
  const context = route+'|'+(dataset ? m.total : 'waiting');
  if (contextKey !== context) {
    const heading = node('div');
    heading.append(node('span',name,'eyebrow'),node('h1',title),node('p',sub),
      node('small',dataset ? (active.join(' · ') || 'All published records')+' · '+formatCount(m.total)+' follow-ups' : 'Awaiting a validated snapshot'));
    $('hero').replaceChildren(heading);
    contextKey = context;
  }
  $('nav').replaceChildren(...Object.entries(pages).map(([key,copy]) => {
    const link = node('a',copy[0]); link.href = href(key);
    if (key===page) link.setAttribute('aria-current','page');
    return link;
  }));
  const controls = $('filters');
  const previousFocus = document.activeElement?.dataset.focus;
  controls.replaceChildren();
  if (dataset) for (const key of dimensions) {
    const values = options(key);
    if (!values.length) continue;
    const input = node('select');
    input.dataset.focus = key;
    input.setAttribute('aria-label',labels[key]);
    input.append(new Option(labels[key],''));
    for (const value of values) input.append(new Option((filters[key]?.includes(value) ? '✓ ' : '')+value,value));
    input.onchange = () => toggle(key,input.value,true);
    controls.append(input);
  }
  for (const [key,values] of Object.entries(filters)) for (const value of values) {
    const chip = node('button',value+' ×','chip');
    chip.setAttribute('aria-label','Remove '+labels[key]+' '+value);
    chip.onclick = () => toggle(key,value,true);
    controls.append(chip);
  }
  if (active.length) {
    const reset = node('button','Reset all');
    reset.onclick = () => {location.hash = href(page,{});};
    controls.append(reset);
  }
  if (previousFocus) [...controls.children].find(el=>el.dataset.focus===previousFocus)?.focus();
  const content = $('content');
  content.replaceChildren();
  if (!dataset) {
    content.append(node('p','A validated analytics snapshot is unavailable. Ask the dashboard owner to publish a snapshot, then choose Refresh now.','note'));
    return;
  }
  if (!m.total) content.append(node('p','No matching records. Remove a filter to widen the scope.','note'));
  content.append(kpis(m));
  const grid = node('div',undefined,'grid');
  const info = (title,copy) => {
    const box = card(title); box.append(node('p',copy)); return box;
  };
  const issueRate = item => rate(item.issues,item.eligible);
  const cards = {
    overview: () => [bars('period','Follow-up activity'),bars('branch','Follow-ups by branch'),bars('answer','Recorded answer outcomes'),bars('theme','Comment review candidates'),bars('rating','Recorded rating bands'),bars('issue','Structured issue status')],
    branches: () => [bars('branch','Branch volume and eligible issue rate',issueRate),bars('issue','Issue status in scope'),
      info('Comparison context','Bars show record volume. Rates require 20 eligible published records and sufficient counts on both sides of the rate.')],
    voice: () => [bars('theme','Issue theme candidates'),bars('branch','Branch context'),
      info('Comment review','Deterministic bilingual rules identify candidates for review. Multiple matches use a separate category. Theme and branch intersections may be withheld.')],
    satisfaction: () => [matrix(selected.filter(c=>c.answer==='Yes')),bars('rating','Recorded rating bands'),
      info('High ratings among issue records',rate(m.highIssue,m.ratedIssue)+' of visible ratings in the published issue cohort. Some recorded scores may be placeholders or relate to orders the customer had yet to try.')],
    operations: () => [bars('agent','Anonymous workload'),bars('answer','Recorded answer outcomes'),bars('period','Follow-up activity'),
      info('Potential retries','Possible repeat follow-ups are reviewed privately. Public counts are gated pending disclosure review.')],
    trust: () => [bars('issue','Feedback status coverage'),bars('answer','Answer field coverage'),
      info('Quality checks','Date anomalies, contact contradictions, unratable feedback and retry candidates are reviewed privately. Public tables group sparse categories as Withheld.'),
      info('Metric confidence','Recorded answer reflects source coding. Structured issue rate uses answered records with known problem status. High ratings are provisional.')],
  };
  grid.append(...cards[page]());
  content.append(grid,node('p','Withheld categories combine small groups. Rates use the visible classifications and may differ from private totals.','muted'));
}
const cairo = new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Cairo'});
const poller = createPoller({
  load: async () => {
    const response = await fetch(new URL('./analytics.json',location.href),{cache:'no-cache',signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error('Analytics snapshot unavailable');
    return response.json();
  },
  update: ({dataset:nextData,state,next}) => {
    const message = {checking:'Checking…',connected:'Connected · Snapshot',stale:'Using last available data',unavailable:'Connection unavailable'}[state];
    if ($('connection').textContent !== message) $('connection').textContent = message;
    $('connection').title = state==='stale' || state==='unavailable' ? 'The latest availability check did not return a usable current snapshot.' : 'Checks the published aggregate snapshot.';
    $('dot').className = 'dot '+state;
    const remaining = Math.max(0,Math.ceil((next-Date.now())/1000));
    $('countdown').textContent = state==='checking' ? '' : 'Next check '+(remaining===60?'01:00':'00:'+String(remaining).padStart(2,'0'));
    $('refresh').disabled = state==='checking' || Date.now()<next-55000;
    $('freshness').textContent = nextData ? 'Last data change '+cairo.format(new Date(nextData.data_last_changed_at))+
      ' · Last source check '+cairo.format(new Date(nextData.source_last_checked_at))+' Cairo' : '';
    if (rendered === nextData?.dataset_version) return;
    const previousRoute = href(page);
    dataset = nextData;
    rendered = nextData?.dataset_version;
    readRoute();
    if (previousRoute !== href(page) && nextData) {
      history.replaceState(null,'',href(page));
      $('notice').textContent = 'Unavailable filters were cleared after the snapshot changed.';
    }
    render();
  }
});
readRoute();
render();
window.addEventListener('hashchange',()=>{readRoute(); render();});
window.addEventListener('keydown',event=>{if(event.key==='Escape') location.hash=href(page,{});});
window.addEventListener('online',()=>poller.check(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden) poller.tick();});
$('refresh').onclick=()=>poller.check(true);
poller.tick();
setInterval(()=>{if(!document.hidden) poller.tick();},1000);

