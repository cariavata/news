import { MedicalTopic, CaseDemographic } from './autoPublishEngineTypes';

export const CASE_EXAMPLES: CaseDemographic[] = [
  {
    location: '은평구 불광동',
    ageGender: '30대 남성',
    occupation: 'IT 소프트웨어 개발자',
    initialSymptom: '장시간 컴퓨터 작업 후 발생한 만성 소화불량, 식후 상복부 팽만감과 잦은 속쓰림 및 만성 피로',
    diagnosticDetail: '위내시경 검사상 표재성 위염 확인 및 한방 복부 9구역 정밀 복진(腹診) 상 명치·중완혈 부위의 단단한 담적(痰積) 확인',
    treatmentCourse: '위장 외벽의 독소와 노폐물을 배출하는 건비화담(健脾化痰) 맞춤 한약 6주 투약 및 복부 심부 온열 뜸 요법, 식후 20분 보행 지도',
    outcomeMetric: '식후 더부룩함 및 역류 증상 90% 호전, 명치 압통 소실 및 일상 업무 피로도 대폭 경감',
    doctorQuote: '기능성 소화불량은 위장관 외벽의 운동성 저하와 자율신경 불균형이 주원인이므로, 점막 치료와 함께 굳어진 복부 근막을 풀어주는 것이 핵심입니다.'
  },
  {
    location: '은평구 연신내',
    ageGender: '50대 여성',
    occupation: '자영업 대표',
    initialSymptom: '야간에 심해지는 극심한 어깨 통증으로 인한 수면 장애 및 팔을 뒤로 돌리지 못하는 가동 범위 제한',
    diagnosticDetail: '정밀 관절 초음파 및 영상의학적 검사 결과 회전근개 극상근 건염 및 유착성 관절낭염(오십견 2기/동결견) 진단',
    treatmentCourse: '초음파 유도하 관절낭 수압확장술을 통한 관절막 박리 및 체외충격파(ESWT) 4회, 1:1 도수 관절가동술 병행',
    outcomeMetric: '야간 수면통 100% 소실, 팔의 외전 각도 80도에서 165도까지 정상화되어 일상 복귀',
    doctorQuote: '오십견은 방치 시 관절낭 섬유화가 영구적으로 굳을 수 있어, 통증 초기 관절낭을 유연하게 확장하는 비수술 치료가 필수적입니다.'
  },
  {
    location: '은평구 구파발',
    ageGender: '40대 남성',
    occupation: '금융회사 팀장',
    initialSymptom: '국가건강검진에서 우연히 발견된 공복혈당 122mg/dL 및 혈청 중성지방 260mg/dL 상승 소견',
    diagnosticDetail: '정밀 당화혈색소(HbA1c) 6.2%(당뇨 전단계) 및 복부 정밀 초음파상 중등도 비알코올성 지방간(NAFLD) 확인',
    treatmentCourse: '연속혈당측정기(CGM) 기반 식후 혈당 스파이크 모니터링, 저GI 탄수화물 제한 식단 및 주 4회 인터벌 유산소 트레이닝',
    outcomeMetric: '3개월 후 당화혈색소 5.4%로 정상 진입, 공복혈당 92mg/dL 안정화 및 체중 6.8kg 감량 성공',
    doctorQuote: '당뇨 전단계는 췌장 베타세포 기능이 50% 살아있는 골든타임으로, 식후 30분 걷기와 혈당 스파이크 억제만으로도 90% 이상 정상화가 가능합니다.'
  },
  {
    location: '은평구 갈현동',
    ageGender: '60대 여성',
    occupation: '가정주부',
    initialSymptom: '아침 기상 시 무릎 관절의 뻣뻣함과 계단을 내려갈 때 무릎 안쪽에 전해지는 시큰거리는 날카로운 통증',
    diagnosticDetail: '무릎 체중 부하 X-ray 검사상 내측 관절 간격 협소화 및 켈그렌-로렌스 2기(K-L grade 2) 퇴행성 관절염 확진',
    treatmentCourse: '연골 보호 및 윤활 작용의 PN(폴리뉴클레오티드/콘쥬란) 관절강 주사 3회 치료 및 대퇴사두근 강화 재활 운동 지도',
    outcomeMetric: '보행 통증 지수(VAS 7점 → 2점) 대폭 감소, 계단 보행 시 불안정성 해소 및 평지 1만 보 산책 달성',
    doctorQuote: '초중기 퇴행성 관절염은 연골이 완전히 닳기 전에 안전한 고분자 연골 보호 주사와 허벅지 근육 강화를 병행해야 인공관절 수술을 예방할 수 있습니다.'
  },
  {
    location: '은평구 녹번동',
    ageGender: '40대 여성',
    occupation: '초등학교 교사',
    initialSymptom: '생리량이 평소의 2배 이상 급증하며 계단을 오를 때 발생하는 어지럼증과 극심한 무기력증',
    diagnosticDetail: '혈액검사상 혈색소(Hb) 9.2g/dL, 혈청 페리틴 5.4ng/mL의 중증 철분 결핍성 빈혈 및 골반 초음파상 3.8cm 자궁근종 확인',
    treatmentCourse: '고용량 정맥 철분 주사 투여, 자궁근종 추적 관찰 및 비타민C 병용 철분 흡수 식단, 한방 보기보혈(補氣補血) 탕약 처방',
    outcomeMetric: '페리틴 수치 48ng/mL로 정상 회복, 만성 피로와 계단 보행 시 호흡 곤란 완벽 해소',
    doctorQuote: '여성의 만성 피로는 단순 과로가 아닌 자궁근종에 의한 잠재적 출혈성 빈혈일 가능성이 높아 정밀 혈청 검사가 필수적입니다.'
  },
  {
    location: '은평구 역촌동',
    ageGender: '50대 남성',
    occupation: '운송업 종사자',
    initialSymptom: '장시간 운전 중 오른쪽 엉덩이부터 허벅지 뒤쪽, 종아리 바깥쪽으로 전기가 통하듯 찌릿하게 뻗치는 극심한 방사통',
    diagnosticDetail: '요추 정밀 MRI 검사상 L4-L5 추간판 후방 중심-우측 탈출증으로 인한 L5 신경근 압박 소견',
    treatmentCourse: '특수 영상 투시(C-arm) 유도하 경막외 신경차단술 2회 및 척추 중립 코어 재활 운동(맥길 빅3), 척추 추나요법',
    outcomeMetric: '하지 방사통 85% 호전(VAS 8점 → 1점), 장시간 운전 시에도 저림 증상 없이 안정적인 직무 복귀',
    doctorQuote: '디스크로 인한 신경근 염증은 정밀 영상 유도 주사로 급성 부종을 가라앉힌 뒤, 척추 중립 코어를 구축하는 비수술 로드맵이 가장 안전합니다.'
  },
  {
    location: '은평구 대조동',
    ageGender: '30대 여성',
    occupation: '웹디자이너',
    initialSymptom: '불규칙한 생리 주기(60~90일 주기)와 턱 주변의 만성 화농성 여드름, 체중 증가',
    diagnosticDetail: '골반 초음파상 다낭성 난소 양상(PCO morphology) 및 혈중 LH/FSH 비율 역전, 인슐린 저항성 지표 상승',
    treatmentCourse: '마이오-이노시톨 복합제 복용, 저당(Low GI) 식단 전환, 자율신경 안정을 위한 하복부 온열 침구 요법 8주',
    outcomeMetric: '치료 2개월 차부터 30일 정상 생리 주기 자율 회복, 피부 트러블 80% 감소 및 체중 4kg 감량',
    doctorQuote: '다낭성 난소 증후군은 난소 자체의 문제뿐 아니라 인슐린 저항성을 개선하는 대사 교정이 병행되어야 배란 주기가 자연 회복됩니다.'
  },
  {
    location: '은평구 진관동',
    ageGender: '30대 여성',
    occupation: '워킹맘',
    initialSymptom: '출산 후 아기를 안아 올릴 때 엄지손가락 쪽 손목에 찌릿한 통증과 숟가락질 시 발생하는 불편감',
    diagnosticDetail: '핑켈스타인 검사(Finkelstein Test) 양성 및 초음파상 장외전건·단신근건의 활액막 비후(드퀘르벵 건초염)',
    treatmentCourse: '손목 관절 고정보호대 착용, 건초 내 소염 약침 및 포커스형 체외충격파(ESWT) 3회 치료',
    outcomeMetric: '엄지손가락 움직임 시 통증 완전 소실, 아이 안기와 가사 동작 무리 없이 수행',
    doctorQuote: '산후 건초염은 호르몬 변화로 인대가 이완된 상태에서 반복 하중이 가해져 발생하므로, 관절 휴식과 정밀 충격파 재생 치료가 필수입니다.'
  },
  {
    location: '은평구 응암동',
    ageGender: '50대 남성',
    occupation: '외식업 대표',
    initialSymptom: '가슴이 답답하고 꽉 막힌 듯한 느낌, 야간 상열감과 심장 두근거림 및 잠들기 어려운 극심한 불면증',
    diagnosticDetail: '심장내과 심전도/심초음파상 이상 소견 없음 확인 후 한의학적 간기울결(肝氣鬱結) 및 심화(心火)로 인한 화병(火病) 진단',
    treatmentCourse: '상초의 열을 내리고 신경계를 안정시키는 분심기음 및 귀비탕 가감방 4주 투약, 신문혈·전중혈 침 치료',
    outcomeMetric: '수면 잠복기 90분에서 15분 이내로 단축, 가슴 답답함 및 야간 식은땀 100% 소실',
    doctorQuote: '화병은 기질적 이상이 없어도 자율신경계가 극도로 흥분된 상태이므로, 심열(心熱)을 식히고 기혈 순환을 돕는 한방 처방이 탁월한 효과를 냅니다.'
  },
  {
    location: '은평구 신사동',
    ageGender: '70대 남성',
    occupation: '은퇴자',
    initialSymptom: '정기 건강검진 경동맥 초음파에서 발견된 1.3mm 내중막 비후 및 죽상경화성 석회화 플라크',
    diagnosticDetail: '뇌혈관 질환 고위험군 분류, 혈중 LDL 콜레스테롤 168mg/dL 및 맥파전달속도(PWV) 검사상 혈관 탄력도 저하',
    treatmentCourse: '스타틴 계열 지질 강하제 요법 병행, 저염 지중해식 식단 지도, 매일 40분 평지 걷기 루틴 확립',
    outcomeMetric: 'LDL 수치 70mg/dL로 안정화, 경동맥 플라크 크기 안정 유지 및 혈관 탄력도 개선',
    doctorQuote: '경동맥 플라크는 뇌경색의 주요 전조이므로, 약물 치료와 식습관 교정을 통해 플라크를 단단하게 안정화시켜 파열을 막는 것이 핵심입니다.'
  },
  {
    location: '서대문구 홍제동',
    ageGender: '40대 남성',
    occupation: '연구원',
    initialSymptom: '잦은 야근과 회식 후 급격한 피로감과 오른쪽 상복부의 묵직하고 뻐근한 불쾌감',
    diagnosticDetail: '간기능 혈액검사상 AST 78 IU/L, ALT 95 IU/L, r-GTP 130 IU/L 상승 및 초음파상 지방간염 확인',
    treatmentCourse: '2개월간 완전 금주, 밀크씨슬 및 항산화 수액 요법, 간세포 해독을 위한 청간(淸肝) 한방 탕약 병행',
    outcomeMetric: 'AST 22, ALT 25, r-GTP 32 IU/L로 전 항목 정상화, 만성 피로도 대폭 개선',
    doctorQuote: '간은 70%가 망가질 때까지 증상이 없으므로, 간수치 상승이 발견되었을 때 즉시 생활습관과 항산화 해독 치료를 시작해야 간섬유화를 막을 수 있습니다.'
  },
  {
    location: '마포구 상암동',
    ageGender: '30대 남성',
    occupation: '방송 프로듀서',
    initialSymptom: '스트레스 상황에서 발생하는 급작스러운 복통과 잦은 설사, 가스 팽만감으로 인한 외출 불안증',
    diagnosticDetail: '대장내시경 검사상 기질적 병변 없음 확인 후 로마 진단 기준(Rome IV)에 따른 과민성대장증후군(IBS-설사형) 진단',
    treatmentCourse: '저포드맵(Low-FODMAP) 식이요법 처방, 장내 유익균 프로바이오틱스 및 장관 운동 정상화 곽향정기산 투약',
    outcomeMetric: '배변 횟수 하루 4~5회에서 1회로 안정화, 복부 가스 팽만감 90% 소실',
    doctorQuote: '장과 뇌는 긴밀히 연결된 장-뇌 축(Gut-Brain Axis)을 이루고 있어, 장점막 안정과 자율신경 치료를 함께 접근해야 만성 과민증이 잡힙니다.'
  },
  {
    location: '고양시 덕양구 삼송동',
    ageGender: '50대 여성',
    occupation: '간호사',
    initialSymptom: '완경 2년 후 급격히 느껴지는 손가락 마디 통증과 계단 이용 시 허리 뻐근함',
    diagnosticDetail: 'DEXA 이중에너지 X선 골밀도 검사상 요추 T-score -2.2(골감소증) 및 혈중 비타민D 결핍(14ng/mL)',
    treatmentCourse: '고용량 비타민D 주사 및 비타민K2 복합 칼슘제 투약, 골형성 촉진을 위한 체중 부하 계단 오르기 운동 처방',
    outcomeMetric: '1년 후 T-score -1.7로 대폭 개선, 척추 압박골절 위험 감소 및 손가락 관절통 호전',
    doctorQuote: '완경 후 첫 5년은 에스트로겐 결핍으로 평생 뼈의 3분의 1이 빠져나가는 시기이므로, 골다공증 전단계부터 적극적인 영양·운동 치료가 필수적입니다.'
  },
  {
    location: '서대문구 남가좌동',
    ageGender: '20대 남성',
    occupation: '취업준비생',
    initialSymptom: '하루 10시간 이상 인강 시청 후 발생한 뒷목 뻐근함, 승모근 결림 및 오후마다 반복되는 관자놀이 편두통',
    diagnosticDetail: '경추 X-ray 검사상 경추 C자 만곡이 완전히 소실되고 역C자로 꺾인 중증 거북목 증후군 및 후두신경 압박',
    treatmentCourse: '경추 도수교정 및 체외충격파를 통한 승모근 통증유발점(TP) 제거, 턱 당기기(Chin-Tuck) 자세 교정',
    outcomeMetric: '경추 전만 각도 12도 회복, 만성 두통 빈도 주 5회에서 월 1회 미만으로 극감',
    doctorQuote: '거북목으로 인한 긴장성 두통은 진통제만으로는 해결되지 않으며, 경추의 바른 C자 곡선을 회복시키는 구조적 교정이 근본 치료입니다.'
  }
];

export interface MedicalTopicData {
  id: string;
  name: string;
  subAspects: {
    focusTitle: string;
    clinicalAngle: string;
    keyMechanism: string;
    diagnosticHighlight: string;
    treatmentHighlight: string;
    preventionTip: string;
    qna: { q: string; a: string };
  }[];
  pathology: string;
  mechanism: string;
  biomarkers: string[];
  diagnosticTests: string[];
  medicalTreatments: string[];
  homeCareTips: string[];
  stages: { stage: string; desc: string; medicalAction: string }[];
  redFlags: string[];
  mythsVsFacts: { myth: string; fact: string }[];
  demographicRisks: { group: string; risk: string; advice: string }[];
  tags: string[];
}
