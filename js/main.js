const __MAIN=()=>{
const $=s=>document.querySelector(s);
// 倾斜光斑
const t=$('#tilt');
t.addEventListener('pointermove',e=>{const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  t.style.transform=`rotateY(${(x-.5)*16}deg) rotateX(${(.5-y)*16}deg)`;t.style.setProperty('--mx',x*100+'%');t.style.setProperty('--my',y*100+'%')});
t.addEventListener('pointerleave',()=>{t.style.transform=''});
// 按钮：流体填充起点 + 涟漪
document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.setProperty('--cx',e.clientX-r.left+'px');b.style.setProperty('--cy',e.clientY-r.top+'px')});
  b.addEventListener('click',e=>{const r=b.getBoundingClientRect(),s=document.createElement('span');s.className='rip';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';b.append(s);s.addEventListener('animationend',()=>s.remove())});
});
// 提交按钮状态
const sb=$('#submit'),sl=$('#sl');
sb.addEventListener('click',()=>{if(sb.classList.contains('busy')||sb.classList.contains('done'))return;
  sb.classList.add('busy');sl.textContent='处理中';
  setTimeout(()=>{sb.classList.replace('busy','done');sl.textContent='已提交';setTimeout(()=>{sb.classList.remove('done');sl.textContent='提交订单'},1500)},1400)});
// 深色模式开关
const root=document.documentElement,dk=$('#dark');
const savedTheme=localStorage.getItem('ui_theme');
if(savedTheme){dk.checked=savedTheme==='dark';root.dataset.theme=savedTheme;}
else{dk.checked=matchMedia('(prefers-color-scheme: dark)').matches;}
const applyTheme=d=>{const t=d?'dark':'light';dk.checked=d;root.dataset.theme=t;try{localStorage.setItem('ui_theme',t)}catch(_){}};
dk.addEventListener('change',()=>applyTheme(dk.checked));
// 标签页
const panes=['本周新增 128 位访客，停留时长比上周多了 12%。','最近一次更新发生在 2 小时前，共 6 条记录。','在这里管理账号、通知和隐私选项。'];
const tabs=[...document.querySelectorAll('#tabs button')],ind=$('#ind'),pane=$('#pane');
function place(i){const b=tabs[i];ind.style.width=b.offsetWidth+'px';ind.style.transform=`translateX(${b.offsetLeft}px)`}
function pick(i){tabs.forEach((b,j)=>b.setAttribute('aria-selected',j===i));place(i);pane.style.animation='none';pane.offsetWidth;pane.style.animation='';pane.textContent=panes[i]}
tabs.forEach((b,i)=>b.addEventListener('click',()=>pick(i)));
addEventListener('resize',()=>place(tabs.findIndex(b=>b.getAttribute('aria-selected')==='true')));
pick(0);
// 进度环
const arc=$('#arc'),num=$('#num'),rng=$('#rng');let cur=0,goal=+rng.value;
function tick(){cur+=(goal-cur)*.1;if(Math.abs(goal-cur)<.05)cur=goal;
  num.textContent=Math.round(cur);arc.style.strokeDashoffset=326.7*(1-cur/100);if(cur!==goal)requestAnimationFrame(tick)}
rng.addEventListener('input',()=>{goal=+rng.value;requestAnimationFrame(tick)});
setTimeout(()=>requestAnimationFrame(tick),300);
// 通知
$('#save').addEventListener('click',()=>{const el=document.createElement('div');el.className='toast';el.textContent='已保存，更改已同步到云端';$('#toasts').append(el);
  const close=()=>{if(el.classList.contains('out'))return;el.classList.add('out');el.addEventListener('animationend',()=>el.remove())};
  el.addEventListener('click',close);setTimeout(close,3000)});
(()=>{
// 手风琴
document.querySelectorAll('#acc .it>button').forEach(b=>b.onclick=()=>b.parentNode.classList.toggle('open'));
// 弹窗
const mk=$('#mk'),op=v=>mk.classList.toggle('on',v);
$('#om').onclick=()=>op(true);mk.onclick=e=>{if(e.target===mk)op(false)};
mk.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>op(false));
addEventListener('keydown',e=>e.key==='Escape'&&op(false));
// 轮播
const ct=$('#ct'),ds=[...document.querySelectorAll('#cd i')];let ci=0,tm;
const go=i=>{ci=(i+ds.length)%ds.length;ct.style.transform=`translateX(${-ci*100}%)`;ds.forEach((d,j)=>d.classList.toggle('on',j===ci))};
const auto=()=>{clearInterval(tm);tm=setInterval(()=>go(ci+1),3500)};
ds.forEach((d,i)=>d.onclick=()=>go(i));$('#car').onmouseenter=()=>clearInterval(tm);$('#car').onmouseleave=auto;go(0);auto();
// 汉堡与点赞
$('#bg').onclick=e=>e.currentTarget.classList.toggle('on');
const lk=$('#lk');
lk.onclick=()=>{lk.classList.toggle('on');if(!lk.classList.contains('on'))return;
  for(let i=0;i<10;i++){const p=document.createElement('i'),a=i/10*6.283,d=34+Math.random()*12;p.className='pt';
    p.style.cssText=`--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;background:${['#ff4d7e','#ffc64d','#19c3b1'][i%3]}`;lk.append(p);p.onanimationend=()=>p.remove()}};
// 星级
const ss=[...Array(5)].map((_,i)=>{const b=document.createElement('button');b.textContent='★';b.setAttribute('aria-label',(i+1)+' 星');$('#st').append(b);return b});
let rate=3;const paint=n=>ss.forEach((b,i)=>b.classList.toggle('on',i<n));paint(rate);
ss.forEach((b,i)=>{b.onmouseenter=()=>paint(i+1);b.onclick=()=>{rate=i+1;paint(rate)}});$('#st').onmouseleave=()=>paint(rate);
// 下拉与标签
const dd=$('#dd');dd.querySelector('.btn').onclick=e=>{e.stopPropagation();dd.classList.toggle('open')};
dd.querySelectorAll('.menu button').forEach(b=>b.onclick=()=>{dd.querySelector('.lb').textContent=b.textContent;dd.classList.remove('open')});
addEventListener('click',()=>dd.classList.remove('open'));
document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{c.classList.add('gone');c.onanimationend=()=>c.remove()});
// 步骤条
const sp=[...document.querySelectorAll('#stp span')];let step=1;
const ps=()=>{sp.forEach((s,i)=>s.classList.toggle('on',i<=step));$('#stp').style.setProperty('--p',step/(sp.length-1))};
$('#prv').onclick=()=>{step=Math.max(0,step-1);ps()};$('#nxt').onclick=()=>{step=Math.min(sp.length-1,step+1);ps()};ps();
// 打字机
const tw=$('#tw'),ws=['让界面动起来','细节决定质感','点一点试试看'];let wi=0,wc=0,del=false;
(function loop(){const w=ws[wi];wc+=del?-1:1;tw.textContent=w.slice(0,wc);let d=del?60:120;
  if(!del&&wc===w.length){del=true;d=1200}else if(del&&wc===0){del=false;wi=(wi+1)%ws.length;d=300}setTimeout(loop,d)})();
