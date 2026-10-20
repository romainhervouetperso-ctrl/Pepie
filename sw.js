/* Pépie : notifications push */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{
  let d={title:'Pépie',body:'Nouveau message'};
  try{d=e.data.json()}catch(_){}
  e.waitUntil((async()=>{
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(cl.some(c=>c.visibilityState==='visible'))return;
    const tag=d.conv||'pepie';let n=1;
    try{const ex=await self.registration.getNotifications({tag:tag});if(ex.length&&ex[0].data&&ex[0].data.n)n=ex[0].data.n+1}catch(_){}
    const body=n>1?n+' nouveaux messages · '+(d.body||''):(d.body||'');
    await self.registration.showNotification(d.title||'Pépie',{body:body,icon:'icon-192.png',badge:'icon-192.png',tag:tag,renotify:true,data:{conv:d.conv||'',n:n}});
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const conv=(e.notification.data&&e.notification.data.conv)||'';
  e.waitUntil((async()=>{
    const base=self.registration.scope;
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(cl.length){const c=cl[0];try{await c.focus()}catch(_){}c.postMessage({open:conv});return}
    await self.clients.openWindow(base+(conv?'?c='+conv:''));
  })());
});
