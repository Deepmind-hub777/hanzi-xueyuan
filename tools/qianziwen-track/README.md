# 千字文园数据生成脚本

存档用（路径写死在作者的构建机上，依赖 pinciwang/build 的关卡流水线与部首资料）。

1. build_qzw.py：chars.json（千字文去重简体字）→ 每字一关，沿用主园关卡或按主园同一流水线新生成。
2. gen_audio.py：补读音（Xiaoxiao −10%，多音字用同音单音字），之后用声调检测核对。
3. resolve_final.py：补部首/结构 → rad_new.json（rs/ss：gf / agree / scan / hand）。
4. build_bs_extra.py：可靠的字加入后花园「千字文部首」一档。
5. make_links.py：重写 modules/qianziwen/data/pinci-links.json（qz / lv / bs + 部首结构 + 人工判定标记）。

说明见 modules/pinci/QIANZIWEN-TRACK.md。
