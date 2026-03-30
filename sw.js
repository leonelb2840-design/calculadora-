// 1. Nombre de la versión (Cámbialo a v2, v3... cada vez que edites el HTML)
const cacheName = 'Scientific-Lion-v1.1';

// 2. Lista de archivos a proteger (Asegúrate de que existan en tu GitHub)
const assets = [
  './',
  './index.html',
  './icon-512.png'
];

// --- EVENTO DE INSTALACIÓN ---
// Se ejecuta la primera vez que alguien entra. Guarda todo en el teléfono.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('🦁 CalcuLion: Guardando archivos en memoria...');
      return cache.addAll(assets);
    }).then(() => self.skipWaiting()) // Fuerza a que la nueva versión se active YA
  );
});

// --- EVENTO DE ACTIVACIÓN ---
// Borra versiones viejas automáticamente para no llenar el espacio del TECNO.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName)
            .map(key => {
              console.log('🦁 CalcuLion: Limpiando caché viejo...', key);
              return caches.delete(key);
            })
      );
    })
  );
});

// --- EVENTO DE PETICIÓN (FETCH) ---
// La magia: Si hay internet, actualiza el archivo. Si no hay, usa el del teléfono.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Retorna lo que hay en caché inmediatamente
      const networkFetch = fetch(event.request).then(networkResponse => {
        // Si la red responde, actualizamos el caché en segundo plano
        if (networkResponse && networkResponse.status === 200) {
          caches.open(cacheName).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Si no hay internet y no está en caché (error total), aquí podrías poner una página de error
        console.log('🦁 CalcuLion: Modo Offline Activo.');
      });

      return cachedResponse || networkFetch;
    })
  );
});
