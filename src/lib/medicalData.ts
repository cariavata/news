import { CaseDemographic } from './autoPublishEngineTypes';

export const WOMENS_HEALTH_CASES: CaseDemographic[] = [
  {
    location: '은평구 대조동',
    ageGender: '20대 여성',
    occupation: '대학원생',
    initialSymptom: '매달 반복되는 극심한 생리통으로 인한 응급실 내원 및 배변통, 만성 하복부 팽만감',
    diagnosticDetail: '골반 조영 MRI 및 정밀 초음파상 좌측 난소 4.2cm 자궁내막종(초콜릿 낭종) 및 골반강 유착 소견',
    treatmentCourse: '복강경 최소침습 난소 보존적 절제술 및 디에노게스트 호르몬 억제 요법, 골반강 혈류 순환을 돕는 온침 및 어혈 제거 한약 병행',
    outcomeMetric: '생리통 점수(VAS 9점 → 1점) 소실, 난소 기능 지표(AMH) 안정적 유지 및 일상 학업 정상 복귀',
    doctorQuote: '자궁내막증은 조기 발견 시 난소 조직을 최대한 보존하며 약물 및 한방 복합 요법으로 재발과 난임을 철저히 예방할 수 있습니다.'
  },
  {
    location: '은평구 녹번동',
    ageGender: '40대 여성',
    occupation: '초등학교 교사',
    initialSymptom: '생리량이 평소의 2배 이상 급증하며 계단을 오를 때 발생하는 어지럼증과 극심한 무기력증',
    diagnosticDetail: '혈액검사상 혈색소(Hb) 9.2g/dL, 혈청 페리틴 5.4ng/mL의 중증 철분 결핍성 빈혈 및 골반 초음파상 4.5cm 자궁근종 및 선근증 확인',
    treatmentCourse: '고강도 집속초음파(HIFU)를 이용한 비수술 자궁근종 소작술 및 고용량 정맥 철분 주사, 보기보혈(補氣補血) 한방 처방',
    outcomeMetric: '자궁근종 부피 70% 축소, 혈색소 13.1g/dL 정상 회복 및 생리 과다와 만성 피로 완벽 해소',
    doctorQuote: '자궁근종과 선근증은 자궁을 적출하지 않고도 정밀 비수술 시술과 통합 의학적 접근으로 안전하게 치료할 수 있습니다.'
  },
  {
    location: '은평구 갈현동',
    ageGender: '30대 여성',
    occupation: 'IT 기획자',
    initialSymptom: '불규칙한 생리 주기(60~90일 무배란)와 턱 주변의 만성 화농성 여드름, 원인 모를 체중 증가',
    diagnosticDetail: '골반 정밀 초음파상 다낭성 난소 양상(PCO morphology) 및 혈중 LH/FSH 비율 2.5:1 역전, 인슐린 저항성 지표(HOMA-IR) 상승',
    treatmentCourse: '마이오-이노시톨 복합제 복용, 저당(Low GI) 식단 전환 코칭, 난소 혈류와 대사를 개선하는 조경(調經) 탕약 및 하복부 뜸 8주',
    outcomeMetric: '치료 2개월 차부터 28~30일 규칙적 자연 생리 주기 회복, 피부 트러블 85% 호전 및 체중 5kg 감량',
    doctorQuote: '다낭성 난소 증후군은 난소 자체의 문제뿐 아니라 인슐린 저항성을 개선하는 대사 교정이 병행되어야 배란 주기가 자연 회복됩니다.'
  },
  {
    location: '고양시 덕양구 삼송동',
    ageGender: '50대 여성',
    occupation: '프리랜서 번역가',
    initialSymptom: '완경 전후 하루 수십 번 발생하는 극심한 안면홍조, 야간 식은땀으로 인한 수면 장애 및 감정 기복',
    diagnosticDetail: '호르몬 검사상 혈청 FSH 45 mIU/mL(완경 진단) 및 DEXA 골밀도 검사상 요추 T-score -2.3(골감소증)',
    treatmentCourse: '개인 맞춤형 저용량 경피 호르몬 대체요법(HRT) 및 자음강화(滋陰降火) 한방 제제, 골강화 체중부하 운동 요법',
    outcomeMetric: '안면홍조 및 야간 수면장애 95% 소실, 숙면 회복 및 1년 후 골밀도 T-score -1.8로 호전',
    doctorQuote: '완경 후 갱년기 증상은 참는 것이 아니라 조기에 안전한 저용량 호르몬 요법과 생활 관리를 시작해 혈관과 골다공증을 함께 지키는 것이 정답입니다.'
  },
  {
    location: '은평구 응암동',
    ageGender: '30대 여성',
    occupation: '그래픽 디자이너',
    initialSymptom: '국가 자궁경부암 무료 검진에서 발견된 비정형 상피세포(ASC-US) 소견 및 고위험군 HPV 16형 양성',
    diagnosticDetail: '질확대경 조준 생검 결과 자궁경부 저등급 이형성증(CIN 1) 진단 및 질내 유익균 총량 급감 확인',
    treatmentCourse: '면역 증강 한방 질 점막 훈증 요법 및 고주파 온열 치료, 락토바실러스 질유래 유산균 복용 및 6개월 면역 프로토콜',
    outcomeMetric: '6개월 후 재검사에서 고위험군 HPV 바이러스 음전(완전 소멸) 확인 및 자궁경부 세포진 검사 정상 판독',
    doctorQuote: '자궁경부 이형성증 초기 단계는 질 점막의 국소 면역력을 강화하고 체내 바이러스 배출을 유도하는 보존적 치료로 완치될 수 있습니다.'
  },
  {
    location: '은평구 진관동',
    ageGender: '30대 여성',
    occupation: '마케팅 디렉터',
    initialSymptom: '출산 후 면역력 저하로 반복되는 만성 질염 및 하복부 묵직한 통증, 질 건조감',
    diagnosticDetail: '질 분비물 정밀 균검사(STD 12종)상 만성 세균성 질염 및 골반 내 가벼운 염증 울혈 확인',
    treatmentCourse: '항생제 남용을 방지하는 천연 한방 소염 세정 요법 및 청열이습(淸熱利濕) 탕약, 골반 기저근 회복 케겔 운동',
    outcomeMetric: '분비물 및 악취 100% 소실, 재발 없는 건강한 질내 산도(pH 4.0) 환경 확립',
    doctorQuote: '만성 여성 질환은 유익균 생태계를 복원하고 골반강 온도를 정상화하는 근본 면역 치료가 재발 방지의 핵심입니다.'
  }
];

