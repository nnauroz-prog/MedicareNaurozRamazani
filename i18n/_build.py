import json, os, sys
base = os.path.dirname(os.path.abspath(__file__))
de = json.load(open(os.path.join(base, "_strings.de.json"), encoding="utf-8"))
N = len(de)
ok = True
for code in ["en", "tr", "ru", "fa"]:
    ap = os.path.join(base, code + ".array.json")
    if not os.path.exists(ap):
        print(f"[{code}] MISSING array file"); ok = False; continue
    arr = json.load(open(ap, encoding="utf-8"))
    if len(arr) != N:
        print(f"[{code}] LENGTH MISMATCH: {len(arr)} != {N}"); ok = False; continue
    # zip into dict, skip identical (fallback handles those) to keep file lean
    d = {}
    same = 0
    for g, t in zip(de, arr):
        if t is None: t = g
        if t == g:
            same += 1
            continue
        d[g] = t
    out = os.path.join(base, code + ".json")
    json.dump(d, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"[{code}] OK  entries={len(d)} (identical-skipped={same})  -> {code}.json")
print("BUILD", "OK" if ok else "HAD ERRORS")
sys.exit(0 if ok else 1)
