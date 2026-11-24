"""千字文园：每个千字文简化字一关（与主园同一套答案生成：IDS 全后代 + 几何复核 + 笔形硬校验 + 同笔画集合唯一，答案限 3500 常用字）。
在 pinciwang/build 目录下运行： python3 build_qzw.py"""
import json, os, sys
from multiprocessing import Pool
import gen
import build_v4 as B
from v4lib import solve_v4
from pyau import py_of, au_of
C=json.load(open('/workspace/hub-src/qzwtrack/chars.json'))
MAIN=json.load(open('main_levels.json'))
mainpar={L['t']:L for L in MAIN if len(L['ch'])==1}
old_by_char={}
for L in MAIN:
    for a in L['a']: old_by_char.setdefault(a['c'],a)
CACHE='/workspace/hub-src/qzwtrack/seg_cache.json'
def work(M):
    geo=B.GEO.get(M)
    if geo is None:
        try: geo=[(float(sc),T,ks) for sc,T,ks in gen.solve2(M,0.056,0.12)]
        except Exception: geo=[]
    return M, solve_v4(M,B.VOC,geo)
if __name__=='__main__':
    todo=[c['s'] for c in C if c['s'] in gen.G and c['s'] not in mainpar]
    seg=json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    need=[m for m in todo if m not in seg]
    with Pool(8) as p:
        for k,(M,r) in enumerate(p.imap_unordered(work,need,chunksize=2)):
            seg[M]={T:[(list(c),s,src) for c,s,src in v] for T,v in r.items()}
            if k%100==0: print('seg',k,len(need),flush=True); json.dump(seg,open(CACHE,'w'),ensure_ascii=False)
    json.dump(seg,open(CACHE,'w'),ensure_ascii=False)
    out=[]; skipped=[]; n=0
    for c in C:
        M=c['s']
        if M not in gen.G: skipped.append((M,c['trad'],c['g'],'无笔画数据')); continue
        n+=1
        if M in mainpar:
            L=json.loads(json.dumps(mainpar[M])); src='main'
        else:
            lv={'n':n,'t':M,'ch':[{'c':M,'st':gen.G[M]['strokes']}]}
            L=B.build([lv],{M:seg[M]},'main',old_by_char)[0][0]; src='new'
        L['n']=n; L['g']=c['g']; L['tr']=''.join(c['trad']); L['src']=src
        for a in L['a']:
            if a['c']==M:   # 母字按千字文里的读音
                a['py']=c['py']; a['au']=au_of(M,c['py'])
        out.append(L)
    json.dump(out,open('/workspace/hub-src/qzwtrack/qzw_levels.json','w'),ensure_ascii=False,separators=(',',':'))
    json.dump(skipped,open('/workspace/hub-src/qzwtrack/skipped.json','w'),ensure_ascii=False)
    import collections
    cnt=collections.Counter(len(L['a']) for L in out)
    print('levels',len(out),'reused',sum(L['src']=='main' for L in out),'skipped',skipped)
    print('answers dist',sorted(cnt.items()))
