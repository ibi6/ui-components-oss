"""验证「复制代码」：把每个组件面板里的代码放进一个空白页面，和原页面里的组件对比第一帧外观。
用法：python3 build.py && python3 tools/verify_copy.py   （需要 playwright、pillow、numpy）
只比对静态外观，不验证悬停和点击效果；带 JS 注记的组件预期会有差异。
"""
import io, collections, pathlib, numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
URL=(pathlib.Path(__file__).resolve().parent.parent/'dist'/'ui-components.single.html').as_uri()
GET="(i)=>{const c=document.querySelectorAll('#gal .cell')[i];c.querySelector('.cb2').click();const t=c.querySelector('.cc').textContent;c.querySelector('.cbx').click();return t}"
def snap(page,pad=4):
    x,y,w,h=page.evaluate("()=>{const e=document.querySelector('[data-shot]');e.scrollIntoView({block:'center',inline:'center',behavior:'instant'});const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height]}")
    clip={'x':max(0,x-pad),'y':max(0,y-pad),'width':max(8,w+2*pad),'height':max(8,h+2*pad)}
    return np.array(Image.open(io.BytesIO(page.screenshot(clip=clip))).convert('RGB')).astype(int)
def small(z,k=6):
    im=Image.fromarray(z.astype('uint8')); return np.array(im.resize((max(1,im.width//k),max(1,im.height//k)),Image.BOX)).astype(int)
FREEZE="()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=0})"
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1100,'height':900}); pg2=b.new_page(viewport={'width':700,'height':500})
    pg.set_default_timeout(8000); pg2.set_default_timeout(8000)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:120]))
    pg.goto(URL); pg.wait_for_timeout(1500)
    pg.evaluate("document.querySelectorAll('details.gen').forEach(d=>d.open=true)")
    info=pg.evaluate("""()=>[...document.querySelectorAll('#gal .cell')].map((c,i)=>({i,g:c.parentNode.previousElementSibling.textContent.slice(0,4),w:c.clientWidth-16}))""")
    gen=collections.Counter(); todo=[]
    for x in info:
        if x['g'] in ('按钮组合','动效组合'):
            gen[x['g']]+=1
            if gen[x['g']]>8: continue
        todo.append(x)
    bad=[]; ok=0; nojs_bad=[]
    for x in todo:
        i=x['i']
        try:
            code=pg.evaluate(GET,i)
            pg.evaluate("(i)=>{document.querySelectorAll('[data-shot]').forEach(e=>e.removeAttribute('data-shot'));const c=document.querySelectorAll('#gal .cell')[i];[...c.children].find(e=>!e.matches('.lbl,.cb2,.cbox')).setAttribute('data-shot','1')}",i)
            pg.evaluate("()=>document.querySelector('[data-shot]').getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=0})")
            A=snap(pg)
            pg2.set_content(f'<!doctype html><meta charset=utf-8><div id=w style="display:grid;place-items:center;width:{x["w"]}px">{code}</div>')
            pg2.evaluate("()=>{[...document.querySelector('#w').children].find(e=>e.tagName!=='STYLE').setAttribute('data-shot','1')}"); pg2.evaluate(FREEZE)
            B=snap(pg2)
        except Exception as e:
            bad.append((i,x['g'],'ERR '+str(e).split('\n')[0][:70],False)); continue
        hasjs='可能有 JavaScript 交互' in code
        if abs(A.shape[0]-B.shape[0])>3 or abs(A.shape[1]-B.shape[1])>3:
            bad.append((i,x['g'],f'尺寸 {A.shape[1]}x{A.shape[0]} vs {B.shape[1]}x{B.shape[0]}',hasjs)); continue
        h=min(A.shape[0],B.shape[0]); w=min(A.shape[1],B.shape[1]); A=A[:h,:w]; B=B[:h,:w]
        d=np.abs(small(A)-small(B)); m=d.mean(); fr=(d.max(axis=2)>60).mean()
        if m>9 or fr>0.10:
            bad.append((i,x['g'],f'差异 mean={m:.1f} 大差异={fr*100:.0f}%',hasjs))
            Image.fromarray(np.hstack([A.astype('uint8'),np.full((h,6,3),255,'uint8'),B.astype('uint8')])).save(f'bad_{i}.png')
        else: ok+=1
    print('页面错误:',errs); print(f'验证 {len(todo)} 个：一致 {ok}，不一致 {len(bad)}（其中带 JS 注记 {sum(z[3] for z in bad)}）')
    for z in bad: print('  #%d [%s] %s | JS注记=%s'%z)
    b.close()
