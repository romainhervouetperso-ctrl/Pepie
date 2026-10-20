/* Pépie : notifications push */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{
  let d={title:'Pépie',body:'Nouveau message'};
  try{d=e.data.json()}catch(_){}
  e.waitUntil((async()=>{
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(cl.some(c=>c.visibilityState==='visible'))return;
    await self.registration.showNotification(d.title||'Pépie',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.conv||'pepie',renotify:true,data:{conv:d.conv||''}});
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
