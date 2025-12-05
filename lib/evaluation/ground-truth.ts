/**
 * Ground Truth Data untuk Evaluasi Search Engine
 * Berisi query dan dokumen relevan yang sesuai dengan corpus berita WNI Kamboja
 */

export interface QueryGroundTruth {
  query: string;
  relevantDocs: number[]; // ID dokumen yang relevan
  description: string;
}

/**
 * Ground truth berdasarkan analisis manual corpus berita WNI Kamboja
 * Setiap query memiliki dokumen-dokumen relevan yang ditentukan berdasarkan:
 * - Kesesuaian topik dengan query
 * - Relevansi konten artikel dengan maksud pencarian
 * - Kata kunci yang muncul dalam artikel
 */
export const groundTruthData: QueryGroundTruth[] = [
  {
    query: "WNI Kamboja penipuan",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    description: "WNI yang terlibat kasus penipuan di Kamboja"
  },
  {
    query: "penipuan online Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: "Kasus penipuan online/daring yang melibatkan WNI di Kamboja"
  },
  {
    query: "WNI korban Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "WNI yang menjadi korban di Kamboja"
  },
  {
    query: "cyber crime Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: "Kejahatan siber yang melibatkan WNI di Kamboja"
  },
  {
    query: "human trafficking Kamboja Indonesia",
    relevantDocs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "Perdagangan manusia antara Indonesia dan Kamboja"
  },
  {
    query: "TKI Kamboja terjerat",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    description: "Tenaga Kerja Indonesia yang terjerat masalah di Kamboja"
  },
  {
    query: "repatriasi WNI Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "Pemulangan WNI dari Kamboja"
  },
  {
    query: "judi online Kamboja Indonesia",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: "Kasus judi online yang melibatkan WNI di Kamboja"
  },
  {
    query: "scam Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Kasus penipuan (scam) di Kamboja"
  },
  {
    query: "perdagangan manusia Kamboja",
    relevantDocs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "Kasus perdagangan manusia di Kamboja"
  },
  {
    query: "WNI dipulangkan Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "WNI yang dipulangkan dari Kamboja"
  },
  {
    query: "sindikat penipuan Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: "Sindikat penipuan yang beroperasi di Kamboja"
  },
  {
    query: "WNI tertipu Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "WNI yang tertipu janji kerja di Kamboja"
  },
  {
    query: "eksploitasi TKI Kamboja",
    relevantDocs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "Eksploitasi terhadap TKI di Kamboja"
  },
  {
    query: "mafia Kamboja Indonesia",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: "Jaringan mafia yang beroperasi antara Kamboja dan Indonesia"
  },
  {
    query: "pekerja migran Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "Pekerja migran Indonesia di Kamboja"
  },
  {
    query: "WNI terjebak Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "WNI yang terjebak di Kamboja"
  },
  {
    query: "kasus WNI Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    description: "Berbagai kasus yang menimpa WNI di Kamboja"
  },
  {
    query: "deportasi WNI Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    description: "Deportasi WNI dari Kamboja"
  },
  {
    query: "imigrasi Kamboja Indonesia",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    description: "Masalah imigrasi antara Kamboja dan Indonesia"
  },
  {
    query: "paspor palsu Kamboja",
    relevantDocs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    description: "Kasus pemalsuan paspor terkait WNI di Kamboja"
  }
];
