export interface Coach {
  id: string;
  name: string;
  tier: 'MASTER COACH' | 'LEVEL III' | 'LEVEL II' | 'LEVEL I';
  role: string;
  specialism: string;
  bio: string;
  portrait: string;
}

export const COACHES_DATA: Coach[] = [
  {
    id: 'coach-1',
    name: 'Marcus Valerius',
    tier: 'MASTER COACH',
    role: 'Lead Biomechanist',
    specialism: 'Movement biomechanics & structural alignment',
    bio: 'Marcus directs movement architecture at Vyomi, ensuring physical loading honors your joint articulation and restores natural skeletal alignment.',
    portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'coach-2',
    name: 'Vikram Sharma',
    tier: 'LEVEL III',
    role: 'Metabolic Conditioning',
    specialism: 'Cardiovascular capacity & Hyrox pacing',
    bio: 'Vikram guides purposeful cardiovascular endurance, focusing on aerobic efficiency without nervous system exhaustion.',
    portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'coach-3',
    name: 'Ananya Rao',
    tier: 'LEVEL III',
    role: 'Reformer Pilates',
    specialism: 'Spinal decompression & core precision',
    bio: 'Ananya works with classical reformer kinetics, developing balanced core engagement and joint stability in an unhurried setting.',
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'coach-4',
    name: 'Dr. Valerio Corso',
    tier: 'MASTER COACH',
    role: 'Recovery & Physiology',
    specialism: 'Cold plunge hydrotherapy & circadian reset',
    bio: 'Dr. Corso oversees our recovery chambers, integrating cold plunge protocols, thermal sauna heat, and breathing to balance the autonomic nervous system.',
    portrait: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=85',
  },
  {
    id: 'coach-5',
    name: 'Priya Nair',
    tier: 'LEVEL II',
    role: 'Rhythmic Kinetics',
    specialism: 'Aerobic flow & dance conditioning',
    bio: 'Priya guides rhythmic group flow, creating an uplifting cardiovascular session centered on fluid, joyful movement.',
    portrait: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85',
  },
];
