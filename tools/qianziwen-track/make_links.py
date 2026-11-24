import json,re,collections
P='/workspace/hanzi-xueyuan/modules/qianziwen/data/pinci-links.json'
D=json.load(open(P)); old=D['chars']
CH=json.load(open('chars.json')); RN=json.load(open('rad_new.json')); BX=json.load(open('bs_extra_map.json'))
QZ={L['t']:L['n'] for L in json.load(open('qzw_levels.json'))}
new={};miss=collections.Counter()
for e in CH:
    s=e['s']
    for t in e['trad']:
        o={k:v for k,v in old.get(t,{}).items() if k not in('radicalHand','structureHand')}; o['s']=s
        if s in QZ: o['qz']=QZ[s]
        else: o.pop('qz',None); miss['noqz']+=1
        if s in BX: o['bs']=BX[s]; o['tier']='千字文部首'
        x=RN.get(s)
        if x:
            o.update(structure=x['st'] or '',sub=x['sub'],radical=x['r'],radicalName=x['nm'])
            if x['rs']=='hand': o['radicalHand']=True
            if x['ss']=='hand': o['structureHand']=True
        elif not o.get('radical'): miss['norad']+=1; print('norad',t,s)
        new[t]=o
D={'source':'天天拼词园 data/index.js（主园母字 lv、千字文园 qz）+ data/bushou.js（后花园 bs）；部首/结构缺失的字按 GF 0012-2009 扫描与人工判定补齐（radicalHand/structureHand 标记人工判定）；繁→简用 OpenCC t2s','chars':new}
json.dump(D,open(P,'w'),ensure_ascii=False,separators=(',',':'))
print(len(new),dict(miss),sum('qz' in v for v in new.values()),sum(bool(v.get('radical')) for v in new.values()),sum(bool(v.get('radicalHand')) for v in new.values()),sum(bool(v.get('structureHand')) for v in new.values()))
for t in '天地玄黃凊': print(t,new.get(t))
