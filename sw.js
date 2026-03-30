// 1. Identificador de la versión (Subimos a 1.4 por el cambio de icono)
const CACHE_NAME = 'Scientific-Calculator-Lion-v1.4';

// 2. Archivos Vitales (Corregido a icon-app.png)
const INITIAL_ASSETS = [
  './',
  './index.html',
  './icon-app.png' 
];

// --- FASE DE INSTALACIÓN ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🦁 [CalcuLion]: Núcleo del sistema instalado.');
      // Usamos return para asegurar que todo se guarde antes de terminar
      return cache.addAll(INITIAL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// --- FASE DE ACTIVACIÓN ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('🦁 [CalcuLion]: Limpiando caché antiguo:', key);
              return caches.delete(key);
            })
      );
    }).then(() => {
      console.log('🦁 [CalcuLion]: Sistema en línea y listo para rugir.');
      return self.clients.claim();
    })
  );
});

// --- ESTRATEGIA DE RED: NETWORK FIRST CON AUTO-RECUPERACIÓN ---
self.addEventListener('fetch', event => {
  // Solo procesamos peticiones seguras de tipo GET
  if (event.request.method !== 'GET') return;
  
  // Evitamos cachear scripts de extensiones o cosas externas que no sean tuyas
  if (!(event.request.url.indexOf('http') === 0)) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si hay internet, guardamos la copia más fresca
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // MODO OFFLINE: Si falla la red, buscamos en el TECNO
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          
          // Si el usuario navega a una ruta desconocida sin internet, lo mandamos al inicio
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
