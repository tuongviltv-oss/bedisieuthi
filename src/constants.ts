
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  reward: string;
}

export interface Cosmetic {
  id: string;
  name: string;
  type: 'HAT' | 'CART';
  requirement: string;
  icon: string;
}

export const COSMETICS: Cosmetic[] = [
  {
    id: 'glasses',
    name: 'Kính Xinh',
    type: 'HAT',
    requirement: 'Đạt 20 điểm',
    icon: '👓'
  },
  {
    id: 'cap',
    name: 'Mũ Lưỡi Trai',
    type: 'HAT',
    requirement: 'Đạt 30 điểm',
    icon: '🧢'
  },
  {
    id: 'ribbon',
    name: 'Nơ Hồng',
    type: 'HAT',
    requirement: 'Đạt 35 điểm',
    icon: '🎀'
  },
  {
    id: 'crown',
    name: 'Vương Miện',
    type: 'HAT',
    requirement: 'Đạt 50 điểm',
    icon: '👑'
  },
  {
    id: 'dots',
    name: 'Giỏ Chấm Bi',
    type: 'CART',
    requirement: 'Đạt 25 điểm',
    icon: '🔵'
  },
  {
    id: 'stripes',
    name: 'Giỏ Sọc Vàng',
    type: 'CART',
    requirement: 'Đạt 40 điểm',
    icon: '🎨'
  },
  {
    id: 'golden',
    name: 'Giỏ Ánh Kim',
    type: 'CART',
    requirement: 'Thu thập đủ 5 món',
    icon: '✨'
  },
  {
    id: 'rainbow',
    name: 'Giỏ Cầu Vồng',
    type: 'CART',
    requirement: 'Đạt 45 điểm',
    icon: '🌈'
  }
];

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Một túi bánh giá 18 000 đồng và một chai sữa giá 12 000 đồng. Hỏi phải trả tất cả bao nhiêu tiền?",
    options: ["28 000", "29 000", "30 000", "31 000"],
    correctAnswer: "30 000",
    hint: "Hãy cộng 18 000 và 12 000.",
    reward: "🧸"
  },
  {
    id: 2,
    text: "Một quyển truyện giá 32 000 đồng. Bé đưa 50 000 đồng. Hỏi được trả lại bao nhiêu tiền?",
    options: ["16 000", "17 000", "18 000", "19 000"],
    correctAnswer: "18 000",
    hint: "Lấy 50 000 trừ 32 000.",
    reward: "🎒"
  },
  {
    id: 3,
    text: "Lan có 60 000 đồng. Lan mua hộp sữa 22 000 đồng và túi bánh 15 000 đồng. Hỏi còn lại bao nhiêu tiền?",
    options: ["21 000", "22 000", "23 000", "24 000"],
    correctAnswer: "23 000",
    hint: "Bước 1: Lấy số tiền hộp sữa cộng với túi bánh (22 000 + 15 000). Bước 2: Lấy 60 000 - số tiền vừa tìm được",
    reward: "🍪"
  },
  {
    id: 4,
    text: "Nam có 80 000 đồng. Nam mua cặp 45 000 đồng và bút màu 18 000 đồng. Hỏi còn lại bao nhiêu tiền?",
    options: ["15 000", "16 000", "17 000", "18 000"],
    correctAnswer: "17 000",
    hint: "Bước 1: Lấy số tiền chiếc cặp + bút màu (45 000 + 18 000). Bước 2: Lấy 80 000 - sồ tiền vừa tìm được",
    reward: "🍬"
  },
  {
    id: 5,
    text: "Mai có 70 000 đồng. Mai mua váy 42 000 đồng và một chiếc nón. Sau khi mua xong còn lại 8 000 đồng. Hỏi chiếc nón giá bao nhiêu tiền?",
    options: ["18 000", "19 000", "20 000", "21 000"],
    correctAnswer: "20 000",
    hint: "Bước 1: Tính số tiền đã mua (70 000 - 8 000) Bước 2: Lấy số tiền đó - tiền mua chiếc vay",
    reward: "✏️"
  }
];