export const CHECKUP_CASES: CaseDemographic[] = [
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
    location: '고양시 덕양구 삼송동',
    ageGender: '50대 여성',
    occupation: '간호사',
    initialSymptom: '정기 건강검진 골다공증 검사에서 T-score 저하 소견 및 손가락 마디 뻐근함',
    diagnosticDetail: 'DEXA 이중에너지 X선 골밀도 검사상 요추 T-score -2.2(골감소증) 및 혈중 비타민D 결핍(14ng/mL)',
    treatmentCourse: '고용량 비타민D 주사 및 비타민K2 복합 칼슘제 투약, 골형성 촉진을 위한 체중 부하 계단 오르기 운동 처방',
    outcomeMetric: '1년 후 T-score -1.7로 대폭 개선, 척추 압박골절 위험 감소 및 뼈 건강 회복',
    doctorQuote: '골감소증 시기부터 적극적인 영양·운동 치료를 시작해야 노년기 골절 위험을 선제적으로 예방할 수 있습니다.'
  },
  {
    location: '마포구 상암동',
    ageGender: '30대 남성',
    occupation: '방송 프로듀서',
    initialSymptom: '대장내시경 검진에서 발견된 다발성 용종 및 평소 잦은 묽은 변과 복부 가스 팽만',
    diagnosticDetail: '정밀 대장내시경하 0.8cm 선종성 용종 2개 당일 완전 절제술 시행 및 조직병리학적 검사 완료',
    treatmentCourse: '저잔사 식이요법 및 장점막 회복 프로바이오틱스 복용, 2년 후 정기 추적 내시경 스케줄 수립',
    outcomeMetric: '출혈이나 천공 등 합병증 없이 완전 회복, 대장암 전구 병변 조기 차단 완료',
    doctorQuote: '선종성 대장 용종은 5~10년에 걸쳐 암으로 발전하므로, 발견 즉시 내시경적 완전 절제가 최고의 예방법입니다.'
  },
  {
    location: '은평구 역촌동',
    ageGender: '50대 여성',
    occupation: '공인중개사',
    initialSymptom: '심혈관 정밀 검진에서 관상동맥 석회화 지수(CACS) 150점 상승 및 가벼운 흉부 압박감',
    diagnosticDetail: '심장 3D-CT 검사상 좌전하행지(LAD) 30% 경증 협착 확인 및 죽상동맥경화증 조기 진단',
    treatmentCourse: '항혈소판제 및 지질 치료제 처방, 유산소 심폐 지구력 훈련 및 항산화 식이요법 진행',
    outcomeMetric: '운동 부하 검사상 심근 허혈 소견 없음 확인, 안정적 혈류 유지 및 흉부 답답함 해소',
    doctorQuote: '심장 CT를 통한 관상동맥 석회화 조기 발견은 급성 심근경색을 사전에 차단하는 가장 확실한 골든타임 검사입니다.'
  }
];

