import json,asyncio,os,subprocess,edge_tts
J=json.load(open('audio_jobs.json')); D='/workspace/hanzi-xueyuan/modules/pinci/audio/'
AF='silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.08'
async def one(sem,au,t):
    out=D+au+'.mp3'
    if os.path.exists(out): return
    tmp='/tmp/qt_'+au.replace('/','_')+'.mp3'
    async with sem:
        for k in range(6):
            try: await edge_tts.Communicate('阿胶' if au=='zi/963f_e1' else t,'zh-CN-XiaoxiaoNeural',rate='-10%').save(tmp); break
            except Exception: await asyncio.sleep(3)
    af=AF
    if au=='zi/963f_e1':
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',tmp,'-af','silenceremove=start_periods=1:start_threshold=-45dB',tmp+'.w.wav'],check=True)
        # 取第一个音节：找能量谷
        import librosa,numpy as np
        y,sr=librosa.load(tmp+'.w.wav',sr=24000); r=librosa.feature.rms(y=y,frame_length=480,hop_length=240)[0]
        pk=int(np.argmax(r[:len(r)//2])); v=pk+int(np.argmin(r[pk:int(len(r)*0.75)])); cut=v*240/sr
        af=f'atrim=0:{cut:.3f},afade=t=out:st={max(cut-0.05,0):.3f}:d=0.05,apad=pad_dur=0.08'; tmp=tmp+'.w.wav'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',tmp,'-af',af,'-ac','1','-ar','24000','-b:a','32k',out],check=True)
async def main():
    sem=asyncio.Semaphore(10); await asyncio.gather(*[one(sem,a,t) for a,t in J.items()])
    print('ok',sum(os.path.exists(D+a+'.mp3') for a in J),len(J))
asyncio.run(main())
