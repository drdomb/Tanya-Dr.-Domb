const mantraTextarea = document.getElementById("mantraInput");
const questionTextarea = document.getElementById("questionTextarea");
const askButton = document.getElementById("askButton");
const answerDisplay = document.getElementById("answerDisplay");

// Daftarkan Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('Service Worker terdaftar dengan scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('Gagal mendaftarkan Service Worker:', err);
      });
  });
}

let modeRahasia = false;
let jawabanRahasia = "";
let teksSebelumRahasia = ""; // Teks sebelum koma pertama
let teksSetelahRahasia = ""; // Teks setelah koma kedua (jika ada)
let maskerTerlihat = false; // Status apakah masker sedang ditampilkan atau belum
const masker = "dr. Domb aku mau tanya dong"; // Mantra yang akan ditampilkan

// Inisialisasi textarea kosong dan fokus pada mantraInput
mantraTextarea.value = '';
questionTextarea.value = '';
mantraTextarea.focus();

// Fungsi untuk memperbarui tampilan textarea Mantra
// Kita akan lebih banyak mengandalkan event 'input' sekarang
function updateMantraDisplay() {
    let displayedText = mantraTextarea.value;

    if (modeRahasia) {
        // Jika dalam mode rahasia, pastikan masker ditampilkan setelah teksSebelumRahasia
        // dan sebelum teksSetelahRahasia (jika ada)
        const currentMantraPart = masker.slice(0, jawabanRahasia.length);
        
        // Gabungkan bagian sebelum mantra, masker, dan bagian setelah mantra
        // Ini jadi sedikit lebih kompleks karena kita tidak lagi hanya mengandalkan caret position
        // Kita asumsikan masker akan muncul setelah teksSebelumRahasia, dan
        // teksSetelahRahasia akan muncul setelah masker selesai.
        displayedText = teksSebelumRahasia + currentMantraPart + teksSetelahRahasia;

    } else {
        // Jika tidak dalam mode rahasia, biarkan teks yang diketik pengguna apa adanya
        // Ini adalah state normal sebelum koma pertama, atau setelah koma kedua
        displayedText = mantraTextarea.value;
    }
    
    // Perbarui nilai textarea
    mantraTextarea.value = displayedText;
    
    // Set kursor ke akhir masker atau akhir input normal
    if (modeRahasia) {
        mantraTextarea.setSelectionRange(teksSebelumRahasia.length + masker.length, teksSebelumRahasia.length + masker.length);
    } else {
        mantraTextarea.setSelectionRange(displayedText.length, displayedText.length);
    }
}


