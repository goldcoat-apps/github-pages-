import { PlayerColor } from '../types/ludo';
import redLionImg from '../assets/images/ludo_lion_red_1793944295414.jpg';
import greenLeopardImg from '../assets/images/ludo_leopard_green_1793944295812.jpg';
import yellowCheetahImg from '../assets/images/ludo_cheetah_yellow_1793944297065.jpg';
import blueElephantImg from '../assets/images/ludo_elephant_blue_1793944297207.jpg';
import centerCrownImg from '../assets/images/ludo_crown_center_1793944297709.jpg';

export interface LudoAnimalEmblem {
  color: PlayerColor;
  animal: string;
  name: string;
  title: string;
  realm: string;
  emoji: string;
  image: string;
  accentColor: string;
}

export const LUDO_EMBLEMS: Record<PlayerColor, LudoAnimalEmblem> = {
  red: {
    color: 'red',
    animal: 'Africa Red Lion King',
    name: 'Africa Red Lion King',
    title: 'Pride of Asante',
    realm: 'Crimson Savannah',
    emoji: '🦁',
    image: redLionImg,
    accentColor: '#dc2626',
  },
  green: {
    color: 'green',
    animal: 'Africa Emerald Leopard',
    name: 'Africa Emerald Leopard',
    title: 'Shadow Hunter of the Rainforest',
    realm: 'Sacred Rainforest',
    emoji: '🐆',
    image: greenLeopardImg,
    accentColor: '#059669',
  },
  yellow: {
    color: 'yellow',
    animal: 'Africa Golden Cheetah',
    name: 'Africa Golden Cheetah',
    title: 'Royal Speed & Power',
    realm: 'Golden Savannah',
    emoji: '⚡',
    image: yellowCheetahImg,
    accentColor: '#d97706',
  },
  blue: {
    color: 'blue',
    animal: 'Africa Royal Elephant',
    name: 'Africa Royal Elephant',
    title: 'Wise Sovereign',
    realm: 'River of Sovereignty',
    emoji: '🐘',
    image: blueElephantImg,
    accentColor: '#2563eb',
  },
};

export const LUDO_CENTER_CREST = {
  name: 'African Royal Victory Crest',
  title: 'Conqueror of the Realm',
  description: 'The ancient four-kingdom crown awarded to the first warrior to guide all seeds home.',
  image: centerCrownImg,
};