export const SPINE_JOINT_CASES: CaseDemographic[] = [
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
    location: '서대문구 남가좌동',
    ageGender: '20대 남성',
    occupation: '취업준비생',
    initialSymptom: '하루 10시간 이상 모니터 시청 후 발생한 뒷목 뻐근함, 승모근 결림 및 오후마다 반복되는 관자놀이 편두통',
    diagnosticDetail: '경추 X-ray 검사상 경추 C자 만곡이 완전히 소실되고 역C자로 꺾인 중증 거북목 증후군 및 후두신경 압박',
    treatmentCourse: '경추 도수교정 및 체외충격파를 통한 승모근 통증유발점(TP) 제거, 턱 당기기(Chin-Tuck) 자세 교정',
    outcomeMetric: '경추 전만 각도 12도 회복, 만성 두통 빈도 주 5회에서 월 1회 미만으로 극감',
    doctorQuote: '거북목으로 인한 긴장성 두통은 진통제만으로는 해결되지 않으며, 경추의 바른 C자 곡선을 회복시키는 구조적 교정이 근본 치료입니다.'
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
    location: '마포구 서교동',
    ageGender: '40대 남성',
    occupation: '건축 설계사',
    initialSymptom: '서 있거나 걸을 때 엉치부터 종아리까지 당기고 저려 10분 이상 걷지 못하는 신경성 파행 증상',
    diagnosticDetail: '요추 MRI 검사상 L4-L5 중심성 척추관 협착증(척추관 단면적 70mm² 이하 협소화) 진단',
    treatmentCourse: '비수술 풍선확장술을 통한 신경관 유착 박리 및 척추 감압 치료, 둔근 강화 필라테스 재활',
    outcomeMetric: '연속 보행 가능 거리 200m에서 2km 이상으로 대폭 증가, 보행 시 다리 저림 소실',
    doctorQuote: '척추관 협착증은 신경 통로의 물리적 압박과 유착을 풀어주는 비수술 시술로도 수술 없이 걷는 즐거움을 되찾을 수 있습니다.'
  }
];

