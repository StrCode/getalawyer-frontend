// Legal Practice Areas

import type { PracticeArea } from '@/types/registration';

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: 'criminal',
    name: 'Criminal Law',
    description: 'Defense and prosecution in criminal cases',
  },
  {
    id: 'corporate',
    name: 'Corporate Law',
    description: 'Business formation, contracts, and corporate governance',
  },
  {
    id: 'family',
    name: 'Family Law',
    description: 'Divorce, custody, adoption, and family matters',
  },
  {
    id: 'real_estate',
    name: 'Real Estate Law',
    description: 'Property transactions, land disputes, and real estate matters',
  },
  {
    id: 'intellectual_property',
    name: 'Intellectual Property',
    description: 'Patents, trademarks, copyrights, and IP protection',
  },
  {
    id: 'employment',
    name: 'Employment Law',
    description: 'Labor disputes, employment contracts, and workplace issues',
  },
  {
    id: 'tax',
    name: 'Tax Law',
    description: 'Tax planning, compliance, and tax disputes',
  },
  {
    id: 'immigration',
    name: 'Immigration Law',
    description: 'Visa applications, citizenship, and immigration matters',
  },
  {
    id: 'civil_litigation',
    name: 'Civil Litigation',
    description: 'Civil disputes, personal injury, and tort cases',
  },
  {
    id: 'banking_finance',
    name: 'Banking & Finance',
    description: 'Financial transactions, banking regulations, and securities',
  },
  {
    id: 'environmental',
    name: 'Environmental Law',
    description: 'Environmental regulations, compliance, and disputes',
  },
  {
    id: 'human_rights',
    name: 'Human Rights',
    description: 'Civil rights, constitutional law, and human rights advocacy',
  },
  {
    id: 'maritime',
    name: 'Maritime Law',
    description: 'Shipping, maritime commerce, and admiralty law',
  },
  {
    id: 'energy',
    name: 'Energy & Natural Resources',
    description: 'Oil & gas, mining, and energy sector regulations',
  },
  {
    id: 'entertainment',
    name: 'Entertainment Law',
    description: 'Media, sports, and entertainment industry legal matters',
  },
];

/**
 * Get practice area by ID
 */
export function getPracticeAreaById(id: string): PracticeArea | undefined {
  return PRACTICE_AREAS.find(area => area.id === id);
}

/**
 * Get practice area name by ID
 */
export function getPracticeAreaName(id: string): string {
  const area = getPracticeAreaById(id);
  return area?.name || '';
}
