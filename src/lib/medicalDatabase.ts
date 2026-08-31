import { CHECKUP_TOPICS } from './topics/checkupTopics';
import { WOMENS_HEALTH_TOPICS } from './topics/womensHealthTopics';
import { SPINE_JOINT_TOPICS } from './topics/spineJointTopics';
import { ORIENTAL_MED_TOPICS } from './topics/orientalMedTopics';
import { MedicalTopic } from './autoPublishEngineTypes';

export {
  CHECKUP_TOPICS,
  WOMENS_HEALTH_TOPICS,
  SPINE_JOINT_TOPICS,
  ORIENTAL_MED_TOPICS
};

export const CATEGORY_TOPICS_MAP: Record<string, { name: string; topics: MedicalTopic[] }> = {
  'checkup': { name: '건강검진', topics: CHECKUP_TOPICS },
  'womens-health': { name: '여성건강', topics: WOMENS_HEALTH_TOPICS },
  'spine-joint': { name: '척추관절', topics: SPINE_JOINT_TOPICS },
  'oriental-med': { name: '한의학', topics: ORIENTAL_MED_TOPICS },
};
