import json,random,collections,re,os
exec(open('/workspace/hub-src/qzwtrack/resolve_final.py').read().split("json.dump(out")[0])
os.chdir('/workspace/hub-src/qzwtrack')
SCAN=set('罔慕颦')
for c in SCAN: out[c]['rs']='scan'; out[c]['why']='GF 0012 扫描页上找到此字'
json.dump(out,open('rad_new.json','w'),ensure_ascii=False,indent=0)
CH=json.load(open('chars.json')); LV={L['t']:L for L in json.load(open('qzw_levels.json'))}
BJ='/workspace/hanzi-xueyuan/modules/pinci/data/bushou.js'
s=open(BJ).read(); m=re.search(r'window\.PCW_BUSHOU=(\{.*\});',s,re.S); BS=json.loads(m.group(1))
if '千字文部首' in BS['tiers']:
    BS['levels']=[L for L in BS['levels'] if BS['tiers'][L[0]]!='千字文部首']; BS['tiers'].remove('千字文部首')
have={q[0] for L in BS['levels'] for q in L[1]}
rng=random.Random(20261124); pool=[];skip=collections.Counter()
for e in CH:
    c=e['s']; x=out.get(c)
    if not x or c in have: continue
    if x['rs'] not in ('gf','agree','scan'): skip['部首人工判定']+=1; continue
    if x['ss']=='hand' or not x['st']: skip['结构人工判定']+=1; continue
    if c not in LV: skip['无笔画/读音']+=1; continue
    if x['r'] not in DISPLAY_OK and x['m'] not in DISPLAY_OK: skip['部首显示形不在题库']+=1; continue
    alts=[]
    for v in R[c]['vals']:
        v=(v or '').split('、')[0]
        if v and main(v) and main(v)!=x['m'] and v not in alts: alts.append(v)
    selfa=[a for a in LV[c]['a'] if a['c']==c][0]
    pool.append((c,x,alts,selfa['py'],selfa['au']))
T=len(BS['tiers']); BS['tiers'].append('千字文部首'); add=[]
for i in range(0,len(pool),10):
    ql=[]
    for c,x,alts,py,au in pool[i:i+10]:
        ds=distractors(c,x['r'],x['m'],alts,rng)[:3]; assert len(ds)==3,(c,ds)
        opts=ds+[x['r']]; rng.shuffle(opts)
        ql.append([c,x['st'],x['sub'] or '',x['r'],x['nm'],''.join(opts) if all(len(o)==1 for o in opts) else opts,py,au,x['m']])
    add.append([T,ql])
if len(add)>1 and len(add[-1][1])<5: add[-2][1]+=add.pop()[1]
n0=len(BS['levels']); BS['levels']+=add
open(BJ,'w').write(s[:m.start(1)]+json.dumps(BS,ensure_ascii=False,separators=(',',':'))+s[m.end(1):])
print('pool add',len(pool),'levels',n0+1,'-',len(BS['levels']),dict(skip))
json.dump({q[0]:n0+1+k for k,L in enumerate(add) for q in L[1]},open('bs_extra_map.json','w'),ensure_ascii=False)
