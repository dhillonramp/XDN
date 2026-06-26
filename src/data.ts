export interface Lesson {
  id: string;
  title: string;
  gameType: 'count' | 'compare' | 'split' | 'shape' | 'math' | 'review';
  icon: string;
  description: string;
  emoji: string;
  gameData: any;
}

export interface Module {
  id: string;
  numStr: string;
  title: string;
  colorName: string; // e.g., "mint", "yellow", "pink", "blue", "orange", "purple"
  bgGradient: string;
  cardBg: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  lessons: Lesson[];
}

export const modules: Module[] = [
  {
    id: "m1",
    numStr: "一",
    title: "5以内数的认识和加、减法",
    colorName: "mint",
    bgGradient: "from-[#E8F5E9] to-[#C8E6C9]",
    cardBg: "bg-[#E8F5E9]",
    accentColor: "bg-[#4CAF50] hover:bg-[#43A047] text-white",
    textColor: "text-[#2E7D32]",
    borderColor: "border-[#A5D6A7]",
    lessons: [
      {
        id: "1-1",
        title: "1~5的认识",
        gameType: "count",
        icon: "Hash",
        description: "数一数草地上的小松鼠、小兔子和向日葵有几个？",
        emoji: "🐿️",
        gameData: { range: [1, 5], items: ["🐿️", "🐰", "🌻", "🎈"], title: "1~5数数大探险" }
      },
      {
        id: "1-2",
        title: "比大小",
        gameType: "compare",
        icon: "ArrowUpDown",
        description: "猴子和桃子比一比，谁多谁少？学习 >、< 和 =",
        emoji: "🐒",
        gameData: { range: [1, 5], items: ["🐒", "🍑", "🍌", "🍎"], title: "猴子吃桃比大小" }
      },
      {
        id: "1-3",
        title: "第几",
        gameType: "count",
        icon: "TrendingUp",
        description: "小动物排队坐火车，谁排在第1？谁排在第3？",
        emoji: "🚂",
        gameData: { type: "ordinal", items: ["🐱", "🐰", "🐼", "🦊", "🐯"], title: "动物火车排排队" }
      },
      {
        id: "1-4",
        title: "分与合",
        gameType: "split",
        icon: "GitMerge",
        description: "把4个向日葵放到两个盘子里，可以怎么分呢？",
        emoji: "🌻",
        gameData: { total: 4, items: ["🌻", "🍎", "🍩"], title: "花朵苹果分与合" }
      },
      {
        id: "1-5",
        title: "5以内的加法",
        gameType: "math",
        icon: "Plus",
        description: "树上有3只松鼠，又跑来2只，一共有几只？",
        emoji: "➕",
        gameData: { range: [1, 5], op: "+", title: "快乐加法对对碰" }
      },
      {
        id: "1-6",
        title: "5以内的减法",
        gameType: "math",
        icon: "Minus",
        description: "手里有5个气球，飞走了2个，还剩几个？",
        emoji: "🎈",
        gameData: { range: [1, 5], op: "-", title: "气球飞走啦-减法" }
      },
      {
        id: "1-7",
        title: "0的认识和加减",
        gameType: "math",
        icon: "Circle",
        description: "小猫钓鱼，一条也没钓到，用什么数表示？",
        emoji: "🐱",
        gameData: { includeZero: true, range: [0, 5], title: "小猫钓鱼-认识0" }
      }
    ]
  },
  {
    id: "m2",
    numStr: "二",
    title: "6~10的认识和加、减法",
    colorName: "yellow",
    bgGradient: "from-[#FFFDE7] to-[#FFF9C4]",
    cardBg: "bg-[#FFFDE7]",
    accentColor: "bg-[#FBC02D] hover:bg-[#F9A825] text-white",
    textColor: "text-[#F57F17]",
    borderColor: "border-[#FFF59D]",
    lessons: [
      {
        id: "2-1",
        title: "6和7的认识与加减",
        gameType: "math",
        icon: "Compass",
        description: "数一数鱼缸里漂亮的小鱼，做一做6和7的加减法吧！",
        emoji: "🐠",
        gameData: { range: [6, 7], op: "both", title: "海洋世界-6和7的加减" }
      },
      {
        id: "2-2",
        title: "8和9的认识与加减",
        gameType: "math",
        icon: "Compass",
        description: "草地上开满了美丽的花，飞来了8只蝴蝶和9只蜻蜓！",
        emoji: "🦋",
        gameData: { range: [8, 9], op: "both", title: "百花园-8和9的加减" }
      },
      {
        id: "2-3",
        title: "10的认识与加减",
        gameType: "math",
        icon: "PlusCircle",
        description: "手拉手，凑成10！10的朋友是谁呢？找找好伙伴！",
        emoji: "🔟",
        gameData: { range: [10, 10], op: "both", isTenFriend: true, title: "10的好朋友-凑十歌" }
      },
      {
        id: "2-4",
        title: "连加连减",
        gameType: "math",
        icon: "Layers",
        description: "小鸡吃米，跑来2只又跑来3只，连加连减挑战！",
        emoji: "🐤",
        gameData: { type: "chain", op: "chain", range: [1, 10], title: "开心农场-连加连减" }
      },
      {
        id: "2-5",
        title: "加减混合",
        gameType: "math",
        icon: "Activity",
        description: "湖里有4只天鹅，飞走2只又飞来3只，算算看！",
        emoji: "🦢",
        gameData: { type: "mixed", range: [1, 10], title: "天鹅湖-加减混合" }
      }
    ]
  },
  {
    id: "m3",
    numStr: "三",
    title: "认识立体图形",
    colorName: "pink",
    bgGradient: "from-[#FCE4EC] to-[#F8BBD0]",
    cardBg: "bg-[#FCE4EC]",
    accentColor: "bg-[#E91E63] hover:bg-[#D81B60] text-white",
    textColor: "text-[#C2185B]",
    borderColor: "border-[#F48FB1]",
    lessons: [
      {
        id: "3-1",
        title: "长方体和正方体",
        gameType: "shape",
        icon: "Box",
        description: "牙膏盒、积木块，它们都是什么形状的？",
        emoji: "📦",
        gameData: { shapes: ["cuboid", "cube"], title: "神奇魔盒-认识长方体正方体" }
      },
      {
        id: "3-2",
        title: "圆柱和球",
        gameType: "shape",
        icon: "CircleDot",
        description: "易拉罐、足球，它们能滚动吗？认识圆柱和球！",
        emoji: "⚽",
        gameData: { shapes: ["cylinder", "sphere"], title: "滚滚乐-认识圆柱与球" }
      },
      {
        id: "3-3",
        title: "搭积木城堡",
        gameType: "shape",
        icon: "Component",
        description: "我们要用所有的积木搭建一个又稳又高的漂亮城堡！",
        emoji: "🏰",
        gameData: { shapes: ["all"], type: "build", title: "城堡设计师-搭积木" }
      }
    ]
  },
  {
    id: "m4",
    numStr: "四",
    title: "11~20的认识",
    colorName: "blue",
    bgGradient: "from-[#E3F2FD] to-[#BBDEFB]",
    cardBg: "bg-[#E3F2FD]",
    accentColor: "bg-[#2196F3] hover:bg-[#1E88E5] text-white",
    textColor: "text-[#1565C0]",
    borderColor: "border-[#90CAF9]",
    lessons: [
      {
        id: "4-1",
        title: "11~20的数数和读写",
        gameType: "count",
        icon: "Binary",
        description: "数出10根小棒捆成一捆，再接着数，认识11~20！",
        emoji: "🥢",
        gameData: { range: [11, 20], items: ["🥢", "⭐", "🍓"], title: "小棒捆捆乐-11~20" }
      },
      {
        id: "4-2",
        title: "十位和个位",
        gameType: "split",
        icon: "Compass",
        description: "右边第一位是个位，第二位是十位。学习数位计数器！",
        emoji: "🧮",
        gameData: { type: "placeValue", range: [11, 20], title: "神奇计数器-个位和十位" }
      },
      {
        id: "4-3",
        title: "十几加减一位数",
        gameType: "math",
        icon: "Calculator",
        description: "不退位、不进位：13 + 2 = ?  15 - 3 = ? 轻松口算！",
        emoji: "🍎",
        gameData: { type: "teenNoCarry", range: [11, 20], title: "摘苹果口算-十几加减一位数" }
      }
    ]
  },
  {
    id: "m5",
    numStr: "五",
    title: "20以内的进位加法",
    colorName: "orange",
    bgGradient: "from-[#FFF3E0] to-[#FFE0B2]",
    cardBg: "bg-[#FFF3E0]",
    accentColor: "bg-[#FF9800] hover:bg-[#F57C00] text-white",
    textColor: "text-[#E65100]",
    borderColor: "border-[#FFCC80]",
    lessons: [
      {
        id: "5-1",
        title: "9加几（凑十法）",
        gameType: "math",
        icon: "CheckCircle",
        description: "9 + 4 怎么算？分出1给9凑成10，10加3得13！",
        emoji: "🍊",
        gameData: { base: 9, title: "神奇凑十法-9加几" }
      },
      {
        id: "5-2",
        title: "8、7、6加几",
        gameType: "math",
        icon: "CheckCircle",
        description: "8加几、7加几，同样分出一个数凑成10，你一定行！",
        emoji: "🍎",
        gameData: { base: "876", title: "超级凑十法-8,7,6加几" }
      },
      {
        id: "5-3",
        title: "5、4、3、2加几",
        gameType: "math",
        icon: "CheckCircle",
        description: "小数加大数，交换位置想一想：5 + 8 就是 8 + 5！",
        emoji: "🍬",
        gameData: { base: "small", title: "交换法宝-5,4,3,2加几" }
      }
    ]
  },
  {
    id: "m6",
    numStr: "六",
    title: "复习与关联",
    colorName: "purple",
    bgGradient: "from-[#F3E5F5] to-[#E1BEE7]",
    cardBg: "bg-[#F3E5F5]",
    accentColor: "bg-[#9C27B0] hover:bg-[#8E24AA] text-white",
    textColor: "text-[#6A1B9A]",
    borderColor: "border-[#E1BEE7]",
    lessons: [
      {
        id: "6-1",
        title: "数与运算大冲关",
        gameType: "review",
        icon: "Gamepad",
        description: "终极探险：20以内的加减法混合大冒险，赢取小红花！",
        emoji: "🏆",
        gameData: { type: "mathMaster", title: "数与运算大冲关" }
      },
      {
        id: "6-2",
        title: "图形与空间大探索",
        gameType: "review",
        icon: "Gamepad",
        description: "图形配对与空间方向大通关（上、下、前、后、左、右）！",
        emoji: "🗺️",
        gameData: { type: "shapeMaster", title: "图形与空间大探索" }
      }
    ]
  }
];
