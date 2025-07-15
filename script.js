const mantraTextarea = document.getElementById("mantraInput"); // Diubah dari questionInput
const questionTextarea = document.getElementById("questionTextarea"); // Textarea baru
const askButton = document.getElementById("askButton");
const answerDisplay = document.getElementById("answerDisplay");

let modeRahasia = false;
let jawabanRahasia = "";
let teksSebelumRahasia = "";
let kursorPosisiAwalRahasia = -1;
const masker = "dr. Domb aku mau tanya dong"; // Mantra yang akan ditampilkan

// Inisialisasi textarea kosong dan fokus pada mantraInput
mantraTextarea.value = '';
questionTextarea.value = ''; // Pastikan textarea pertanyaan juga kosong
mantraTextarea.focus();

// Fungsi untuk memperbarui tampilan textarea Mantra dan kursor
function updateDisplayAndCaret(textareaEl, newCaretPos) {
    let currentDisplayedText = textareaEl.value;

    if (modeRahasia && kursorPosisiAwalRahasia !== -1) {
        const beforeMantra = currentDisplayedText.substring(0, kursorPosisiAwalRahasia);
        const currentMantraPart = masker.slice(0, jawabanRahasia.length);
        const afterMantra = currentDisplayedText.substring(kursorPosisiAwalRahasia + currentMantraPart.length); 
        
        textareaEl.value = beforeMantra + currentMantraPart + afterMantra;
    }
    
    textareaEl.setSelectionRange(newCaretPos, newCaretPos);
}

// Event listener 'keydown' hanya untuk mantraTextarea
mantraTextarea.addEventListener("keydown", function (e) {
    const currentCaretPos = mantraTextarea.selectionStart;

    // Mendeteksi koma pertama untuk masuk mode rahasia
    if (e.key === "," && !modeRahasia) {
        e.preventDefault();
        modeRahasia = true;
        jawabanRahasia = "";
        
        teksSebelumRahasia = mantraTextarea.value.substring(0, currentCaretPos);
        
        // Menyisipkan bagian masker secara visual ke textarea
        mantraTextarea.value = teksSebelumRahasia + masker.slice(0, 0) + mantraTextarea.value.substring(currentCaretPos);
        
        kursorPosisiAwalRahasia = currentCaretPos;
        updateDisplayAndCaret(mantraTextarea, currentCaretPos);
        return;
    }

    // Mendeteksi koma kedua untuk keluar dari mode rahasia
    if (e.key === "," && modeRahasia) {
        e.preventDefault();
        modeRahasia = false;
        
        // Tidak ada perubahan tampilan pada textarea.value, masker tetap terlihat
        const newCaretPos = currentCaretPos; // Kursor tetap di posisi saat ini
        updateDisplayAndCaret(mantraTextarea, newCaretPos); 
        kursorPosisiAwalRahasia = -1; // Reset posisi pemicu
        return;
    }

    // Penanganan input dalam mode rahasia (hanya di mantraTextarea)
    if (modeRahasia) {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            jawabanRahasia += e.key;

            const newCaretPos = kursorPosisiAwalRahasia + jawabanRahasia.length;
            updateDisplayAndCaret(mantraTextarea, newCaretPos);
            return;
        }

        if (e.key === "Backspace") {
            e.preventDefault();
            if (jawabanRahasia.length > 0) {
                jawabanRahasia = jawabanRahasia.slice(0, -1);
                const newCaretPos = currentCaretPos - 1;
                updateDisplayAndCaret(mantraTextarea, newCaretPos);
            }
            return;
        }
        
        // Cegah input lain di mode rahasia
        e.preventDefault();
        return;
    }

    // Penanganan input normal di mantraTextarea (jika bukan mode rahasia dan bukan koma)
    // Biarkan browser menangani secara default, karena `updateDisplayAndCaret` tidak dipanggil.
    // Jika ada kasus khusus, bisa ditambahkan di sini.
});

// Event listener 'input' hanya untuk mantraTextarea (untuk paste, dll. saat tidak mode rahasia)
mantraTextarea.addEventListener("input", function() {
    if (!modeRahasia) {
        // Ini memastikan textarea.value adalah sumber kebenaran saat tidak dalam mode rahasia.
        // Jika ada pengeditan di luar keydown (misal paste), kita perlu pastikan `teksSebelumRahasia` konsisten.
        teksSebelumRahasia = mantraTextarea.value; 
    }
});

// Event listener 'input' untuk questionTextarea (tidak ada trik khusus di sini, hanya input normal)
questionTextarea.addEventListener("input", function() {
    // Tidak ada logika khusus, biarkan browser menangani input normal.
    // Hanya perlu memastikan tidak ada konflik dengan mantraTextarea.
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
    kursorPosisiAwalRahasia = -1; 
    mantraTextarea.focus(); // Fokus kembali ke kolom mantra
});

// Fungsi pembantu untuk memindahkan kursor ke akhir (tidak banyak digunakan di skrip ini)
function setCaretToEnd(el) {
    el.selectionStart = el.selectionEnd = el.value.length;
    el.focus();
}