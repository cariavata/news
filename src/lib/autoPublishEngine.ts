import { Article } from '../types';
import { MedicalTopic, CaseDemographic } from './autoPublishEngineTypes';
import {
  CHECKUP_TOPICS,
  WOMENS_HEALTH_TOPICS,
  SPINE_JOINT_TOPICS,
  ORIENTAL_MED_TOPICS,
  CATEGORY_TOPICS_MAP,
} from './medicalDatabase';
import {
  WOMENS_HEALTH_CASES,
  CHECKUP_CASES,
  SPINE_JOINT_CASES,
  ORIENTAL_MED_CASES,
  CASE_EXAMPLES,
} from './medicalData';

export {
  CHECKUP_TOPICS,
  WOMENS_HEALTH_TOPICS,
  SPINE_JOINT_TOPICS,
  ORIENTAL_MED_TOPICS,
  CATEGORY_TOPICS_MAP,
  WOMENS_HEALTH_CASES,
  CHECKUP_CASES,
  SPINE_JOINT_CASES,
  ORIENTAL_MED_CASES,
  CASE_EXAMPLES
};

export const TARGET_CATEGORIES = [
  { id: 'checkup', name: '건강검진' },
  { id: 'womens-health', name: '여성건강' },
  { id: 'spine-joint', name: '척추관절' },
  { id: 'oriental-med', name: '한의학' },
];

export const CLINICAL_ASPECTS = [
  '초기 원인 감별과',
  '바이오마커 수치 판독과',
  '골든타임 조기 발견을 위한',
  '비수술 맞춤 치료와',
  '증상별 단계적 진행과',
  '원인 모를 통증의 기전과',
  '자가 진단 기준과',
  '체질별 맞춤 처방과',
  '정밀 영상 판독 소견과',
  '식습관 교정과',
  '재발 없는 완치를 위한',
  '면역 환경 개선과',
  '최신 임상 가이드라인과',
  '연령별 고위험군 분석과',
  '약물 치료의 원리와',
  '통증 유발 요인 차단과',
  '만성 염증 완화와',
  '진료실 팩트체크와',
  '검사 주기 설정과',
  '급성기 초기 대처법과',
  '신경 압박 부위별 감별과',
  '생체 역학적 원인 분석과',
  '호르몬 불균형 교정과',
  '혈류 순환 장애 개선과',
  '기능적 체형 불균형과'
];

export const CLINICAL_GOALS = [
  '정밀 검진 가이드',
  '단계별 표준 치료법',
  '핵심 진단 체크포인트',
  '재발 방지 생활 수칙',
  '전문의 1:1 진료 솔루션',
  '근본 원인 치료 로드맵',
  '합병증 예방 관리법',
  '기혈 순환 회복 수칙',
  '단계별 비수술 재생 요법',
  '일상 속 건강 관리 가이드',
  '사후 관리 및 재활 운동',
  '자율신경 밸런스 회복법',
  '표준 치료 프로세스',
  '선제적 예방 관리',
  '비약물적 통합 케어',
  '관절 기능 복원 전략',
  '조직 재생 촉진 치료',
  '올바른 의학 상식',
  '환자 맞춤 검진 가이드',
  '응급 경고 징후 감별',
  '장기적 예후 관리법',
  '면역 자생력 회복 로드맵',
  '맞춤형 식이 영양 처방',
  '통증 완화 스트레칭 수칙',
  '생애주기별 맞춤 솔루션'
];

export const CLINICAL_MODIFIERS = [
  '',
  '총정리',
  '필수 지침',
  '집중 분석',
  '완전 정복',
  '임상 리포트',
  '실전 가이드',
  '핵심 요약',
  '전문의 조언',
  '단계별 로드맵',
  '최신 업데이트',
  '환자 필독서',
  '자가 점검표',
  '심층 해설',
  '건강 솔루션'
];