// 跑马灯
const mq=$('#mq div');mq.innerHTML+=mq.innerHTML;
// 柱状图
const hs=[40,65,50,85,60,95,70,55],bars=$('#bars');
const draw=()=>{bars.innerHTML=hs.map((h,k)=>`<i style="--h:${h}%;--k:${k}"></i>`).join('')};draw();$('#rp').onclick=draw;
// 磁吸
const mw=$('#mw'),mb=mw.firstElementChild;
mw.onpointermove=e=>{const r=mw.getBoundingClientRect();mb.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.35}px,${(e.clientY-r.top-r.height/2)*.35}px)`};
mw.onpointerleave=()=>mb.style.transform='';
// 图鉴
const gal=$('#gal');
gal.innerHTML=[
['按钮悬停效果',n=>`<button class='gx' data-b='${n}'>按钮</button>`,'左填充 上填充 中心展开 上浮 放大 光晕 变胶囊 字距 渐变流动 扫光 立体按压 霓虹 下划线 错位阴影 虚线转实 倾斜 抖动 呼吸光环 彩虹边框 果冻'],
['加载动画',n=>`<div class='ld' data-l='${n}'><i></i><i></i><i></i></div>`,'圆环 双色环 虚线环 脉冲 翻转方块 变形方块 缩放圆点 渐隐圆点 声波条 涟漪 进度条 轨道 追逐 渐变环 文字点点 沙漏'],
['卡片悬停效果',n=>`<div class='cd2' data-c='${n}'>卡片</div>`,'上浮 放大 倾斜 描边 渐变填充 底部滑出 聚光灯 色条 圆形铺开'],
['文字特效',n=>`<b class='tx' data-t='${n}'>动效文字</b>`,'描边空心 霓虹闪烁 字距呼吸 波浪 下划线 故障 长阴影 高亮扫过 逐字渐显 彩虹流动'],
['表单控件',n=>[
`<label class='cb'><input type='checkbox' checked><b></b></label>`,
`<label class='cb r'><input type='checkbox'><b></b></label>`,
`<input class='sx' placeholder='搜索'>`,
`<div class='fb'><input placeholder='点我输入'></div>`,
`<div class='nm'><button>-</button><b>1</b><button>+</button></div>`,
`<div class='up'>拖到这里</div>`,
`<label class='dn'><input type='checkbox'><b></b></label>`,
`<div class='sg' style='--i:0'><button class='on'>日</button><button>周</button><button>月</button></div>`][n-1],'方块勾选 圆形勾选 搜索展开 流光输入框 数字步进 上传区 日夜开关 分段控制'],
['导航与菜单',n=>[
`<nav class='nv n1'><a>首页</a><a>产品</a><a>关于</a></nav>`,
`<nav class='nv n2'><a><span data-t='首页'>首页</span></a><a><span data-t='产品'>产品</span></a><a><span data-t='关于'>关于</span></a></nav>`,
`<nav class='nv n3'><a class='on'>首页</a><a>产品</a><a>关于</a></nav>`,
`<nav class='nv n4'><a>首页</a><a>产品</a><a>关于</a></nav>`,
`<nav class='sb'><a><u>首</u>首页</a><a><u>产</u>产品</a><a><u>关</u>关于</a></nav>`,
`<nav class='bc'><a>首页</a><a>组件</a><a>导航</a></nav>`][n-1],'下划线生长 文字上滑 圆点指示 其余变暗 侧栏展开 面包屑'],
['动态背景',n=>`<div class='bg2' data-g='${n}'></div>`,'极光渐变 呼吸光斑 条纹流动 网格流动 星空闪烁 波浪 气泡上升 扫描光带'],
['鼠标特效',n=>n===5?`<div class='ms' data-m='5'><i></i><i></i></div>`:`<div class='ms' data-m='${n}'>${['移动鼠标','移动鼠标','移动鼠标','视差文字','','点击这里','在这里滑动','点击这里'][n-1]}</div>`,'聚光灯 光晕跟随 点阵点亮 视差文字 眼睛跟随 点击涟漪 轨迹拖尾 点击烟花'],
['数据可视化',n=>[
`<div class='dc'></div>`,
`<div class='pb'></div>`,
`<svg class='spk' width='110' height='44' viewBox='0 0 110 44'><polyline pathLength='1' points='0,36 18,24 36,30 54,12 72,20 90,6 110,14' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
`<div class='bz'><i style='--h:.5'></i><i style='--h:1;animation-delay:-.4s'></i><i style='--h:.7;animation-delay:-.8s'></i><i style='--h:.9;animation-delay:-1.2s'></i><i style='--h:.4;animation-delay:-.2s'></i></div>`,
`<div class='rdr'></div>`,
`<div class='cn'></div>`][n-1],'环形进度 流光进度条 折线绘制 柱状跳动 雷达扫描 数字滚动'],
['列表与表格',n=>[
`<ul class='ls2'><li>收件箱</li><li>已发送</li><li>草稿</li></ul>`,
`<ul class='ls2 st3'><li style='--i:0'>第一项</li><li style='--i:1'>第二项</li><li style='--i:2'>第三项</li></ul>`,
`<ul class='ls2 dl'><li>点我删除 1</li><li>点我删除 2</li><li>点我删除 3</li></ul>`,
`<table class='tb'><tr><td>苹果</td><td>12</td></tr><tr><td>橙子</td><td>8</td></tr><tr><td>葡萄</td><td>21</td></tr></table>`,
`<div class='so'>金额<i></i></div>`,
`<ul class='ls2 dr'><li draggable='true'>第一项</li><li draggable='true'>第二项</li><li draggable='true'>第三项</li></ul>`,
`<div class='cs'><span>设计</span><span class='on'>前端</span><span>动效</span></div>`,
`<div class='bgx'>消息<i></i></div>`][n-1],'行高亮 交错入场 点击删除 表格悬停 排序箭头 拖拽排序 多选标签 徽标脉冲'],
['时间轴与评论',n=>[
`<div class='tlv'><p>注册</p><p>验证</p><p>完成</p></div>`,
`<div class='tlh'><b></b><i></i><i></i><i></i></div>`,
`<div class='cm'><u></u><div><b>小林</b><p>这个动画太丝滑了</p></div></div>`,
`<button class='lc'>♥ <span>12</span></button>`,
`<div class='ty'><i></i><i></i><i></i></div>`,
`<div class='bb'><p>在吗</p><p>在的</p><p>来看看</p></div>`][n-1],'竖向时间轴 横向时间轴 评论卡片 点赞评论 输入中 气泡弹入'],
['图表',n=>[
`<div class='pie'></div>`,
`<div class='gau'></div>`,
`<div class='bh'><i style='--h:40%' data-v='40'></i><i style='--h:75%' data-v='75'></i><i style='--h:55%' data-v='55'></i><i style='--h:90%' data-v='90'></i><i style='--h:65%' data-v='65'></i></div>`,
`<svg class='spk ar' width='110' height='44' viewBox='0 0 110 44'><polygon points='0,44 0,36 18,24 36,30 54,12 72,20 90,6 110,14 110,44'/><polyline pathLength='1' points='0,36 18,24 36,30 54,12 72,20 90,6 110,14' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
`<div class='hb'><i style='--w:90%;--k:0'></i><i style='--w:65%;--k:1'></i><i style='--w:40%;--k:2'></i></div>`,
`<div class='ht'>${[...Array(20)].map((_,i)=>`<i style='--k:${(i*7)%11}'></i>`).join('')}</div>`,
`<div class='up3'>12.4%</div>`,
`<svg width='70' height='70' viewBox='0 0 70 70'><polygon points='35,4 64,26 53,60 17,60 6,26' fill='none' stroke='var(--line)' stroke-width='1.5'/><polygon class='rd2' points='35,16 54,28 47,50 23,48 18,28' fill='var(--v)' fill-opacity='.35' stroke='var(--v)' stroke-width='2'/></svg>`][n-1],'饼图展开 半圆仪表 悬停柱状 面积折线 条形排行 热力方块 涨幅箭头 雷达图'],
['分页与选择器',n=>[
`<div class='pg' style='--i:0'><button class='on'>1</button><button>2</button><button>3</button><button>4</button></div>`,
`<button class='arw'>下一页<i></i></button>`,
`<div class='cal'>${[...Array(14)].map((_,i)=>`<i>${i+1}</i>`).join('')}</div>`,
`<div class='cs wk'>${[...'一二三四五六日'].map(d=>`<span>${d}</span>`).join('')}</div>`,
`<div class='wh'>${[...Array(24)].map((_,i)=>`<p>${String(i).padStart(2,'0')}</p>`).join('')}</div>`,
`<div class='sw2'>${['#6c4dff','#19c3b1','#ffc64d','#ff4d7e'].map(c=>`<i style='background:${c}'></i>`).join('')}</div>`][n-1],'数字分页 箭头翻页 迷你日历 星期选择 时间滚轮 色板选择'],
['提示与反馈',n=>[
`<div class='al'>已更新到最新版本</div>`,
`<svg class='ok' width='44' height='44' viewBox='0 0 44 44' fill='none' stroke='#15a37b' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><circle cx='22' cy='22' r='19' pathLength='1'/><path d='M13 23l6 6 12-13' pathLength='1'/></svg>`,
`<div class='er'>!</div>`,
`<div class='pp'>悬停我<div>这是一段补充说明</div></div>`,
`<svg class='bl' width='34' height='34' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 16v-5a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0'/></svg>`,
`<button class='cp'>复制链接</button>`][n-1],'横幅滑入 成功对勾 错误抖动 气泡卡片 铃铛摇晃 复制反馈'],
['卡片',n=>[
`<div class='pc'><span>推荐</span><b>专业版</b><i>¥29</i></div>`,
`<div class='sc'><small>本周访客</small><b>8,420</b><u></u></div>`,
`<div class='fl'><div><p>正面</p><p>反面</p></div></div>`,
`<div class='stk'><i></i><i></i><i></i></div>`,
`<div class='gl'><p>磨砂玻璃</p></div>`][n-1],'价格卡片 统计卡片 翻转卡片 堆叠展开 磨砂玻璃'],
['抽屉与弹层',n=>[
`<div class='fr'><button>菜单</button><div class='dw'>首页<br>设置<br>退出</div></div>`,
`<div class='fr'><button>面板</button><div class='bs'>选择操作<br>分享</div></div>`,
`<div class='fr'><div class='fab'><i>★</i><i>♥</i><b>+</b></div></div>`,
`<div class='fr' data-auto='1'><button>保存</button><div class='sn'>已保存</div></div>`][n-1],'侧边抽屉 底部面板 悬浮按钮 底部提示条'],
['图片',n=>[
`<div class='mo'><i style='background:#6c4dff'></i><i style='background:#19c3b1'></i><i style='background:#ffc64d'></i><i style='background:#ff4d7e'></i></div>`,
`<div class='rv2'><b>正面</b><b>悬停显示</b></div>`,
`<div class='fr'><i class='th'></i></div>`][n-1],'马赛克聚焦 圆形揭示 点击放大'],
['滚动特效',n=>[
`<div class='spb'><i></i><div class='scr'>${[...Array(6)].map((_,i)=>`<p>第 ${i+1} 段文字</p>`).join('')}</div></div>`,
`<div class='scr rvb'>${[...Array(6)].map((_,i)=>`<p>第 ${i+1} 项</p>`).join('')}</div>`,
`<div class='od'>${[2,0,4,8].map(d=>`<b><i style='--d:${d}'>${[...Array(10)].map((_,k)=>k).join('<br>')}</i></b>`).join('')}</div>`][n-1],'滚动进度 滚动淡入 数字翻牌'],
['图标动画',n=>[
`<button class='ic2'><svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M4 12.5l5 5L20 6' pathLength='1'/></svg></button>`,
`<svg class='ht2' width='42' height='42' viewBox='0 0 24 24' stroke='#ff4d7e' stroke-width='2' stroke-linejoin='round'><path d='M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z' pathLength='1'/></svg>`,
`<button class='pls'><i></i><i></i></button>`,
`<button class='ic2 cv'><svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg></button>`][n-1],'对勾切换 心形描边 加号变叉 箭头翻转'],
['表单校验',n=>[
`<div class='vd'><input placeholder='邮箱'><small>请输入邮箱</small></div>`,
`<div class='pw'><input placeholder='输入密码'><div><i></i><i></i><i></i><i></i></div></div>`,
`<div class='pw eye'><input type='password' value='abc12345'><button>显示</button></div>`,
`<div class='vd sbm'><input placeholder='用户名'><button>提交</button></div>`][n-1],'邮箱校验 密码强度 显示密码 空值抖动'],
['页头与回顶',n=>[
`<div class='scr hdr'><b class='hd'>页面标题</b>${[...Array(6)].map((_,i)=>`<p>第 ${i+1} 段文字</p>`).join('')}</div>`,
`<div class='scr tp'>${[...Array(8)].map((_,i)=>`<p>第 ${i+1} 段文字</p>`).join('')}<button class='up2'>↑</button></div>`][n-1],'吸顶收缩 回到顶部'],
['开关与滑块',n=>[
`<div class='rb'><output>50</output><input class='rg' type='range' value='50'></div>`,
`<input class='rg hue' type='range' value='60'>`,
`<label class='xo'><input type='checkbox'><b></b></label>`,
`<button class='lt'><i></i></button>`,
`<div class='kn'><i></i><b>0</b></div>`,
`<div style='width:100%'><input class='rg' type='range' min='0' max='4' step='1' value='2'><div class='tkl'><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div></div>`][n-1],'气泡滑块 渐变滑块 勾叉开关 加载开关 旋钮 刻度滑块'],
['按钮点击反馈',n=>[
`<button class='bk'>点击回弹</button>`,
`<button class='bk rx'>光环扩散</button>`,
`<button class='bk hold'><span>长按确认</span></button>`,
`<button class='bk snd'><b>▶</b> 发送</button>`,
`<button class='bk cdb'>获取验证码</button>`][n-1],'点击回弹 光环扩散 长按确认 发送飞出 验证码倒计时'],
['3D 效果',n=>[
`<div class='pr'><div class='cube'><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i></div></div>`,
`<div class='pr'><div class='ring3'>${[...Array(6)].map((_,k)=>`<i style='transform:rotateY(${k*60}deg) translateZ(52px);background:hsl(${k*50+250} 70% 60%)'></i>`).join('')}</div></div>`,
`<div class='pr'><div class='lay'><i></i><i></i><i></i></div></div>`,
`<div class='sp3'></div>`,
`<div class='pr'><div class='coin'><i>正</i><i>反</i></div></div>`][n-1],'立方体 旋转木马 层叠悬浮 滚动球体 翻转硬币'],
['小工具与小游戏',n=>[
`<button class='bk sw3'>00:00.0</button>`,
`<div class='fc'>${['★','♥','◆','●'].map(c=>`<i><b>${c}</b></i>`).join('')}</div>`,
`<div class='ttt'>${[...Array(9)].map(()=>'<i></i>').join('')}</div>`,
`<button class='dice'>⚀</button>`,
`<div class='tmw'><div class='tmr'></div><b class='tmn'></b></div>`][n-1],'秒表 点击翻牌 井字棋 掷骰子 倒计时环'],
['更多文字特效',n=>[
`<b class='sh'>文字扫光</b>`,
`<b class='fx' data-sp>翻转文字</b>`,
`<b class='scm' data-sc='DECODE'>DECODE</b>`,
`<svg class='stx' width='130' height='44'><text x='4' y='34'>Hello</text></svg>`][n-1],'文字扫光 逐字翻转 乱码解码 描边书写'],
['光标与指针',n=>[
`<div class='cur' data-fx='1'>移到这里</div>`,
`<div class='xh' data-fx='1'>十字准星</div>`,
`<div class='glt' data-fx='1'>光晕文字</div>`][n-1],'自定义光标 十字准星 光晕文字'],
['视差与倾斜',n=>[
`<div class='pz' data-fx='1'>悬停倾斜</div>`,
`<div class='plx' data-fx='1'><i style='--k:1;left:12%;top:20%;width:30px;height:30px;background:#6c4dff'></i><i style='--k:2;left:50%;top:50%;width:20px;height:20px;background:#19c3b1'></i><i style='--k:3;left:78%;top:24%;width:14px;height:14px;background:#ffc64d'></i></div>`][n-1],'悬停倾斜 视差光斑'],
['徽章与标签',n=>[
`<span class='bdg'>新功能</span>`,
`<span class='tg'>标签</span>`,
`<span class='sp4'>★</span>`,
`<span class='cnt'>3</span>`][n-1],'闪光徽章 填充标签 闪烁星星 计数弹跳'],
['进度与骨架',n=>[
`<div class='seg'><i style='--k:0'></i><i style='--k:1'></i><i style='--k:2'></i><i style='--k:3'></i></div>`,
`<div class='wv'></div>`,
`<div class='skc'><i style='width:60%'></i><i></i><i style='width:80%'></i></div>`][n-1],'分段进度 水波进度 骨架卡片'],
['完整小组件',n=>[
`<div class='tmr2'><b class='tm2'>25:00</b><button class='tmb'>开始</button></div>`,
`<div class='td'><div class='tdi'><input placeholder='添加任务'><button class='tda'>+</button></div><ul class='tdl'><li class='done'>写代码</li><li>喝水</li></ul></div>`,
`<div class='wx' data-i='0'><small>北京 · 晴</small><b class='wxt'>24°</b><div class='wxi'>☀️</div></div>`,
`<div class='mp'><div class='mpd'></div><div><b>夜色</b><small>已暂停</small></div><div class='mpbar'><i></i></div><button class='mpx'>▶</button></div>`,
`<div class='lg'><b>欢迎回来</b><input placeholder='邮箱'><input type='password' placeholder='密码'><button class='lgb'>登录</button></div>`,
`<div class='calc'><output class='cout'>0</output><div class='cg'>${['C','÷','×','-','7','8','9','+','4','5','6','=','1','2','3','0'].map(k=>`<button>${k}</button>`).join('')}</div></div>`][n-1],'番茄计时 待办清单 天气卡片 音乐播放 登录表单 简易计算器'],
['实用小组件',n=>[
`<div class='cal'>${'日一二三四五六'.split('').map(d=>`<i style='pointer-events:none;font-weight:700;color:var(--mute);font-size:11px'>${d}</i>`).join('')}${'<i style=pointer-events:none></i>'.repeat(4)}${[...Array(31)].map((_,i)=>`<i class='${i===9?'on':''}'>${i+1}</i>`).join('')}</div>`,
`<div class='cdn'><div class='cdu'><b>00</b><small>天</small></div><div class='cdu'><b>00</b><small>时</small></div><div class='cdu'><b>00</b><small>分</small></div><div class='cdu'><b>00</b><small>秒</small></div></div>`,
`<div class='cart'><div class='ci' data-p='299'><b>无线耳机</b><div class='qty'><button>-</button><b class='qn'>1</b><button>+</button></div><span>¥299</span></div><div class='ci' data-p='99'><b>保温杯</b><div class='qty'><button>-</button><b class='qn'>1</b><button>+</button></div><span>¥99</span></div><div class='ct2'><span>合计</span><b class='tot'>¥398</b></div><button class='ckb'>结算</button></div>`,
`<div class='chat'><div class='msgs'><p class='you'>在吗？</p><p class='me'>想看看这些组件</p></div><div class='inp2'><input placeholder='输入消息'><button>发送</button></div></div>`,
`<ul class='fls'><li><i>📄</i><span>报告.pdf</span><em>2.1MB</em></li><li><i>🖼️</i><span>封面.png</span><em>860KB</em></li><li><i>🎬</i><span>演示.mp4</span><em>48MB</em></li></ul>`,
`<div class='pf'><div class='pfa'>小</div><b>小林</b><small>设计师 · 上海</small><div class='pfs'><span><b>128</b>作品</span><span><b>2.3k</b>关注者</span></div><button class='pfb'>关注</button></div>`,
`<div class='rvl'><div class='rvi'><b>小王</b> <span>★★★★★</span><p>交互很顺，动效很舒服。</p><button class='hlp'>有用 0</button></div><div class='rvi'><b>阿杰</b> <span>★★★★☆</span><p>组件多，挑着用就行。</p><button class='hlp'>有用 0</button></div></div>`,
`<div class='sr'><input class='sri' placeholder='搜索组件，如 按钮'><ul class='srl'></ul></div>`][n-1],'日历 倒计时 购物车 聊天气泡 文件列表 个人资料 评论点赞 搜索结果'],
['完整界面',n=>[
`<div class='wz' data-s='0'><div class='wzs'><i class='on'></i><i></i><i></i></div><p class='wzt'>第 1 步：填写姓名</p><input placeholder='姓名'><div class='wzb'><button class='wzp'>上一步</button><button class='wzn'>下一步</button></div></div>`,
`<label class='upv'><input type='file' accept='image/*'><span>点击选择图片</span></label>`,
`<div class='sch'><div class='schh'>今天 · 10 月 10 日</div><div class='schi'><span>09:00</span><b>晨会</b></div><div class='schi done'><span>11:00</span><b>设计评审</b></div><div class='schi'><span>15:00</span><b>写文档</b></div></div>`,
`<ul class='pl'><li class='on'><i>1</i><span>夜色</span><em>3:42</em></li><li><i>2</i><span>晨光</span><em>4:10</em></li><li><i>3</i><span>海风</span><em>2:58</em></li></ul>`,
`<div class='rg2'><b>创建账号</b><div class='ag'><label><input type='radio' name='rgt' checked> 个人</label><label><input type='radio' name='rgt'> 团队</label></div><input placeholder='昵称'><input placeholder='邮箱'><label class='agr'><input type='checkbox'> 我同意服务条款</label><button class='rgb' disabled>注册</button></div>`][n-1],'多步向导 图片上传 日程表 播放列表 注册表单'],
['更多界面',n=>[
`<div class='pt2'><div class='ptg'><button class='on' data-k='m'>月付</button><button data-k='y'>年付</button></div><b class='ptp'>¥29</b><small>每月</small></div>`,
`<div class='slk'><button class='slkb'>›</button><span>滑动解锁</span></div>`,
`<div class='dtc'>${['周一','周二','周三','周四','周五'].map((d,i)=>`<i class='${i===1?'on':''}'><small>${d}</small><b>${i+6}</b></i>`).join('')}</div>`,
`<div class='tgi'><span class='tgc'>设计<button>×</button></span><span class='tgc'>前端<button>×</button></span><input placeholder='输入后按回车'></div>`][n-1],'价格切换 滑动解锁 日期选择 标签输入'],
['按钮组合',n=>{const k=n-1,E=k%6+1,C=Math.floor(k/6)%6,S=Math.floor(k/36)%4,Z=Math.floor(k/144)%2,COL=['#6c4dff','#19c3b1','#ff4d7e','#ffc64d','#ff7a59','#15a37b'],DK=['#3f24d6','#0f8f7f','#c4245a','#d99a1a','#c85a3b','#0d6e52'],RAD=['0','6px','20px','99px'];return `<button class='mxb' data-e='${E}' style='--c:${COL[C]};--d:${DK[C]};border-radius:${RAD[S]};${Z?'padding:12px 22px;font-size:15px':'padding:6px 10px;font-size:11px'}'>按钮</button>`},Array.from({length:288},(_,k)=>'#'+(k+1)).join(' ')],
['动效组合',n=>{const k=n-1,M=k%16+1,D=[.8,1.6,3.2][Math.floor(k/16)%3],E=['linear','ease-in-out','cubic-bezier(.34,1.56,.64,1)'][Math.floor(k/48)%3],S=Math.floor(k/144)%2,COL=['#6c4dff','#19c3b1','#ff4d7e','#ffc64d','#ff7a59','#15a37b'];return `<div class='mvs'><i class='mvb' style='animation:mv${M} ${D}s ${E} infinite alternate;border-radius:${S?'50%':'10px'};background:${COL[M%6]}'></i></div>`},Array.from({length:288},(_,k)=>'#'+(k+1)).join(' ')],
['常用完整组件',n=>[
`<div class='cmk'><input class='cmi' placeholder='输入命令或搜索…（Ctrl/⌘ + K）'><div class='cml'></div><div class='cmh'>↑↓ 选择 · 回车执行 · 最近使用优先</div></div>`,
`<div class='ba' style='--bp:50%'><div class='bas'></div><div class='ba0'><div class='bas'></div><em>处理前</em></div><em class='bar'>处理后</em><i class='bah'></i></div>`,
`<div class='es'><div class='est'><button>空列表</button><button>无结果</button><button>404</button><button>断网</button><button>成功</button></div><div class='esv'></div></div>`,
`<div class='dtb'><div class='dtt'><input class='dtq' placeholder='筛选名称或状态'><span class='dts'></span></div><div class='dtw'><table><thead><tr><th><input type='checkbox' class='dta'></th><th data-k='n'>名称<i></i></th><th data-k='s'>状态<i></i></th><th data-k='a'>金额<i></i></th></tr></thead><tbody></tbody></table></div><div class='dtp'></div></div>`,
`<div class='otp'><div class='oti'>${'<input inputmode=numeric maxlength=1>'.repeat(6)}</div><small class='otm'>演示验证码 123456</small></div>`,
`<div class='drp'><div class='drh'><button data-d='-1'>‹</button><span class='drt'></span><button data-d='1'>›</button></div><div class='drg'></div><div class='drs'></div></div>`,
`<div class='swl'>${['系统通知','小林的消息','周报提醒'].map(t=>`<div class='swi'><div class='swa'><button class='swp'>置顶</button><button class='swd'>删除</button></div><div class='swc'><span>${t}</span><small>← 左滑</small></div></div>`).join('')}</div>`][n-1],'命令面板 前后对比 空状态组 数据表格 验证码输入 日期范围 左滑列表']
].map(([t,f,l],gi)=>{const a=l.split(' ');return `<h3 id='g-${gi}'>${t}<small>${a.length}</small></h3><div class='gg'>${a.map((s,i)=>`<div class='cell'>${f(i+1)}<span class='lbl'>${s}</span></div>`).join('')}</div>`}).join('');
document.querySelectorAll("[data-t='4'],[data-t='9']").forEach(e=>e.innerHTML=[...e.textContent].map((c,i)=>`<s style='--d:${i*.12}s'>${c}</s>`).join(''));
gal.onpointermove=e=>{const c=e.target.closest('.cd2');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}};
gal.addEventListener('pointermove',e=>{const m=e.target.closest('.ms');if(!m)return;const r=m.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 m.style.setProperty('--mx',x+'px');m.style.setProperty('--my',y+'px');m.style.setProperty('--px',(x/r.width-.5)*2);m.style.setProperty('--py',(y/r.height-.5)*2);
 if(m.dataset.m==='7'){const d=document.createElement('i');d.className='tr';d.style.left=x+'px';d.style.top=y+'px';m.append(d);d.onanimationend=()=>d.remove()}});
