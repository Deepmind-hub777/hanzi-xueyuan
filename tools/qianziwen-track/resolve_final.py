import json,sys
sys.path.insert(0,'/workspace/pinciwang/build/bushou'); import os; os.chdir('/workspace/pinciwang/build')
exec(open('/workspace/radsrc/cmp.py').read().replace("open('char_base.json')","open('/workspace/radsrc/char_base.json')").replace("open('hanzidict/","open('/workspace/radsrc/hanzidict/").replace("open('general_standard_chinese/","open('/workspace/radsrc/general_standard_chinese/"))
src=open('build_bushou.py').read(); src=src[:src.index('# ---------- 汇总')]
src=src.replace("s=SRC[c]['structure_mapull']","s=(SRC[c]['structure_mapull'] if c in SRC else mp[c]['structure'])")
exec(src)
from norm import main as nmain
R=json.load(open('/workspace/hub-src/qzwtrack/rad_scan.json'))
OVR={'美':('⺶','羊','扫描页「羊」部见此字'),'无':('无','无','扫描页「无」部见此字；本字即部首'),'焉':('一','一','通用规范数据「一字头」'),
     '有':('月','月','四源一致'),'背':('月','月','四源一致'),'主':('丶','丶','上下结构取上部「丶」（GF 0012 规则）'),'务':('夂','夂','「夊」并入「夂」部'),'二':('一','一','二不在 201 部首中，独体取起笔'),'𬨎':('车','车','仅 mapull'),'凊':('冫','冫','仅 mapull'),'寔':('宀','宀','仅 mapull')}
SFIX={'渠':('上下',None),'衡':('左中右',None),'辇':('上下',None),'姿':('上下',None),'离':('上下',None),'器':('上中下',None),'羌':('上下',None),'黄':('上下',None),'成':('半包围','右上包围'),'威':('半包围','右上包围'),'奏':('上下',None)}
MPC={'D':'独体','A':'品字形','B':'上下','E':'上中下','H':'左右','M':'左中右','Q':'全包围','R':'半包围'}
SUBC={'R1':'左三包围','R2':'左上包围','R3':'右上包围','R4':'左下包围','R5':'上三包围','R6':'下三包围'}
out={}
for c,v in R.items():
    vals=v['vals']; bhv=((bh.get(c) or {}).get('radical') or '').split('、')[0]
    if c in OVR: form,m,why=OVR[c]; rs='hand'
    elif v['gf']: form,m=v['gf'][0],v['gf'][1]; rs='gf'; why='GF 0012 扫描核对'
    else:
        mains={nmain(x) for x in vals if nmain(x)}
        if bhv=='阝' or '阝' in vals:
            t=ids(c); left=t and t[0]=='⿰' and isinstance(t[1][0],str) and t[1][0]=='阝'
            form='阝'; m='阜' if left else '邑'; rs='agree' if len(mains)<=1 else 'hand'; why='阝在左归阜、在右归邑'
        elif len(mains)==1: m=mains.pop(); form=bhv if nmain(bhv)==m else m; rs='agree'; why='各来源一致'
        else: m=nmain(bhv); form=bhv; rs='hand'; why='来源不一致，采用《通用规范汉字表》数据（在已扫描核对的 347 个分歧字中与 GF 0012 全部一致）'
    if c in mp:
        a,sub,how=structure(c)
        if c in SFIX: a,sub=SFIX[c]; ss='hand'
        elif a: ss='agree' if how=='agree' else 'convention'
        else:
            s=mp[c]['structure']; a=MPC[s[0]]; sub=SUBC.get(s); ss='hand'
    else: a,sub,ss=None,None,'none'
    pos=pos_of(c,form,m)
    out[c]=dict(r=form,m=m,nm=name(c,form,m,pos),st=a,sub=sub or '',rs=rs,ss=ss,why=why)
json.dump(out,open('/workspace/hub-src/qzwtrack/rad_new.json','w'),ensure_ascii=False,indent=0)
import collections
print(collections.Counter(x['rs'] for x in out.values()),collections.Counter(x['ss'] for x in out.values()))
print('hand rad:',' '.join(f"{c}{x['r']}" for c,x in out.items() if x['rs']=='hand'))
print('hand st:',' '.join(f"{c}{x['st']}" for c,x in out.items() if x['ss']=='hand'))
for c in '玄黄地天':
    if c in out: print(c,out[c])