export const TITLE_STRUCTURES: ((t: string, a: string, g: string, m: string) => string)[] = [
  (t, a, g, m) => m ? `${t} ${a} ${g} ${m}` : `${t} ${a} ${g}`,
  (t, a, g, m) => m ? `${t}의 ${a} ${g} (${m})` : `${t}의 ${a} ${g}`,
  (t, a, g, m) => m ? `${t}: ${a} ${g} [${m}]`.replace(/[\[\]]/g, '') : `${t}: ${a} ${g}`,
  (t, a, g, m) => m ? `${t} 이상 소견 시 ${a} ${g} - ${m}` : `${t} 이상 소견 시 ${a} ${g}`,
  (t, a, g, m) => m ? `${t} 예방을 위한 ${a} ${g} ${m}` : `${t} 예방을 위한 ${a} ${g}`,
  (t, a, g, m) => m ? `${t} 환자를 위한 ${a} ${g} 안내` : `${t} 환자를 위한 ${a} ${g}`,
  (t, a, g, m) => m ? `${t}의 진행 단계별 ${a} ${g}` : `${t}의 진행 단계별 ${a} ${g}`,
  (t, a, g, m) => m ? `${t} 집중 분석: ${a} ${g}` : `${t} 집중 분석: ${a} ${g}`,
  (t, a, g, m) => m ? `${t} 조기 극복을 위한 ${a} ${g}` : `${t} 조기 극복을 위한 ${a} ${g}`,
  (t, a, g, m) => m ? `${t} 관리의 핵심: ${a} ${g}` : `${t} 관리의 핵심: ${a} ${g}`
];

/**
 * Calculates the integer day index relative to base date (2024-01-01).
 */
