import"./dynamic-import-polyfill.f8def49a.js";/* empty css               */import{i as e,s as i,S as t,P as n,O as d,f as o,M as s,g as a,W as w}from"./vendor.0603ed81.js";const h={width:window.innerWidth,height:window.innerHeight};window.addEventListener("resize",(()=>{h.width=window.innerWidth,h.height=window.innerHeight,p.aspect=h.width/h.height,p.updateProjectionMatrix(),P.setSize(h.width,h.height),P.setPixelRatio(Math.min(window.devicePixelRatio,2))}));const r=location.hash.includes("debug"),c=new e.GUI({width:340});!r&&c.hide();const l=new i;r&&document.body.appendChild(l.dom);const m=document.querySelector("#webgl"),g=new t,p=new n(75,h.width/h.height,.1,100);p.position.set(2,2,2),g.add(p);const u=new d(p,m);u.enableDamping=!0;const f=new a(new o(1,1,1),new s({color:"red"}));f.position.set(0,0,0),g.add(f);const P=new w({canvas:m});P.setSize(h.width,h.height),P.setPixelRatio(Math.min(window.devicePixelRatio,2)),function e(){l.begin(),u.update(),P.render(g,p),l.end(),requestAnimationFrame(e)}();