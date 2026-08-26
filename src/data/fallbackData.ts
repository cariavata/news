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

export const fallbackArticles: Article[] = [];

export const getFreshFallbackArticles = (): Article[] => [];

