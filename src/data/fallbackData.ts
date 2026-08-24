import { Article, CategoryInfo, CompanyPage } from '../types';

export const fallbackCategories: CategoryInfo[] = [
  { id: 'checkup', name: '건강검진' },
  { id: 'womens-health', name: '여성건강' },
  { id: 'oriental-med', name: '한의학' },
  { id: 'spine-joint', name: '척추관절' },
  { id: 'cardnews', name: '카드뉴스' },
  { id: 'opinion', name: '오피니언' }
];

export const fallbackCompanyPages: CompanyPage[] = [
  { id: 'about', title: '소개', content: '데일리펄스는 독자 여러분께 정확하고 유용한 보건의료 뉴스 및 일상 건강 지식을 제공합니다.' },
  { id: 'guidelines', title: '편집 가이드라인', content: '독립적이고 객관적인 시각에서 팩트에 기반한 저널리즘을 준수합니다.' },
  { id: 'careers', title: '채용 정보', content: '데일리펄스와 함께 새로운 저널리즘의 미래를 만들어갈 인재를 기다립니다.' },
  { id: 'privacy', title: '개인정보 처리방침 및 약관', content: '고객님의 개인정보 보호를 최우선으로 생각합니다.' },
];

export const fallbackArticles: Article[] = [
  {
    id: "fb-1",
    title: "의료계 핫이슈를 한눈에! 데일리펄스 건강 뉴스 브리핑",
    excerpt: "오늘의 주요 보건의료 이슈와 유용한 건강 정리를 쉽게 전달해 드립니다.",
    content: "우리 가족의 건강을 위한 쉽고 유익한 의학 지식을 일상에서 바로 활용하실 수 있도록 자세히 공유하고자 합니다. 최근 보건 복지 정책부터 일상 예방 꿀팁까지 정확한 정보로 보답하겠습니다.\n\n자세한 정보는 공식 보건복지부 사이트(https://www.mohw.go.kr)를 통해 확인하실 수 있습니다.",
    categoryId: "checkup",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-07-01T12:00:00.000Z",
    author: "데일리펄스 편집국",
    views: 1240,
    likes: 85,
    isFeatured: true,
    isTrending: true,
    isBreaking: true
  },
  {
    id: "fb-2",
    title: "현대인의 고질병 목·허리 통증 완화하기: 척추관절 자가 케어 가이드",
    excerpt: "오래 앉아 일하는 직장인들을 위한 실생활 올바른 자세와 틈새 스트레칭 팁을 전합니다.",
    content: "잘못된 자세로 인한 디스크 탈출증 및 척추 관절 증후군을 복잡한 이론 대신 매일 3분씩 실천할 수 있는 쉬운 맨몸 회복 훈련으로 정리했습니다. 꾸준한 거북목 예방 스트레칭이 건강한 척추 수명을 늘립니다.",
    categoryId: "spine-joint",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-07-01T11:00:00.000Z",
    author: "김지훈 기자",
    views: 890,
    likes: 42,
    isFeatured: true,
    isTrending: true,
    isBreaking: false
  },
  {
    id: "fb-3",
    title: "건강검진 결과표 완벽 해독법: 나에게 꼭 필요한 검사항목 알아보기",
    excerpt: "복잡한 의학 용어와 숫자로 가득한 종합 건강검진 결과표에서 주의해야 할 핵심 항목을 짚어봅니다.",
    content: "혈압, 콜레스테롤, 공복혈당 수치 등 기초 만성 질환 지표의 정상 범위를 해설하고, 나이대별 맞춤형 추가 정밀검진 가이드라인을 알려 드립니다. 미리 발견하고 예방하는 것이 무엇보다 전인적 건강의 첫걸음입니다.",
    categoryId: "checkup",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-07-01T10:00:00.000Z",
    author: "박서연 기자",
    views: 1560,
    likes: 112,
    isFeatured: true,
    isTrending: false,
    isBreaking: false
  },
  {
    id: "fb-4",
    title: "[카드뉴스] 한눈에 보는 여름철 온열질환 예방 수칙 5가지",
    excerpt: "무더운 날씨 온열질환 대처법과 수분 섭취 가이드를 한눈에 파악하세요.",
    content: "1. 야외 활동 시 물을 자주 마시기\n2. 가장 무더운 시간대(12시~17시) 야외활동 자제하기\n3. 외출 시 햇볕을 가리고 밝은색의 가벼운 옷 착용하기\n4. 현기증, 두통 등 이상 증상이 나타나면 즉시 시원한 곳에서 휴식하기\n5. 주위에 온열질환자 발생 시 119 구급대에 신고하고 시원한 곳으로 이동시키기",
    categoryId: "cardnews",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-07-01T09:00:00.000Z",
    author: "데일리펄스 디자인팀",
    views: 2100,
    likes: 180,
    isFeatured: false,
    isTrending: true,
    isBreaking: false
  },
  {
    id: "fb-5",
    title: "[오피니언] 디지털 시대, 내 몸의 신호에 귀 기울이는 지혜",
    excerpt: "스마트폰과 모니터 앞에서의 일상이 길어진 시대, 우리의 인체 반응을 이해하는 시각.",
    content: "현대 의학의 눈부신 발전에도 불구하고, 가장 강력한 건강 관리의 시작은 자신의 신체 변화에 일찍 관심을 갖는 것입니다. 정기 검진과 적절한 운동, 그리고 마음의 휴식이 어우러질 때 진정한 수명 연장과 삶의 질 향상이 이루어집니다.",
    categoryId: "opinion",
    imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-07-01T08:00:00.000Z",
    author: "이수현 전문의",
    doctorName: "이수현",
    doctorSpecialty: "내과 전문의 / 의학박사",
    hospitalName: "서울중앙내과의원",
    doctorImage: "https://images.unsplash.com/photo-1594824813566-78a930777176?auto=format&fit=crop&w=300&q=80",
    views: 740,
    likes: 65,
    isFeatured: false,
    isTrending: false,
    isBreaking: false
  },
  {
    id: "fb-6",
    title: "여성 호르몬 불균형 신호와 만성 피로 극복을 위한 영양 생활습관",
    excerpt: "생리 불순, 수면 장애, 무기력감 등 생체 리듬을 깨뜨리는 호르몬 변화에 대응하는 솔루션.",
    content: "30~40대 여성들이 자주 경험하는 만성 피로와 호르몬 변화는 식습관 가이드와 비타민D, 마그네슘 등 필요한 영양소를 조화롭게 섭취하는 것만으로도 큰 개선 효과를 기대할 수 있습니다.",
    categoryId: "womens-health",
    imageUrl: "https://images.unsplash.com/photo-1512290900673-3e110b9385d5?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-07-01T07:00:00.000Z",
    author: "최윤정 기자",
    views: 1120,
    likes: 95,
    isFeatured: false,
    isTrending: true,
    isBreaking: false
  },
  {
    id: "fb-7",
    title: "면역력 강화와 체질 개선을 돕는 한의학 체질별 보약 다이어리",
    excerpt: "환절기 기력 회복과 신체 균형을 잡아주는 한의학 전통 처방과 생활 요법.",
    content: "태음인, 소음인, 소양인, 태양인 등 각 체질별 특성에 맞춘 약재 조율과 뜸, 침 치료 기법을 소개합니다. 체질에 적합한 수면 습관과 음식 선택법이 건강을 유지하는 지름길입니다.",
    categoryId: "oriental-med",
    imageUrl: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-07-01T06:00:00.000Z",
    author: "정민우 한의사",
    views: 980,
    likes: 71,
    isFeatured: false,
    isTrending: false,
    isBreaking: false
  }
];

export const getFreshFallbackArticles = (): Article[] => fallbackArticles;