export function getDayIndex(dateStr: string): number {
  const baseDate = new Date('2024-01-01T00:00:00Z');
  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const diffTime = targetDate.getTime() - baseDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generates a natural, pseudo-randomized morning publication time for each day.
 * Returns hour (06~09 KST), minute (00~59), and second (00~59).
 */
export function getDeterministicPublishTime(safeDayIndex: number): { hour: number; minute: number; second: number } {
  // Morning hours: 6, 7, 8, 9 (KST)
  const hour = 6 + ((safeDayIndex * 7 + 3) % 4);
  const minute = (safeDayIndex * 17 + 23) % 60;
  const second = (safeDayIndex * 29 + 41) % 60;
  return { hour, minute, second };
}

/**
 * Generates clean, unique base topic name without brackets or redundant prefixes.
 */
function cleanTopicTitle(rawTitle: string): string {
  return rawTitle
    .replace(/\[.*?\]/g, '')
    .split('의 ')[0]
    .replace(/최적 주기와.*$/g, '')
    .replace(/원인과.*$/g, '')
    .replace(/돌파 시.*$/g, '')
    .replace(/예방 및.*$/g, '')
    .replace(/기준$/g, '')
    .trim();
}

/**
 * Deterministically generates a 100% unique, comprehensive medical article for any date.
 */
export function generateArticleForDate(dateStr: string): Article {
  const dayIndex = getDayIndex(dateStr);
  const safeDayIndex = dayIndex >= 0 ? dayIndex : Math.abs(dayIndex);
  
  // 1. Category Assignment (Balanced 4-day cycle)
  const categoryOrder = ['checkup', 'womens-health', 'spine-joint', 'oriental-med'];
  const categoryId = categoryOrder[safeDayIndex % categoryOrder.length];
  const categoryConfig = CATEGORY_TOPICS_MAP[categoryId] || CATEGORY_TOPICS_MAP['checkup'];
  const topicsList = categoryConfig.topics;
  
  // 2. Strict Bijective Radix Mapping for Guaranteed Unique Titles across all days up to 2040+
  const cycleIndex = Math.floor(safeDayIndex / 4);
  
  const tIdx = cycleIndex % topicsList.length;
  const rem1 = Math.floor(cycleIndex / topicsList.length);
  const aIdx = rem1 % CLINICAL_ASPECTS.length;
  const rem2 = Math.floor(rem1 / CLINICAL_ASPECTS.length);
  const gIdx = rem2 % CLINICAL_GOALS.length;
  const rem3 = Math.floor(rem2 / CLINICAL_GOALS.length);
  const sIdx = rem3 % TITLE_STRUCTURES.length;
  const rem4 = Math.floor(rem3 / TITLE_STRUCTURES.length);
  const mIdx = rem4 % CLINICAL_MODIFIERS.length;
  
  const topic = topicsList[tIdx];
  const cleanBase = cleanTopicTitle(topic.title);
  const selectedAspect = CLINICAL_ASPECTS[aIdx];
  const selectedGoal = CLINICAL_GOALS[gIdx];
  const selectedModifier = CLINICAL_MODIFIERS[mIdx];
  const structFn = TITLE_STRUCTURES[sIdx];
  
  // Generate headline
  let generatedTitle = structFn(cleanBase, selectedAspect, selectedGoal, selectedModifier);
  
  // Strictly sanitize any remaining brackets or double spaces
  generatedTitle = generatedTitle.replace(/[\[\]]/g, '').replace(/\s+/g, ' ').trim();
  
  // 3. Category & Condition-Specific Patient Case Selection
  // Strictly ensures female patients for women's health conditions
  const isFemaleCondition =
    categoryId === 'womens-health' ||
    /자궁|난소|생리|여성|갱년기|완경|질염|골반염|산후|임신|유방|HPV|다낭성/i.test(generatedTitle + ' ' + topic.tags.join(' '));

  let patientCase: CaseDemographic;
  if (isFemaleCondition) {
    const caseIndex = (safeDayIndex * 7 + 3) % WOMENS_HEALTH_CASES.length;
    patientCase = WOMENS_HEALTH_CASES[caseIndex];
  } else if (categoryId === 'spine-joint') {
    const caseIndex = (safeDayIndex * 7 + 3) % SPINE_JOINT_CASES.length;
    patientCase = SPINE_JOINT_CASES[caseIndex];
  } else if (categoryId === 'oriental-med') {
    const caseIndex = (safeDayIndex * 7 + 3) % ORIENTAL_MED_CASES.length;
    patientCase = ORIENTAL_MED_CASES[caseIndex];
  } else {
    const caseIndex = (safeDayIndex * 7 + 3) % CHECKUP_CASES.length;
    patientCase = CHECKUP_CASES[caseIndex];
  }
  
  // 4. Deterministic Natural Morning Publication Time (KST UTC+9)
  const { hour, minute, second } = getDeterministicPublishTime(safeDayIndex);
  const createdAt = `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}+09:00`;
  
  // 5. Views and Likes
  const articleTimestamp = new Date(createdAt).getTime();
  const daysAgo = Math.max(0, Math.floor((Date.now() - articleTimestamp) / (1000 * 60 * 60 * 24)));
  const views = Math.min(18500, 450 + (safeDayIndex * 37) % 350 + Math.max(0, daysAgo * 12));
  const likes = Math.max(15, Math.floor(views * 0.045) + (safeDayIndex % 18));
  
  // 6. Excerpt
  const excerpt = `${generatedTitle}. ${topic.shortSummary} ${patientCase.location} ${patientCase.ageGender} 환자의 실제 진료 및 회복 사례를 바탕으로 단계별 임상 로드맵을 제시합니다.`;
  
  // 7. Rich Markdown Long-Form Content
  const markdownContent = `## 📌 오늘의 핵심 의학 브리핑: ${generatedTitle}

${topic.shortSummary}

현대 의학에서 **${cleanBase}**은(는) 조기 발견과 체계적인 원인 감별이 치료 성패의 90% 이상을 좌우하는 대표적인 질환입니다. 본 의학 리포트에서는 ${selectedAspect} ${selectedGoal}을(를) 중점적으로 다루며, 환자 개개인의 건강 상태에 맞춘 최적의 의학적 로드맵을 안내해 드립니다.

---

## 🔬 발병 기전과 병리학적 특성

${topic.pathology}

### 💡 생물학적 기전 및 분자·생역학적 경로
${topic.mechanism}

---

## 🩺 진료실 정밀 검사 체계와 진단 바이오마커

신속하고 정확한 진단을 위해 임상 현장에서 표준적으로 시행되는 핵심 검사 및 바이오마커는 다음과 같습니다.

### 1. 주요 검사 항목
${topic.diagnosticTests.map((t, idx) => `- **${idx + 1}. ${t}**: 병변의 진행도 및 조직학적 손상 여부를 정밀하게 측정합니다.`).join('\n')}

### 2. 핵심 바이오마커 & 수치 해석
${topic.biomarkers.map((b) => `- **${b}**: 정상 기준치를 벗어날 경우 전문의의 즉각적인 개입이 필요합니다.`).join('\n')}

---

## 📋 임상 진행 단계 및 단계별 표준 치료 로드맵

${topic.stages.map((st) => `### 📍 ${st.stage}
- **임상 양상**: ${st.desc}
- **권장 의학적 처치**: ${st.medicalAction}`).join('\n\n')}

---

## 🔍 실제 내원 환자 임상 치료 사례 보고

> **[환자 프로필]**
> - **거주지**: ${patientCase.location}
> - **인적사항**: ${patientCase.ageGender} (${patientCase.occupation})
> - **내원 시 주소(C.C)**: ${patientCase.initialSymptom}

### 1. 정밀 진단 소견
${patientCase.diagnosticDetail}

### 2. 맞춤형 통합 치료 과정
${patientCase.treatmentCourse}

### 3. 치료 경과 및 예후
${patientCase.outcomeMetric}

> **담당 주치의 소견**  
> "${patientCase.doctorQuote}"

---

## ⚠️ 절대 방치하면 안 되는 4대 적색 경고 징후 (Red Flags)

다음과 같은 증상이 동반될 경우 단순 경과 관찰을 멈추고 즉시 전문 의료기관을 방문해야 합니다.

${topic.redFlags.map((rf, idx) => `${idx + 1}. **${rf}**`).join('\n')}

---

## 💡 흔한 의학적 오해와 진실 (Myths vs Facts)

${topic.mythsVsFacts.map((mf) => `### ❓ 오해: "${mf.myth}"
> **✔ 진실 (Fact)**: ${mf.fact}`).join('\n\n')}

---

## 🥗 일상 식습관 및 부위별 맞춤 재활 수칙

치료 효과를 극대화하고 재발을 방지하기 위한 생활 의학 가이드입니다.

${topic.homeCareTips.map((tip, idx) => `${idx + 1}. **${tip}**`).join('\n')}

---

## 💬 진료실 전문의 1문 1답 (Doctor Q&A)

${topic.qaPairs.map((qa) => `### 🙋 Q. ${qa.question}
**👨‍⚕️ A.** ${qa.answer}`).join('\n\n')}

---

## 🏥 데일리펄스 의학전문위원단의 총평

모든 질환은 증상이 심화되기 전 **초기 골든타임**을 포착하여 원인 중심의 치료를 진행할 때 비수술적 요법만으로도 가장 빠른 회복을 기대할 수 있습니다. 위 증상이 의심된다면 자가 판단으로 지체하지 마시고 전문의의 1:1 정밀 진료를 받으시길 권장합니다.
`;

  return {
    id: `auto-${dateStr}`,
    title: generatedTitle,
    excerpt,
    content: markdownContent,
    categoryId,
    imageUrl: '',
    author: '데일리펄스 의학전문팀',
    createdAt,
    isFeatured: false,
    isTrending: safeDayIndex % 5 === 0,
    isBreaking: safeDayIndex % 11 === 0,
    views,
    likes,
    tags: topic.tags
  };
}

/**
 * Returns all auto-published articles that have ALREADY been published up to current time (KST).
 * Strictly filters out any future articles.
 */
export function getPublishedAutoArticles(limitCount: number = 365): Article[] {
  const articles: Article[] = [];
  const now = new Date();
  const nowTime = now.getTime();
  
  // Calculate current date in KST
  const kstOffset = 9 * 60;
  const localOffset = now.getTimezoneOffset();
  const kstDate = new Date(nowTime + (kstOffset + localOffset) * 60 * 1000);
  
  const minDate = new Date('2024-01-01T00:00:00Z');
  const currentDate = new Date(kstDate.getFullYear(), kstDate.getMonth(), kstDate.getDate());
  
  let count = 0;
  // Look back up to minDate
  while (currentDate >= minDate && count < limitCount) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const article = generateArticleForDate(dateStr);
    const articleTime = new Date(article.createdAt).getTime();
    
    // STRICT FILTER: Only include articles whose scheduled publication timestamp has passed
    if (articleTime <= nowTime) {
      articles.push(article);
      count++;
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return articles;
}

/**
 * Directly returns auto-published articles for a specific category up to current time.
 */
export function getPublishedAutoArticlesForCategory(categoryId: string, limitCount: number = 100): Article[] {
  const allArticles = getPublishedAutoArticles(limitCount * 4 + 20);
  return allArticles.filter(a => a.categoryId === categoryId).slice(0, limitCount);
}

/**
 * Fetches an auto-published article by its auto ID (e.g., auto-2026-08-31).
 */
export function getAutoArticleById(id: string): Article | undefined {
  if (!id || !id.startsWith('auto-')) return undefined;
  const dateStr = id.replace('auto-', '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return undefined;
  return generateArticleForDate(dateStr);
}