gal.addEventListener('click',e=>{const m=e.target.closest('.ms');
 if(m){const r=m.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(m.dataset.m==='6'){const s=document.createElement('span');s.className='rp';s.style.left=x+'px';s.style.top=y+'px';m.append(s);s.onanimationend=()=>s.remove()}
  if(m.dataset.m==='8')for(let i=0;i<14;i++){const p=document.createElement('i'),a=i/14*6.283,d=30+Math.random()*30;p.className='pt';p.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;background:${['#ff4d7e','#ffc64d','#19c3b1','#6c4dff'][i%4]}`;m.append(p);p.onanimationend=()=>p.remove()}}
 const nb=e.target.closest('.nv a');if(nb)nb.parentNode.querySelectorAll('a').forEach(a=>a.classList.toggle('on',a===nb));
 const sg=e.target.closest('.sg button');if(sg){const p=sg.parentNode,bs=[...p.children];bs.forEach(b=>b.classList.toggle('on',b===sg));p.style.setProperty('--i',bs.indexOf(sg))}
 const nm=e.target.closest('.nm button');if(nm){const b=nm.parentNode.querySelector('b');b.textContent=Math.max(0,+b.textContent+(nm.textContent==='+'?1:-1));b.style.animation='none';b.offsetWidth;b.style.animation=''}});
// 三期交互
let dg2;
gal.addEventListener('click',e=>{const t=e.target;
 const dl=t.closest('.dl li');if(dl)dl.classList.add('gone');
 const so=t.closest('.so');if(so)so.classList.toggle('d');
 const cs=t.closest('.cs span');if(cs)cs.classList.toggle('on');
 const one=t.closest('.cal i,.sw2 i');if(one)[...one.parentNode.children].forEach(c=>c.classList.toggle('on',c===one));
 const pg=t.closest('.pg button');if(pg){const p=pg.parentNode,bs=[...p.children];bs.forEach(b=>b.classList.toggle('on',b===pg));p.style.setProperty('--i',bs.indexOf(pg))}
 const lc=t.closest('.lc');if(lc){const s=lc.querySelector('span'),on=lc.classList.toggle('on');s.textContent=+s.textContent+(on?1:-1)}
 const cp=t.closest('.cp');if(cp){cp.textContent='已复制';cp.classList.add('on');setTimeout(()=>{cp.textContent='复制链接';cp.classList.remove('on')},1400)}});
gal.addEventListener('dragstart',e=>{dg2=e.target.closest('.dr li');if(dg2){dg2.classList.add('dg');e.dataTransfer.effectAllowed='move'}});
gal.addEventListener('dragover',e=>{const li=e.target.closest('.dr li');if(!dg2||!li||li===dg2)return;e.preventDefault();const r=li.getBoundingClientRect();li.parentNode.insertBefore(dg2,e.clientY<r.top+r.height/2?li:li.nextSibling)});
gal.addEventListener('dragend',()=>{if(dg2)dg2.classList.remove('dg');dg2=null});
// 四期交互
gal.querySelectorAll('.rvb').forEach(b=>{const io=new IntersectionObserver(es=>es.forEach(en=>en.target.classList.toggle('in',en.isIntersecting)),{root:b,threshold:.6});b.querySelectorAll('p').forEach(p=>io.observe(p))});
gal.addEventListener('scroll',e=>{const s=e.target;if(!s.classList||!s.classList.contains('scr'))return;
 s.parentNode.style.setProperty('--s',s.scrollTop/Math.max(1,s.scrollHeight-s.clientHeight));
 if(s.classList.contains('hdr'))s.classList.toggle('sm',s.scrollTop>12);
 if(s.classList.contains('tp'))s.classList.toggle('show',s.scrollTop>30)},true);
gal.addEventListener('click',e=>{const t=e.target;
 const f=t.closest('.fr>button,.fab b,.th');if(f){const fr=f.closest('.fr');fr.classList.toggle('open');if(fr.dataset.auto)setTimeout(()=>fr.classList.remove('open'),1600)}
 const ic=t.closest('.ic2');if(ic)ic.classList.toggle('on');
 const ey=t.closest('.eye button');if(ey){const i=ey.parentNode.querySelector('input'),sh=i.type==='password';i.type=sh?'text':'password';ey.textContent=sh?'隐藏':'显示'}
 const sb2=t.closest('.sbm button');if(sb2){const v=sb2.parentNode;if(!v.querySelector('input').value){v.classList.remove('bad');v.offsetWidth;v.classList.add('bad')}}
 const up=t.closest('.up2');if(up)up.closest('.scr').scrollTo({top:0,behavior:'smooth'})});
gal.addEventListener('input',e=>{const i=e.target,v=i.value;
 const vd=i.closest('.vd');if(vd){if(vd.classList.contains('sbm'))vd.classList.remove('bad');else{const sm=vd.querySelector('small'),ok=/^\S+@\S+\.\S+$/.test(v);vd.classList.toggle('ok2',ok);vd.classList.toggle('bad',!!v&&!ok);sm.textContent=ok?'格式正确':v?'邮箱格式不对':'请输入邮箱'}}
 const pw=i.closest('.pw');if(pw)pw.dataset.l=[v.length>=6,/[A-Z]/.test(v),/\d/.test(v),/\W/.test(v)].filter(Boolean).length});
// 五期交互
gal.addEventListener('input',e=>{const i=e.target;if(!i.classList.contains('rg'))return;const pc=(i.value-i.min)/(i.max-i.min);i.style.setProperty('--pc',pc);const o=i.parentNode.querySelector('output');if(o){o.textContent=i.value;i.parentNode.style.setProperty('--pc',pc)}});
gal.querySelectorAll('.rg').forEach(i=>i.dispatchEvent(new Event('input',{bubbles:true})));
gal.querySelectorAll('[data-sp]').forEach(e=>e.innerHTML=[...e.textContent].map((c,i)=>`<s style='--d:${i*.06}s'>${c}</s>`).join(''));
let sw0=0,swT=0,swR=0,hT;
const swTick=()=>{const t=swT+performance.now()-sw0,el=gal.querySelector('.sw3');el.textContent=String(t/60000|0).padStart(2,'0')+':'+String(t/1000%60|0).padStart(2,'0')+'.'+(t/100%10|0);swR=requestAnimationFrame(swTick)};
const WL=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
gal.addEventListener('click',e=>{const q=e.target;
 const bk=q.closest('.rx,.snd');if(bk){bk.classList.remove('go');bk.offsetWidth;bk.classList.add('go')}
 const lt=q.closest('.lt');if(lt&&!lt.classList.contains('busy')){lt.classList.add('busy');setTimeout(()=>{lt.classList.remove('busy');lt.classList.toggle('on')},900)}
 const cd=q.closest('.cdb');if(cd&&!cd.disabled){let n=5;cd.disabled=true;cd.textContent=n+' 秒后重试';const iv=setInterval(()=>{if(--n)cd.textContent=n+' 秒后重试';else{clearInterval(iv);cd.disabled=false;cd.textContent='获取验证码'}},1000)}
 const s3=q.closest('.sw3');if(s3){if(swR){cancelAnimationFrame(swR);swT+=performance.now()-sw0;swR=0}else{sw0=performance.now();swTick()}}
 const fc=q.closest('.fc i');if(fc)fc.classList.toggle('on');
 const ds=q.closest('.dice');if(ds){ds.classList.remove('roll');ds.offsetWidth;ds.classList.add('roll');setTimeout(()=>ds.textContent='⚀⚁⚂⚃⚄⚅'[Math.random()*6|0],300)}
 const tt=q.closest('.ttt i');if(tt&&!tt.textContent&&!tt.parentNode.dataset.end){const g=tt.parentNode,c=[...g.children],x=g.dataset.o!=='1';tt.textContent=x?'X':'O';tt.className=x?'x':'o';g.dataset.o=x?'1':'0';
  const w=WL.find(l=>l.every(k=>c[k].textContent===tt.textContent));
  if(w||c.every(k=>k.textContent)){if(w)w.forEach(k=>c[k].classList.add('w'));g.dataset.end=1;setTimeout(()=>{c.forEach(k=>{k.textContent='';k.className=''});delete g.dataset.end;g.dataset.o='0'},1500)}}});
gal.addEventListener('pointerdown',e=>{const k=e.target.closest('.kn');if(k){k.setPointerCapture(e.pointerId);k.dn=1}
 const h=e.target.closest('.hold');if(h&&!h.classList.contains('ok')){h.classList.add('hd');clearTimeout(hT);hT=setTimeout(()=>{h.classList.add('ok');h.firstChild.textContent='已确认';setTimeout(()=>{h.classList.remove('hd','ok');h.firstChild.textContent='长按确认'},1300)},1000)}});
gal.addEventListener('pointermove',e=>{const k=e.target.closest('.kn');if(!k||!k.dn)return;const r=k.getBoundingClientRect();let a=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI+90;if(a>180)a-=360;a=Math.max(-135,Math.min(135,a));k.style.setProperty('--ka',a+'deg');k.querySelector('b').textContent=Math.round((a+135)/2.7)});
const rel=e=>{const k=e.target.closest('.kn');if(k)k.dn=0;const h=gal.querySelector('.hold');if(h&&!h.classList.contains('ok')){clearTimeout(hT);h.classList.remove('hd')}};
gal.addEventListener('pointerup',rel);gal.addEventListener('pointercancel',rel);
gal.addEventListener('pointerover',e=>{const s=e.target.closest('[data-sc]');if(!s||s.contains(e.relatedTarget))return;const w=s.dataset.sc;let n=0;clearInterval(s.t);s.t=setInterval(()=>{s.textContent=[...w].map((c,i)=>i<n?c:'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'[Math.random()*34|0]).join('');clearInterval(s.t)},70)});
// 六期交互
gal.addEventListener('pointermove',e=>{const c=e.target.closest('[data-fx]');if(!c)return;const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;c.style.setProperty('--cx',x+'px');c.style.setProperty('--cy',y+'px');c.style.setProperty('--fx',x/r.width);c.style.setProperty('--fy',y/r.height)});
gal.addEventListener('pointerout',e=>{const c=e.target.closest('.pz,.plx');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--fx',.5);c.style.setProperty('--fy',.5)}});
gal.addEventListener('click',e=>{const cn=e.target.closest('.cnt');if(cn){cn.textContent=+cn.textContent+1;cn.classList.remove('bump');cn.offsetWidth;cn.classList.add('bump')}});
// 七期交互
gal.addEventListener('click',e=>{const q=e.target;
 const tb=q.closest('.tmb');if(tb){const w=tb.parentNode,d=w.querySelector('.tm2');
  if(w.iv){clearInterval(w.iv);w.iv=0;tb.textContent='继续';return}
  if(w.s===undefined)w.s=1500;tb.textContent='暂停';
  const show=()=>{const s=Math.max(0,w.s);d.textContent=String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
  show();w.iv=setInterval(()=>{w.s--;show();if(w.s<=0){clearInterval(w.iv);w.iv=0;tb.textContent='再来一次';w.s=1500}},1000)}
 const ta=q.closest('.tda');if(ta){const inp=ta.parentNode.querySelector('input'),v=inp.value.trim();if(v){const li=document.createElement('li');li.textContent=v;ta.parentNode.parentNode.querySelector('.tdl').append(li);inp.value=''}}
 const tl=q.closest('.tdl li');if(tl)tl.classList.toggle('done');
 const wx=q.closest('.wx');if(wx){const W=[['☀️','24°','晴'],['☁️','19°','多云'],['🌧️','16°','小雨']],i=((+wx.dataset.i||0)+1)%3;wx.dataset.i=i;wx.querySelector('.wxi').textContent=W[i][0];wx.querySelector('.wxt').textContent=W[i][1];wx.querySelector('small').textContent='北京 · '+W[i][2]}
 const mx=q.closest('.mpx');if(mx){const m=mx.closest('.mp'),on=m.classList.toggle('play');mx.textContent=on?'❚❚':'▶';m.querySelector('small').textContent=on?'正在播放':'已暂停'}
 const lb=q.closest('.lgb');if(lb&&!lb.dataset.b){lb.dataset.b=1;lb.textContent='登录中…';setTimeout(()=>{lb.classList.add('ok');lb.textContent='登录成功 ✓';setTimeout(()=>{lb.classList.remove('ok');lb.textContent='登录';delete lb.dataset.b},1500)},1200)}
 const cal=q.closest('.calc');if(cal&&q.tagName==='BUTTON'){const k=q.textContent,o=cal.querySelector('.cout'),st=cal.st||(cal.st={a:null,op:null,cur:'0',f:1});
  const ap=(a,b,op)=>op==='+'?a+b:op==='-'?a-b:op==='×'?a*b:(b?a/b:0);
  if(/[0-9]/.test(k)){st.cur=st.f?k:(st.cur==='0'?k:st.cur+k);st.f=0}
  else if(k==='C'){st.a=null;st.op=null;st.cur='0';st.f=1}
  else if(k==='='){if(st.op){st.cur=String(+ap(st.a,+st.cur,st.op).toFixed(6));st.op=null;st.f=1}}
  else{if(st.op&&!st.f)st.a=ap(st.a,+st.cur,st.op);else st.a=+st.cur;st.cur=String(st.a);st.op=k;st.f=1}
  o.textContent=st.cur}
});
// 八期交互
const cdT=new Date('2026-12-31T00:00:00').getTime(),cdU=[86400000,3600000,60000,1000];
const cdTick=()=>document.querySelectorAll('.cdn').forEach(el=>{let r=Math.max(0,cdT-Date.now());el.querySelectorAll('.cdu b').forEach((b,i)=>{const v=Math.floor(r/cdU[i]);r%=cdU[i];b.textContent=String(v).padStart(2,'0')})});
cdTick();setInterval(cdTick,1000);
gal.addEventListener('click',e=>{const q=e.target;
 const qb=q.closest('.qty button');if(qb){const ci=qb.closest('.ci'),n=ci.querySelector('.qn');n.textContent=Math.max(1,+n.textContent+(qb.textContent==='+'?1:-1));const cart=ci.closest('.cart');let t=0;cart.querySelectorAll('.ci').forEach(c=>t+=c.dataset.p*c.querySelector('.qn').textContent);cart.querySelector('.tot').textContent='¥'+t}
 const ck=q.closest('.ckb');if(ck){ck.textContent='已下单 ✓';ck.classList.add('ok');setTimeout(()=>{ck.textContent='结算';ck.classList.remove('ok')},1500)}
 const sb2=q.closest('.inp2 button');if(sb2){const ch=sb2.closest('.chat'),inp=ch.querySelector('input'),v=inp.value.trim(),ms=ch.querySelector('.msgs');if(v){const p=document.createElement('p');p.className='me';p.textContent=v;ms.append(p);inp.value='';ms.scrollTop=ms.scrollHeight;setTimeout(()=>{const r=document.createElement('p');r.className='you';r.textContent='收到：'+v;ms.append(r);ms.scrollTop=ms.scrollHeight},700)}}
 const fl=q.closest('.fls li');if(fl&&!fl.dataset.dl){fl.dataset.dl=1;let pr=0;const iv=setInterval(()=>{pr+=10;fl.style.setProperty('--pr',pr+'%');if(pr>=100){clearInterval(iv);fl.querySelector('em').textContent='已下载'}},120)}
 const pb=q.closest('.pfb');if(pb){const on=pb.classList.toggle('on');pb.textContent=on?'已关注':'关注'}
 const hp=q.closest('.hlp');if(hp){const on=hp.classList.toggle('on');hp.textContent='有用 '+(+hp.textContent.slice(3)+(on?1:-1))}
});
gal.addEventListener('input',e=>{const i=e.target.closest('.sri');if(!i)return;const v=i.value.trim(),ul=i.parentNode.querySelector('.srl'),names=['按钮','卡片','加载动画','弹窗','导航','表单','图表','动画背景'];const r=names.filter(n=>n.includes(v));ul.innerHTML=!v?'':(r.length?r.map(n=>`<li>${n.replace(v,'<mark>'+v+'</mark>')}</li>`).join(''):'<li class=none>没有结果</li>')});
// 九期交互
gal.querySelectorAll('.cell').forEach(c=>c.insertAdjacentHTML('beforeend',`<button class='cb2' title='查看代码' aria-label='查看代码'>&lt;/&gt;</button>`));
document.querySelectorAll('.grid .box').forEach(b=>b.insertAdjacentHTML('beforeend',`<button class='cb2' title='查看代码' aria-label='查看代码'>&lt;/&gt; 代码</button>`));
let CSS_SRC=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n'),cssBlocked=false,CSS_PARSED=null;
if(!CSS_SRC)document.querySelectorAll('link[rel=stylesheet]').forEach(l=>fetch(l.href).then(r=>r.text()).then(t=>{CSS_SRC+=t;CSS_PARSED=null}).catch(()=>{cssBlocked=true}));
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const parseCSS=s=>{s=s.replace(/\/\*[\s\S]*?\*\//g,'');const out=[],n=s.length;let i=0;
 while(i<n){const j=s.indexOf('{',i);if(j<0)break;const head=s.slice(i,j).trim();let d=1,k=j+1;while(k<n&&d){const ch=s[k];if(ch==='{')d++;else if(ch==='}')d--;k++}
  const body=s.slice(j+1,k-1);
  if(/^@(media|supports)/.test(head))parseCSS(body).forEach(r=>out.push({...r,media:head}));
  else if(/^@keyframes/.test(head))out.push({t:'kf',name:head.replace(/^@keyframes\s+/,'').trim(),text:head+'{'+body.trim()+'}'});
  else if(/^@property/.test(head))out.push({t:'prop',name:head.replace(/^@property\s+/,'').trim(),text:head+'{'+body.trim()+'}'});
  else out.push({t:'rule',sel:head,body,text:head+'{'+body.trim()+'}'});
  i=k}
 return out};
const splitSel=s=>{const o=[];let d=0,c='';for(const ch of s){if(ch==='('||ch==='[')d++;if(ch===')'||ch===']')d--;if(ch===','&&!d){o.push(c.trim());c=''}else c+=ch}o.push(c.trim());return o};
const noPs=s=>s.replace(/:not\([^)]*:(?:hover|focus|active|checked|disabled)[^)]*\)/g,'').replace(/::?(?:before|after|placeholder|-webkit-[\w-]+|-moz-[\w-]+)/g,'').replace(/:(?:hover|focus-within|focus-visible|focus|active|checked|disabled)/g,'');
const PAGE_ONLY=/^(?:\.cell|\.cb2|\.cbox|\.cbx|\.cpy|\.cc|#gal|\.gg|\.grid|\.box|\.wrap|:root|html|body|\*|\.lead|h1)/;
const hit=(els,s)=>{s=noPs(s).trim();if(!s||PAGE_ONLY.test(s))return false;try{return els.some(e=>e.matches(s)||e.querySelector(s))}catch(_){return false}};
const BASE='*{box-sizing:border-box}\nbody{margin:0;padding:24px;background:#eef0f8;color:#6b6d8f;font:12px/1.6 "Avenir Next","PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;text-align:center}';
const STATE=['on','open','ok','bad','go','gone','done','show','sm','dg','in','busy','play','hd','hi','x','o','w','s','r','e'];
const srcOf=cell=>{
 if(!CSS_PARSED)CSS_PARSED=parseCSS(CSS_SRC);const P=CSS_PARSED.filter(r=>!r.media);
 const kids=[...cell.children].filter(c=>!c.matches('.lbl,.cb2,.cbox,h2')),html=kids.map(k=>k.outerHTML).join('\n');
 const sty=P.filter(r=>r.t==='rule'&&splitSel(r.sel).some(s=>hit(kids,s)));
 const kf=new Map(),prop=new Map();P.forEach(r=>{if(r.t==='kf')kf.set(r.name,r);else if(r.t==='prop')prop.set(r.name,r)});
 const text=sty.map(r=>r.text).join('\n');
 const names=new Set();((text+'\n'+html).match(/animation(?:-name)?\s*:[^;}"']*/g)||[]).forEach(a=>a.split(/[\s,:]+/).forEach(w=>{if(kf.has(w))names.add(w)}));
 const kfText=[...names].map(n=>kf.get(n).text).join('\n');
 const used=new Set(((text+'\n'+kfText).match(/var\(--[\w-]+/g)||[]).map(v=>v.slice(6)));
 const rootRule=P.find(r=>r.t==='rule'&&r.sel===':root'),tv={};
 if(rootRule)for(const m of rootRule.body.matchAll(/--([\w-]+)\s*:\s*([^;]+)/g))tv[m[1]]=m[2].trim();
 const tokens=[...used].filter(n=>tv[n]).map(n=>'--'+n+':'+tv[n]);
 const props=[...used].filter(n=>prop.has('--'+n)).map(n=>prop.get('--'+n).text);
 const els=kids.flatMap(k=>[k,...k.querySelectorAll('*')]),tok=new Set();
 els.forEach(e=>{e.classList.forEach(c=>{if(c.length>1&&!STATE.includes(c))tok.add('.'+c)});if(e.id)tok.add('#'+e.id);for(const a of e.attributes)if(a.name.startsWith('data-'))tok.add('['+a.name+(a.value?"='"+a.value+"'":''))});
 const SRC=__MAIN.toString(),jsTok=[...tok].filter(t=>{if(t[0]==='['){const m=t.match(/^\[([\w-]+)(?:='(.*)')?$/),nm=m[1],v=m[2];return new RegExp('\\['+nm+'\\]').test(SRC)||(v!==undefined&&SRC.includes('['+nm+"='"+v+"'"))||(nm.length>7&&new RegExp('dataset\\.'+nm.slice(5)+'(?![\\w-])').test(SRC))}return new RegExp('[.#\\['+']'+t.slice(1)+'(?![\\w-])').test(SRC)});
 const note=(jsTok.length?'<!-- 注意：这个组件（或同类组件）可能有 JavaScript 交互，下面只有 HTML 和 CSS（外观）。JS 在 js/main.js 里，可搜索：'+jsTok.join('  ')+' -->\n':'')+(cssBlocked&&!sty.length?'<!-- 注意：浏览器禁止读取本地样式表，请用 http 服务器打开（python3 -m http.server），或使用 dist 单文件版 -->\n':'');
 return esc(note+'<style>\n'+BASE+'\n'+(tokens.length?':root{'+tokens.join(';')+'}\n':'')+(props.length?props.join('\n')+'\n':'')+text+(kfText?'\n'+kfText:'')+'\n</style>\n'+html)};
const copyCode=cp=>{const txt=cp.parentNode.querySelector('.cc').textContent;const done=()=>{cp.textContent='已复制 ✓';setTimeout(()=>{cp.textContent='复制'},1500)};const fb=()=>{const ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0';document.body.append(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}ta.remove();ok?done():(cp.textContent='复制失败')};if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(txt).then(done,fb)}else fb()};
const codeClick=e=>{const t=e.target;
 if(t.closest('.cbx')){t.closest('.cbox').remove();return}
 const cb=t.closest('.cb2');if(cb){const cell=cb.closest('.cell,.box'),old=cell.querySelector('.cbox');if(old){old.remove();return}cell.insertAdjacentHTML('beforeend',`<pre class='cbox'><button class='cbx'>×</button><button class='cpy'>复制</button><code class='cc'>${srcOf(cell)}</code></pre>`)}
};
gal.addEventListener('click',codeClick);document.querySelector('.grid').addEventListener('click',codeClick);
document.querySelector('.grid').addEventListener('click',e=>{const cp=e.target.closest('.cpy');if(cp)copyCode(cp)});
gal.addEventListener('click',e=>{const t=e.target;
 const wn=t.closest('.wzn,.wzp');if(wn){const w=wn.closest('.wz');let s=(+w.dataset.s||0)+(wn.classList.contains('wzn')?1:-1);s=Math.max(0,Math.min(2,s));w.dataset.s=s;w.querySelectorAll('.wzs i').forEach((d,k)=>d.classList.toggle('on',k<=s));w.querySelector('.wzt').textContent=['第 1 步：填写姓名','第 2 步：选择套餐','第 3 步：确认提交'][s];w.querySelector('.wzn').textContent=s===2?'完成 ✓':'下一步'}
 const si=t.closest('.schi');if(si)si.classList.toggle('done');
 const pli=t.closest('.pl li');if(pli)pli.parentNode.querySelectorAll('li').forEach(l=>l.classList.toggle('on',l===pli));
 const rb=t.closest('.rgb');if(rb&&!rb.disabled){rb.textContent='注册成功 ✓';rb.classList.add('ok')}
});
gal.addEventListener('change',e=>{const f=e.target;if(!f.matches('.upv input'))return;const file=f.files[0];if(!file)return;const rd=new FileReader();rd.onload=()=>{const lb=f.parentNode;lb.style.backgroundImage=`url(${rd.result})`;lb.classList.add('has')};rd.readAsDataURL(file)});
gal.addEventListener('input',e=>{const rg=e.target.closest('.rg2');if(!rg)return;const ok=[...rg.querySelectorAll('input:not([type])')].every(x=>x.value.trim())&&rg.querySelector('.agr input').checked;rg.querySelector('.rgb').disabled=!ok});
// 十期交互
gal.addEventListener('click',e=>{const t=e.target;
 const cp=t.closest('.cpy');if(cp)copyCode(cp);
 const pk=t.closest('.ptg button');if(pk){const w=pk.closest('.pt2'),y=pk.dataset.k==='y';pk.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===pk));const p=w.querySelector('.ptp');p.textContent=y?'¥24':'¥29';w.querySelector('small').textContent=y?'每月 · 年付省 20%':'每月';p.classList.remove('pop');p.offsetWidth;p.classList.add('pop')}
 const dc=t.closest('.dtc i');if(dc)dc.parentNode.querySelectorAll('i').forEach(x=>x.classList.toggle('on',x===dc));
 const tgb=t.closest('.tgc button');if(tgb)tgb.parentNode.remove();
});
gal.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const i=e.target.closest('.tgi input');if(!i)return;const v=i.value.trim();if(!v)return;const s=document.createElement('span');s.className='tgc';s.innerHTML=esc(v)+'<button>×</button>';i.parentNode.insertBefore(s,i);i.value=''});
gal.addEventListener('pointerdown',e=>{const b=e.target.closest('.slkb');if(!b)return;b.setPointerCapture(e.pointerId);b.sx=e.clientX;b.dr=1;b.style.transition='none'});
gal.addEventListener('pointermove',e=>{const b=e.target.closest('.slkb');if(!b||!b.dr)return;const max=b.parentNode.clientWidth-42;b.dx=Math.max(0,Math.min(max,e.clientX-b.sx));b.style.transform='translateX('+b.dx+'px)'});
const slkEnd=e=>{const b=e.target.closest('.slkb');if(!b||!b.dr)return;b.dr=0;const max=b.parentNode.clientWidth-42;b.style.transition='transform .3s';if(b.dx>=max-4){b.parentNode.classList.add('ok');b.parentNode.querySelector('span').textContent='已解锁 ✓';b.style.transform='translateX('+max+'px)'}else b.style.transform='translateX(0)'};
gal.addEventListener('pointerup',slkEnd);gal.addEventListener('pointercancel',slkEnd);
// 十三期：常用完整组件
const CM=[['新建文档','操作','N'],['打开设置','系统',','],['切换深色模式','外观','D'],['搜索组件','导航','/'],['复制链接','操作','L'],['查看更新日志','帮助',''],['退出登录','账号',''],['邀请成员','团队','I'],['导出 PDF','操作','E'],['快捷键列表','帮助','?']];
let cmRec=[],cmA=0,cmL=[],cmNav=0;
const cmFz=(q,s)=>{let i=0,sc=0,last=-2,out='';for(let j=0;j<s.length;j++){if(i<q.length&&s[j].toLowerCase()===q[i].toLowerCase()){out+='<mark>'+s[j]+'</mark>';sc+=j===last+1?3:1;last=j;i++}else out+=s[j]}return i===q.length?{sc,out}:null};
const cmRender=()=>{const r=gal.querySelector('.cmk'),q=r.querySelector('.cmi').value.trim();
 let L=CM.map(c=>({c,rc:cmRec.indexOf(c[0]),out:c[0],sc:0}));
 if(q)L=L.map(x=>{const f=cmFz(q,x.c[0]);return f?{...x,...f}:null}).filter(Boolean);
 L.sort((a,b)=>q?(b.sc-a.sc||(b.rc>=0)-(a.rc>=0)):((a.rc<0?99:a.rc)-(b.rc<0?99:b.rc)));
 cmL=L.map(x=>x.c);cmA=Math.min(cmA,Math.max(0,L.length-1));
 r.querySelector('.cml').innerHTML=L.map((x,i)=>`<div class='cmx${i===cmA?' on':''}' data-i='${i}'><span>${x.out}</span>${x.rc>=0?'<b class=cmt>最近</b>':''}<em>${x.c[1]}</em>${x.c[2]?'<kbd>'+x.c[2]+'</kbd>':''}</div>`).join('')||'<div class=cmx><span>没有匹配的命令</span></div>';
 const a=r.querySelector('.cmx.on'),bx=r.querySelector('.cml');if(a&&cmNav){const t=a.offsetTop-bx.offsetTop;if(t<bx.scrollTop)bx.scrollTop=t;else if(t+a.offsetHeight>bx.scrollTop+bx.clientHeight)bx.scrollTop=t+a.offsetHeight-bx.clientHeight}};
const cmRun=i=>{const c=cmL[i];if(!c)return;const r=gal.querySelector('.cmk');cmRec=[c[0],...cmRec.filter(x=>x!==c[0])].slice(0,3);r.querySelector('.cmi').value='';r.querySelector('.cmh').textContent='已执行：'+c[0];if(c[0]==='切换深色模式')document.querySelector('#dark').click();cmA=0;cmRender()};
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();const i=gal.querySelector('.cmi');i.scrollIntoView({block:'center',behavior:'smooth'});i.focus()}});
gal.addEventListener('input',e=>{if(e.target.matches('.cmi')){cmA=0;cmRender()}});
gal.addEventListener('keydown',e=>{if(!e.target.matches('.cmi'))return;const n=cmL.length;if(e.key==='ArrowDown'&&n){e.preventDefault();cmA=(cmA+1)%n;cmNav=1;cmRender();cmNav=0}else if(e.key==='ArrowUp'&&n){e.preventDefault();cmA=(cmA-1+n)%n;cmNav=1;cmRender();cmNav=0}else if(e.key==='Enter')cmRun(cmA);else if(e.key==='Escape'){e.target.value='';cmRender()}});
gal.addEventListener('mouseover',e=>{const x=e.target.closest('.cmx[data-i]');if(x&&+x.dataset.i!==cmA){cmA=+x.dataset.i;gal.querySelectorAll('.cmx').forEach(y=>y.classList.toggle('on',y===x))}});
const baSet=(b,e)=>{const r=b.getBoundingClientRect();b.style.setProperty('--bp',Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))+'%')};
gal.addEventListener('pointerdown',e=>{const b=e.target.closest('.ba');if(b){b.setPointerCapture(e.pointerId);b.dr=1;baSet(b,e)}});
gal.addEventListener('pointermove',e=>{const b=e.target.closest('.ba');if(b&&b.dr)baSet(b,e)});
gal.addEventListener('pointerup',e=>{const b=e.target.closest('.ba');if(b)b.dr=0});
const ESD=[[`<path d='M4 13l3-8h10l3 8v6H4zM4 13h5l1 2h4l1-2h5'/>`,'','还没有内容','列表是空的，新建一条试试。','新建'],[`<circle cx='11' cy='11' r='6'/><path d='M16 16l5 5M9 9l4 4M13 9l-4 4'/>`,'','没有找到结果','换个关键词，或者清除筛选条件。','清除筛选'],[null,'','页面走丢了','你访问的页面不存在或已被移动。','回到首页'],[`<path d='M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5v.01M3 3l18 18'/>`,'#ff7a59','网络已断开','请检查网络连接后重试。','重新连接'],[`<circle cx='12' cy='12' r='9'/><path d='M8 12.5l3 3 5-6'/>`,'#15a37b','提交成功','我们已收到你的申请，稍后通知你。','查看详情']];
const esRender=(r,i)=>{const d=ESD[i];r.querySelectorAll('.est button').forEach((b,k)=>b.classList.toggle('on',k===i));r.querySelector('.esv').innerHTML=(d[0]?`<svg class='esi' style='color:${d[1]||'var(--v)'}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'>${d[0]}</svg>`:`<b class='es404'>404</b>`)+`<b class='t'>${d[2]}</b><small>${d[3]}</small><button class='esb'>${d[4]}</button>`};
const DT=Array.from({length:23},(_,i)=>({id:i,n:['设计评审','接口联调','用户访谈','周报整理','性能优化','文案校对','上线检查'][i%7]+' #'+(i+1),s:['进行中','已完成','待处理'][(i*7)%3],a:((i*37)%90+10)*100}));
const dts={q:'',k:'id',d:1,pg:0,sel:new Set(),cur:[]},SC={'进行中':'a','已完成':'b','待处理':'c'};
const dtRender=()=>{const r=gal.querySelector('.dtb');
 const rows=DT.filter(x=>(x.n+x.s).includes(dts.q)).sort((a,b)=>(a[dts.k]>b[dts.k]?1:a[dts.k]<b[dts.k]?-1:0)*dts.d);
 const pn=Math.max(1,Math.ceil(rows.length/6));dts.pg=Math.min(dts.pg,pn-1);dts.cur=rows.slice(dts.pg*6,dts.pg*6+6);
 r.querySelector('tbody').innerHTML=dts.cur.map(x=>`<tr class='${dts.sel.has(x.id)?'on':''}'><td><input type='checkbox' data-id='${x.id}'${dts.sel.has(x.id)?' checked':''}></td><td>${x.n}</td><td><span class='dtg ${SC[x.s]}'>${x.s}</span></td><td>¥${x.a.toLocaleString()}</td></tr>`).join('')||`<tr><td colspan='4' class='dte'>没有匹配的数据</td></tr>`;
 r.querySelectorAll('th[data-k] i').forEach(i=>{i.textContent=i.parentNode.dataset.k===dts.k?(dts.d>0?'▲':'▼'):''});
 const all=r.querySelector('.dta'),n=dts.cur.filter(x=>dts.sel.has(x.id)).length;all.checked=n>0&&n===dts.cur.length;all.indeterminate=n>0&&n<dts.cur.length;
 r.querySelector('.dts').textContent='已选 '+dts.sel.size+' 项 · 共 '+rows.length+' 条';
 r.querySelector('.dtp').innerHTML=Array.from({length:pn},(_,i)=>`<button data-pg='${i}' class='${i===dts.pg?'on':''}'>${i+1}</button>`).join('')};
const otCheck=w=>{const code=[...w.children].map(i=>i.value).join(''),m=w.parentNode.querySelector('.otm');w.classList.remove('ok','bad');if(code.length<6){m.textContent='演示验证码 123456';return}w.offsetWidth;if(code==='123456'){w.classList.add('ok');m.textContent='验证通过 ✓'}else{w.classList.add('bad');m.textContent='验证码不正确，请重试'}};
gal.addEventListener('input',e=>{const i=e.target;if(!i.matches('.oti input'))return;i.value=i.value.replace(/[^0-9]/g,'').slice(-1);if(i.value&&i.nextElementSibling)i.nextElementSibling.focus();otCheck(i.parentNode)});
gal.addEventListener('keydown',e=>{const i=e.target;if(!i.matches('.oti input'))return;const p=i.previousElementSibling,nx=i.nextElementSibling;if(e.key==='Backspace'&&!i.value&&p){p.value='';p.focus();otCheck(i.parentNode)}else if(e.key==='ArrowLeft'&&p)p.focus();else if(e.key==='ArrowRight'&&nx)nx.focus()});
gal.addEventListener('paste',e=>{const i=e.target;if(!i.matches('.oti input'))return;e.preventDefault();const t=(e.clipboardData.getData('text')||'').replace(/[^0-9]/g,'').slice(0,6),ins=[...i.parentNode.children];ins.forEach((x,k)=>x.value=t[k]||'');ins[Math.min(t.length,5)].focus();otCheck(i.parentNode)});
const drs={y:2026,m:9,a:null,b:null,h:null};
const drF=t=>{const d=new Date(t);return (d.getMonth()+1)+' 月 '+d.getDate()+' 日'};
const drRender=()=>{const r=gal.querySelector('.drp'),first=new Date(drs.y,drs.m,1).getDay(),days=new Date(drs.y,drs.m+1,0).getDate();
 r.querySelector('.drt').textContent=drs.y+' 年 '+(drs.m+1)+' 月';
 const end=drs.b||drs.h,lo=drs.a&&end?Math.min(drs.a,end):null,hi=drs.a&&end?Math.max(drs.a,end):null;
 let h=['日','一','二','三','四','五','六'].map(d=>`<b>${d}</b>`).join('')+'<i class=drx></i>'.repeat(first);
 for(let d=1;d<=days;d++){const t=new Date(drs.y,drs.m,d).getTime(),c=t===lo?'s':t===hi?'e':(lo&&t>lo&&t<hi)?'r':'';h+=`<i class='${c}' data-t='${t}'>${d}</i>`}
 r.querySelector('.drg').innerHTML=h;
 r.querySelector('.drs').textContent=drs.a&&drs.b?`${drF(Math.min(drs.a,drs.b))} 至 ${drF(Math.max(drs.a,drs.b))}，共 ${Math.round(Math.abs(drs.b-drs.a)/864e5)} 晚`:drs.a?'请选择结束日期':'请选择开始日期'};
gal.addEventListener('click',e=>{const q=e.target;
 const cx=q.closest('.cmx[data-i]');if(cx)cmRun(+cx.dataset.i);
 const et=q.closest('.est button');if(et)esRender(et.closest('.es'),[...et.parentNode.children].indexOf(et));
 const th=q.closest('.dtb th[data-k]');if(th){const k=th.dataset.k;if(dts.k===k)dts.d=-dts.d;else{dts.k=k;dts.d=1}dtRender()}
 const pb=q.closest('.dtp button');if(pb){dts.pg=+pb.dataset.pg;dtRender()}
 const dn=q.closest('.drh button');if(dn){drs.m+=+dn.dataset.d;if(drs.m>11){drs.m=0;drs.y++}if(drs.m<0){drs.m=11;drs.y--}drRender()}
 const dd=q.closest('.drg i[data-t]');if(dd){const t=+dd.dataset.t;if(!drs.a||drs.b){drs.a=t;drs.b=null}else drs.b=t;drs.h=null;drRender()}
 const sd=q.closest('.swd');if(sd){const it=sd.closest('.swi');it.classList.add('gone');setTimeout(()=>it.remove(),300)}
 const sp=q.closest('.swp');if(sp){const it=sp.closest('.swi'),c=it.querySelector('.swc');it.parentNode.prepend(it);c.o=false;c.x=0;c.style.transform='translateX(0)'}
});
gal.addEventListener('input',e=>{if(e.target.matches('.dtq')){dts.q=e.target.value.trim();dts.pg=0;dtRender()}});
gal.addEventListener('change',e=>{const c=e.target;if(c.matches('.dtb [data-id]')){const id=+c.dataset.id;c.checked?dts.sel.add(id):dts.sel.delete(id);dtRender()}else if(c.matches('.dta')){dts.cur.forEach(x=>c.checked?dts.sel.add(x.id):dts.sel.delete(x.id));dtRender()}});
gal.addEventListener('mouseover',e=>{const d=e.target.closest('.drg i[data-t]');if(d&&drs.a&&!drs.b&&drs.h!==+d.dataset.t){drs.h=+d.dataset.t;drRender()}});
gal.addEventListener('pointerdown',e=>{const c=e.target.closest('.swc');if(!c)return;c.setPointerCapture(e.pointerId);c.sx=e.clientX;c.b=c.o?-120:0;c.dr=1;c.style.transition='none'});
gal.addEventListener('pointermove',e=>{const c=e.target.closest('.swc');if(!c||!c.dr)return;c.x=Math.max(-120,Math.min(0,c.b+e.clientX-c.sx));c.style.transform='translateX('+c.x+'px)'});
const swEnd=e=>{const c=e.target.closest('.swc');if(!c||!c.dr)return;c.dr=0;c.o=(c.x||0)<-50;c.x=c.o?-120:0;c.style.transition='transform .3s';c.style.transform='translateX('+c.x+'px)'};
gal.addEventListener('pointerup',swEnd);gal.addEventListener('pointercancel',swEnd);
cmRender();gal.querySelectorAll('.es').forEach(r=>esRender(r,0));dtRender();drRender();
})();
// 视觉打磨：变体组折叠、分类跳转、主题按钮
gal.querySelectorAll('h3').forEach(h=>{if(!/^(按钮组合|动效组合)/.test(h.textContent))return;const g=h.nextElementSibling,d=document.createElement('details'),s=document.createElement('summary'),hint=document.createElement('span');d.className='gen';hint.className='hint';hint.textContent='同一套代码换颜色、圆角、大小、时长和缓动生成的变体';h.replaceWith(d);s.append(h,hint);d.append(s,g)});
const jump=document.createElement('nav');jump.className='jump';jump.innerHTML=[...gal.querySelectorAll('h3')].filter(h=>!h.closest('.gen')).map(h=>`<a href='#${h.id}'>${h.firstChild.textContent}</a>`).join('');gal.prepend(jump);
document.getElementById('themeBtn').onclick=()=>$('#dark').click();
const heroT=$('#heroThemeBtn');if(heroT)heroT.onclick=()=>$('#dark').click();
const bt=$('#backTop');
if(bt){
  addEventListener('scroll',()=>{bt.classList.toggle('show',window.scrollY>320)},{passive:true});
  bt.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
}

// 瀑布流：按阅读顺序把卡片放进当前最短的一列
const gridEl=document.querySelector('.grid'),boxes=[...gridEl.children];let colN=0;
const layout=()=>{const n=Math.max(1,Math.min(3,Math.floor(gridEl.clientWidth/320)));if(n===colN)return;colN=n;gridEl.classList.add('js-masonry');
 gridEl.replaceChildren(...Array.from({length:n},()=>{const c=document.createElement('div');c.className='col';return c}));
 const cols=[...gridEl.children];boxes.forEach(b=>{cols.reduce((m,c)=>c.offsetHeight<m.offsetHeight?c:m).append(b)})};
layout();addEventListener('resize',layout);

};__MAIN();
