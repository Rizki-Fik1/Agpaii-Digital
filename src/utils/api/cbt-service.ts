const BASE_URL = "https://admin.agpaiidigital.org";

export interface CBTPaket {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  totalSoal: number;
  status?: "belum" | "sedang" | "selesai";
  startedAt?: string;
  completedAt?: string;
}

export interface Soal {
  id: string;
  pertanyaan: string;
  tipeJawaban: "pilihan_ganda" | "esai" | "benar_salah";
  opsi?: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string;
  };
  bobot: number;
}

export interface CbtUserResponse {
  success: boolean;
  message: string;
  data?: any;
}

class CbtService {
  async getPaketList(
    token: string,
  ): Promise<{ success: boolean; data: CBTPaket[] }> {
    try {
      const res = await fetch(`${BASE_URL}/api/cbt/paket`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching CBT paket:", error);
      throw error;
    }
  }

  async mulaiLatihan(
    token: string,
    paketId: string,
  ): Promise<{ success: boolean; data: any }> {
    try {
      const res = await fetch(`${BASE_URL}/api/cbt/latihan/mulai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          paket_id: paketId,
        }),
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error starting latihan:", error);
      throw error;
    }
  }

  async getSoal(
    token: string,
    latihanId: string,
  ): Promise<{ success: boolean; data: Soal[] }> {
    try {
      const res = await fetch(`${BASE_URL}/api/cbt/latihan/${latihanId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching soal:", error);
      throw error;
    }
  }

  async jawabSoal(
    token: string,
    latihanId: string,
    soalId: string,
    jawaban: string,
  ): Promise<CbtUserResponse> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/cbt/latihan/${latihanId}/jawab`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            soal_id: soalId,
            jawaban: jawaban,
          }),
        },
      );

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error submitting jawaban:", error);
      throw error;
    }
  }

  async selesaiLatihan(
    token: string,
    latihanId: string,
  ): Promise<CbtUserResponse> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/cbt/latihan/${latihanId}/selesai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error completing latihan:", error);
      throw error;
    }
  }
}

export const cbtService = new CbtService();