export const ORIENTAL_MED_CASES: CaseDemographic[] = [
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
    location: '은평구 연신내',
    ageGender: '40대 여성',
    occupation: '학원 강사',
    initialSymptom: '만성 스트레스로 인한 두통, 어지럼증, 손발 저림과 기립 시 발생하는 핑 도는 현기증',
    diagnosticDetail: '자율신경 균형 검사(HRV)상 교감신경 과항진 및 부교감신경 저하(자율신경실조증), 기혈허약(氣血虛弱) 판정',
    treatmentCourse: '심신 안정과 뇌 혈류를 개선하는 천왕보심단 가감방 6주 복용 및 경혈 약침, 두경부 근막 이완 침 치료',
    outcomeMetric: '현기증 및 두통 빈도 80% 감소, 자율신경 활성도 정상 범위 회복 및 일상 활력 증진',
    doctorQuote: '원인 모를 만성 어지럼증과 두통은 자율신경의 균형을 바로잡고 뇌로 가는 혈류 순환을 열어주는 한방 치료가 매우 효과적입니다.'
  },
  {
    location: '서대문구 북가좌동',
    ageGender: '30대 여성',
    occupation: '프리랜서 디자이너',
    initialSymptom: '사계절 내내 얼음장처럼 차가운 손발(수족냉증), 아랫배 냉증 및 만성 소화 장애',
    diagnosticDetail: '체열 진단 검사(DITI)상 사지 말단 및 하복부 저체온 확인, 비신양허(脾腎陽虛)로 인한 말초 순환 부전 진단',
    treatmentCourse: '체내 심부 온도를 높이는 당귀사역탕 가감방 4주 투약, 쑥뜸 온열 요법 및 족욕 습관 지도',
    outcomeMetric: '손발 체온 2.5도 상승 확인, 아랫배 온기 회복 및 만성 피로와 냉증 90% 개선',
    doctorQuote: '수족냉증은 단순한 체질이 아닌 체내 양기(陽氣) 부족과 혈류 정체이므로, 몸속 온도를 올리는 한약 치료로 근본 개선이 가능합니다.'
  },
  {
    location: '마포구 상암동',
    ageGender: '30대 남성',
    occupation: '방송 PD',
    initialSymptom: '스트레스 상황에서 발생하는 급작스러운 복통과 잦은 설사, 가스 팽만감으로 인한 외출 불안증',
    diagnosticDetail: '기질적 병변 없는 과민성대장증후군(IBS-설사형) 확인 및 간비불화(肝脾不和) 진단',
    treatmentCourse: '장 점막을 안정시키고 자율신경을 다스리는 곽향정기산 및 통사요방 처방, 복부 뜸 요법',
    outcomeMetric: '배변 횟수 하루 4~5회에서 1회로 안정화, 복부 가스 팽만감 90% 소실',
    doctorQuote: '장과 뇌는 긴밀히 연결된 장-뇌 축(Gut-Brain Axis)을 이루고 있어, 장점막 안정과 자율신경 치료를 함께 접근해야 만성 과민증이 잡힙니다.'
  },
  {
    location: '고양시 덕양구 화정동',
    ageGender: '50대 여성',
    occupation: '회사원',
    initialSymptom: '상체로 치솟는 열감(상열감)과 이로 인한 안면부 홍조, 가슴 답답함 및 불안 초조감',
    diagnosticDetail: '신음부족(腎陰不足) 및 간양상항(肝陽上亢)으로 인한 갱년기 화병 및 혈허(血虛) 소견',
    treatmentCourse: '음혈을 보충하고 허열을 내려주는 가미소요산 및 지백지황탕 처방, 귓바퀴 이침(耳針) 요법 병행',
    outcomeMetric: '상열감 발생 빈도 10회에서 1회 미만으로 감소, 가슴 답답함 소실 및 안정적 수면 유지',
    doctorQuote: '여성 갱년기의 상열감과 신경 증상은 신장 음기를 보충하고 체내 열 순환을 원활히 하는 한방 치료로 안전하게 다스려집니다.'
  }
];

// Fallback legacy case examples
export const CASE_EXAMPLES: CaseDemographic[] = [
  ...CHECKUP_CASES,
  ...WOMENS_HEALTH_CASES,
  ...SPINE_JOINT_CASES,
  ...ORIENTAL_MED_CASES
];
