// 定时抓取 CF 优选 IP 数据，写入 src/data/cf-ips.json
// 用法：node scripts/fetch-cf-ips.mjs
// GitHub Actions 每 6 小时运行一次；任一数据源失败时保留旧数据，不清空。
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'src', 'data', 'cf-ips.json');

const SRC_ISP = 'https://addressesapi.090227.xyz/CloudFlareYes';
const SRC_V4 = 'https://raw.githubusercontent.com/joname1/BestCFip/refs/heads/main/ipv4.txt';
const SRC_V6 = 'https://raw.githubusercontent.com/joname1/BestCFip/refs/heads/main/ipv6.txt';

const ISP_NAMES = { CM: '移动', CT: '电信', CU: '联通' };
const ISP_GROUPS = { CT: 'telecom', CU: 'unicom', CM: 'mobile' };

async function fetchText(url, timeoutMs = 30000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'tech-blog-cf-ips/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

// 解析 "172.67.156.180#CM-Default" → 按运营商分组
function parseIspList(text) {
  const groups = { telecom: [], unicom: [], mobile: [] };
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || !t.includes('#')) continue;
    const [ip, tagRaw = ''] = t.split('#');
    if (!/^[0-9a-fA-F:.]+$/.test(ip)) continue;
    const parts = tagRaw.split('-');
    const g = ISP_GROUPS[parts[0].toUpperCase()];
    if (!g) continue;
    const colo = parts.slice(1).join('-') || 'Default';
    groups[g].push({ ip, colo, isp: ISP_NAMES[parts[0].toUpperCase()] });
  }
  return groups;
}

// 解析 "104.16.105.166:443#US-b9bf58" / "[2606:...]:443#IPDBv6-xxx"
function parseBestList(text) {
  const list = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.includes('list.updated.at')) continue;
    const hashIdx = t.lastIndexOf('#');
    if (hashIdx < 0) continue;
    const addr = t.slice(0, hashIdx);
    const tag = t.slice(hashIdx + 1);
    let ip = addr;
    let port = '443';
    const m = addr.match(/^(?:\[([^\]]+)\]|([^:]+)):(\d+)$/);
    if (m) {
      ip = m[1] || m[2];
      port = m[3];
    }
    if (!/^[0-9a-fA-F:.]+$/.test(ip)) continue;
    list.push({ ip, port, tag });
  }
  return list;
}

async function main() {
  let prev = null;
  if (existsSync(outPath)) {
    try {
      prev = JSON.parse(readFileSync(outPath, 'utf8'));
    } catch {
      prev = null;
    }
  }

  const result = {
    updated_at: new Date().toISOString(),
    sources: [
      { name: 'CloudFlareYes（运营商分组）', url: 'https://addressesapi.090227.xyz/CloudFlareYes' },
      { name: 'BestCFip（综合优选）', url: 'https://github.com/joname1/BestCFip' },
    ],
    groups: prev?.groups ?? { telecom: [], unicom: [], mobile: [], ipv4: [], ipv6: [] },
  };

  try {
    const g = parseIspList(await fetchText(SRC_ISP));
    const total = g.telecom.length + g.unicom.length + g.mobile.length;
    if (total > 0) {
      result.groups.telecom = g.telecom;
      result.groups.unicom = g.unicom;
      result.groups.mobile = g.mobile;
    }
  } catch (e) {
    console.error('CloudFlareYes 抓取失败:', e.message);
  }

  try {
    const list = parseBestList(await fetchText(SRC_V4));
    if (list.length > 0) result.groups.ipv4 = list;
  } catch (e) {
    console.error('BestCFip IPv4 抓取失败:', e.message);
  }

  try {
    const list = parseBestList(await fetchText(SRC_V6));
    if (list.length > 0) result.groups.ipv6 = list;
  } catch (e) {
    console.error('BestCFip IPv6 抓取失败:', e.message);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
  const g = result.groups;
  console.log(`已写入 ${outPath}`);
  console.log(
    `电信 ${g.telecom.length} / 联通 ${g.unicom.length} / 移动 ${g.mobile.length} / IPv4 ${g.ipv4.length} / IPv6 ${g.ipv6.length}`
  );
}

main();
