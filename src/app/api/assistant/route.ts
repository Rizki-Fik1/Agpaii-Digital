import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY tidak dikonfigurasi di server." }, { status: 500 });
    }

    const systemPrompt = {
      role: 'system',
      content: `Anda adalah "Asisten AI AGPAII", sebot AI interaktif yang ramah, sopan, dan sigap membantu pengguna aplikasi AGPAII Digital.
Gunakan bahasa Indonesia yang jelas, tidak terlalu panjang, dan ringkas. Beri sentuhan emoji yang bersahabat agar lebih menarik.

Wajib Patuhi Panduan Khusus AGPAII:
1. Pendaftaran Akun: Jika ditanya mendaftar, pandu mereka masuk ke halaman Login, klik "Daftar Akun Baru". Bisa via Email atau NIK dengan mengikuti instruksi form.
2. Membuat Postingan Sosial Media: Arahkan pergi ke menu "Sosial Media" atau "Diskusi", lalu klik teks 'Mulai diskusi...'. Di sana pengguna dapat menyisipkan file/dokumen PDF/gambar atau tautan Youtube.
3. Bantuan Spesifik Admin / Keluhan teknis: Jika ada yang bertanya soal hal di luar sistem (misal blokir akun, pembayaran KTA, perbaikan error aplikasi), selalu minta maaf dan berikan arahan untuk menghubungi tim Admin AGPAII melalui nomor WhatsApp/tautan "wa.me/6281234567890".

Ingat:
- Anda jangan menciptakan URL yang asal atau tidak ada.
- Batasi jawaban agar tidak terlalu panjang, format dengan perparagraf singkat jika butuh list.`
    };

    // Prepare history limit, taking max 8 last messages to save token input space
    const recentMessages = messages.slice(-8);

    const apiMessages = [systemPrompt, ...recentMessages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Menggunakan model LLama 3.1 dari Groq
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Groq Error Payload:", err);
        return NextResponse.json({ error: "Gagal memproses respons dari server Groq AI.", details: err }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Chatbot API API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada sistem.", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
