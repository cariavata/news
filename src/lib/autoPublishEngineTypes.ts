export interface MedicalTopic {
  id: string;
  title: string;
  shortSummary: string;
  pathology: string;
  mechanism: string;
  biomarkers: string[];
  diagnosticTests: string[];
  medicalTreatments: string[];
  homeCareTips: string[];
  qaPairs: { question: string; answer: string }[];
  stages: { stage: string; desc: string; medicalAction: string }[];
  redFlags: string[];
  mythsVsFacts: { myth: string; fact: string }[];
  demographicRisks: { group: string; risk: string; advice: string }[];
  tags: string[];
}

export interface CaseDemographic {
  location: string;
  ageGender: string;
  occupation: string;
  initialSymptom: string;
  diagnosticDetail: string;
  treatmentCourse: string;
  outcomeMetric: string;
  doctorQuote: string;
}
