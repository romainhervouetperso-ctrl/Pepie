/* Pépie : notifications push + pastille sur l'icône (v4) */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
async function badgeSync(){
  try{
    const all=await self.registration.getNotifications();
    const total=all.reduce((a,x)=>a+((x.data&&x.data.n)||1),0);
    if(self.navigator&&self.navigator.setAppBadge){if(total>0)await self.navigator.setAppBadge(total);else await self.navigator.clearAppBadge()}
  }catch(_){}
}
self.addEventListener('push',e=>{
  let d={title:'Pépie',body:'Nouveau message'};
  try{d=e.data.json()}catch(_){}
  e.waitUntil((async()=>{
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(d.kind==='perch'){
      await self.registration.showNotification(d.title||'Rappel',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'perch',data:{conv:'',n:1,perch:1},requireInteraction:true});
      await badgeSync();return;
    }
    /* on affiche TOUJOURS la notification : iOS la retire si on ne l'affiche pas, et il se trompe souvent sur « l'appli est visible » */
    const vis=cl.some(c=>c.visibilityState==='visible'&&c.focused);
    const tag=d.conv||'pepie';let n=1;
    try{const ex=await self.registration.getNotifications({tag:tag});if(ex.length&&ex[0].data&&ex[0].data.n)n=ex[0].data.n+1}catch(_){}
    const body=n>1?n+' nouveaux messages · '+(d.body||''):(d.body||'');
    await self.registration.showNotification(d.title||'Pépie',{body:body,icon:'icon-192.png',badge:'icon-192.png',tag:tag,renotify:!vis,silent:vis,data:{conv:d.conv||'',n:n}});
    await badgeSync();
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(badgeSync());
  const conv=(e.notification.data&&e.notification.data.conv)||'';
  e.waitUntil((async()=>{
    const base=self.registration.scope;
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(cl.length){const c=cl[0];try{await c.focus()}catch(_){}c.postMessage({open:conv});return}
    await self.clients.openWindow(base+(conv?'?c='+conv:''));
  })());
});
