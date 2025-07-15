const CACHE_NAME = 'drdomb-v1'; // Nama cache, ubah jika ada pembaruan besar
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
  // Tambahkan semua aset statis lain yang perlu di-cache di sini
  // Misalnya: gambar, font tambahan, dll.
];

// Event: install
// Terjadi saat Service Worker pertama kali diinstal
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache); // Cache semua aset yang diperlukan
      })
  );
});

// Event: activate
// Terjadi saat Service Worker diaktifkan (misalnya setelah update)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName); // Hapus cache lama
          }
        })
      );
    })
  );
});

// Event: fetch
// Terjadi setiap kali browser meminta resource (misalnya, memuat halaman, gambar, dll.)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // Coba cari di cache dulu
      .then((response) => {
        // Jika ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, ambil dari jaringan
        return fetch(event.request)
          .then((networkResponse) => {
            // Opsional: cache respons jaringan yang baru untuk penggunaan di masa mendatang
            return caches.open(CACHE_NAME).then((cache) => {
              // Hindari caching request POST atau request yang tidak standar
              if (event.request.method === 'GET' && networkResponse.ok) {
                 // Clone respons karena stream hanya bisa dibaca sekali
                cache.put(event.request, networkResponse.clone()); 
              }
              return networkResponse;
            });
          })
          .catch(() => {
            // Jika gagal dari jaringan dan tidak ada di cache, bisa berikan halaman offline
            // Misalnya: return caches.match('./offline.html');
            console.log('Network request failed and no cache match.');
            // Untuk kasus ini, biarkan browser menampilkan error jaringan
          });
      })
  );
});
