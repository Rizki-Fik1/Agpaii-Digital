// Book data types and helper functions for Baca Buku feature
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string; // URL to cover image OR data URL from PDF thumbnail
  pdfUrl?: string; // URL to the PDF file
  category: string;
  jenjang?: string; // Level: SD, SMP, SMA/SMK, etc.
  description?: string;
  publisher?: string;
  year?: number;
  pages?: number;
  isbn?: string;
  isPopular?: boolean;
  isNew?: boolean;
  // Statistics
  viewCount?: number;
  downloadCount?: number;
  likeCount?: number;
  // Upload info
  uploadDate?: string; // ISO date string
  uploadedBy?: string;
  // For dynamically generated thumbnails
  coverDataUrl?: string; // Base64 data URL generated from PDF first page
}

export const bookCategories = [
  "Bahasa Inggris",
  "Bahasa Indonesia",
  "Matematika",
  "IPA",
  "IPS",
  "PKn",
  "Pendidikan Agama",
  "Seni Budaya",
  "PJOK",
  "Informatika",
];

// Get books with most likes (Terfavorit)
export const getMostLikedBooks = (limit: number = 6): Book[] => {
  return [];
};

// Get books with most views (Terlaris)
export const getMostViewedBooks = (limit: number = 6): Book[] => {
  return [];
};

export const getPopularBooks = (): Book[] => {
  return [];
};

export const getNewBooks = (): Book[] => {
  return [];
};

export const getBooksByCategory = (category: string): Book[] => {
  return [];
};

export const getBookById = (id: string): Book | undefined => {
  return undefined;
};

export const searchBooks = (query: string): Book[] => {
  return [];
};