// ----------- MODIFIKASI UTAMA DI SINI -----------
// Kita akan lebih banyak mengandalkan event 'input' untuk mendeteksi perubahan
mantraTextarea.addEventListener("input", function (e) {
    const currentValue = mantraTextarea.value;
    
    // --- Deteksi Koma Pertama (Masuk Mode Rahasia) ---
    if (!modeRahasia && currentValue.includes(',')) {
        // Dapatkan indeks koma pertama
        const firstCommaIndex = currentValue.indexOf(',');
        teksSebelumRahasia = currentValue.substring(0, firstCommaIndex);
        
        modeRahasia = true;
        jawabanRahasia = ""; // Reset jawaban rahasia saat masuk mode
        maskerTerlihat = false; // Reset status masker
        
        // Secara instan tampilkan masker setelah koma
        mantraTextarea.value = teksSebelumRahasia + masker;
        // Posisikan kursor di akhir masker
        mantraTextarea.setSelectionRange(teksSebelumRahasia.length + masker.length, teksSebelumRahasia.length + masker.length);
        
        // Jika ada teks setelah koma pertama, itu akan menjadi teksSetelahRahasia
        teksSetelahRahasia = currentValue.substring(firstCommaIndex + 1);
        
        return; // Hentikan pemrosesan lebih lanjut untuk event ini
    }

    // --- Deteksi Koma Kedua (Keluar Mode Rahasia) ---
    // Logika ini mungkin perlu disesuaikan jika koma kedua muncul setelah masker
    // Untuk saat ini, kita anggap koma kedua muncul di akhir input setelah masker
    if (modeRahasia && currentValue.endsWith(',') && currentValue.length > (teksSebelumRahasia.length + masker.length)) {
        modeRahasia = false;
        // Koma kedua ini menjadi bagian dari teksSetelahRahasia, tapi kita tidak
        // ingin mempengaruhinya di sini, karena sudah keluar mode rahasia.
        // Cukup biarkan input apa adanya dan keluar dari mode rahasia.
        teksSetelahRahasia = currentValue.substring(teksSebelumRahasia.length + masker.length); // Update teks setelah masker
        return;
    }


    // --- Penanganan Input dalam Mode Rahasia ---
    if (modeRahasia) {
        // Dapatkan teks yang seharusnya mewakili input pengguna setelah teksSebelumRahasia dan sebelum masker
        // Kita perlu mencari tahu apa yang sebenarnya diketik pengguna (yang seharusnya menjadi jawaban rahasia)
        let typedText = currentValue.substring(teksSebelumRahasia.length); // Ambil bagian setelah teksSebelumRahasia
        
        // Hapus bagian masker jika ada
        if (typedText.startsWith(masker)) {
            typedText = typedText.substring(masker.length);
        }
        
        // Bandingkan dengan jawabanRahasia yang sudah ada untuk mendeteksi penambahan/pengurangan karakter
        if (typedText.length > jawabanRahasia.length) {
            // Karakter baru ditambahkan
            jawabanRahasia = typedText;
        } else if (typedText.length < jawabanRahasia.length) {
            // Karakter dihapus (Backspace/Delete)
            jawabanRahasia = typedText;
        }
        
        // Selalu tampilkan masker dan sembunyikan jawaban rahasia secara visual
        mantraTextarea.value = teksSebelumRahasia + masker + teksSetelahRahasia;
        // Posisikan kursor di akhir masker
        mantraTextarea.setSelectionRange(teksSebelumRahasia.length + masker.length, teksSebelumRahasia.length + masker.length);
    }
});


// Menangani Backspace di mode rahasia saat menggunakan event 'keydown' (masih bisa berguna)
// Ini adalah fallback untuk backspace karena 'input' event mungkin tidak langsung memberi tahu backspace
mantraTextarea.addEventListener("keydown", function(e) {
    if (modeRahasia && e.key === "Backspace") {
        e.preventDefault(); // Cegah default behaviour
        if (jawabanRahasia.length > 0) {
            jawabanRahasia = jawabanRahasia.slice(0, -1);
        }
        updateMantraDisplay(); // Perbarui tampilan setelah backspace
        return;
    }
    // Jika tidak dalam mode rahasia, atau bukan backspace, biarkan keydown berjalan normal
});

// Event listener 'input' untuk questionTextarea (tidak ada trik khusus di sini, hanya input normal)
questionTextarea.addEventListener("input", function() {
    // Tidak ada logika khusus, biarkan browser menangani input normal.
});


askButton.addEventListener("click", () => {
    // Tampilkan jawaban rahasia dari trik
    if (jawabanRahasia.trim() !== "") {
        answerDisplay.textContent = jawabanRahasia.trim();
    } else {
        answerDisplay.textContent = "Dr. Domb tidak menemukan jawaban. Coba lagi.";
    }
    
    // Reset semua state setelah klik tombol
    mantraTextarea.value = '';
    questionTextarea.value = ''; // Kosongkan juga kolom pertanyaan
    modeRahasia = false;
    jawabanRahasia = "";
    teksSebelumRahasia = "";
    teksSetelahRahasia = "";
    maskerTerlihat = false;
    mantraTextarea.focus(); // Fokus kembali ke kolom mantra
});