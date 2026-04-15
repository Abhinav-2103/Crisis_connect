// ==================== INTERFACES ====================

export interface NGO {
  id: string;
  name: string;
  city: string;
  state: string;
  color: string;
  hq: { lat: number; lng: number };
  description: string;
  phone: string;
  email: string;
  established: string;
  volunteerCount?: number;
}

export interface Need {
  id: string;
  title: string;
  location: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  category: 'Food' | 'Water' | 'Shelter' | 'Medical' | 'Transport' | 'Rescue';
  tags: string[];
  timestamp: Date;
  lat: number;
  lng: number;
  contact: string;
  status: 'open' | 'in-progress' | 'resolved';
  ngoId?: string;
  ngoName?: string;
  city?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  avatar: string;
  skills: string[];
  badges: string[];
  rating: number;
  totalHelps: number;
  availability: 'available' | 'busy' | 'offline';
  location: string;
  phone?: string;
  joinedDate: Date;
  ngoId?: string;
  ngoName?: string;
  lat?: number;
  lng?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  helpsCompleted: number;
  rank: number;
  badges: string[];
  ngoId?: string;
  ngoName?: string;
}

// ==================== NGO DATA ====================

export const mockNGOs: NGO[] = [
  { id: 'ngo-1', name: 'Prayas Foundation', city: 'Delhi', state: 'Delhi', color: '#a855f7', hq: { lat: 28.6139, lng: 77.2090 }, description: 'Flood & Drought relief in Northern India', phone: '+91-11-4567-8901', email: 'contact@prayas.org', established: '2010', volunteerCount: 4 },
  { id: 'ngo-2', name: 'Sahyog Relief Trust', city: 'Mumbai', state: 'Maharashtra', color: '#3b82f6', hq: { lat: 19.0760, lng: 72.8777 }, description: 'Coastal disaster response & urban shelter', phone: '+91-22-4567-8902', email: 'info@sahyog.org', established: '2008', volunteerCount: 3 },
  { id: 'ngo-3', name: 'Seva Samithi', city: 'Bangalore', state: 'Karnataka', color: '#10b981', hq: { lat: 12.9716, lng: 77.5946 }, description: 'Medical aid & rescue operations South India', phone: '+91-80-4567-8903', email: 'help@sevasamithi.org', established: '2015', volunteerCount: 3 },
  { id: 'ngo-4', name: 'Aasra Welfare Society', city: 'Noida', state: 'Uttar Pradesh', color: '#f59e0b', hq: { lat: 28.5355, lng: 77.3910 }, description: 'Community relief & logistics support NCR', phone: '+91-120-4567-9001', email: 'aasra@welfare.org', established: '2012', volunteerCount: 2 },
  { id: 'ngo-5', name: 'Kolkata Aid', city: 'Kolkata', state: 'West Bengal', color: '#ef4444', hq: { lat: 22.5726, lng: 88.3639 }, description: 'Cyclone relief & urban poverty', phone: '+91-33-4567-8901', email: 'hello@kolkataaid.org', established: '2014', volunteerCount: 2 },
  { id: 'ngo-6', name: 'Chennai Rescue', city: 'Chennai', state: 'Tamil Nadu', color: '#06b6d4', hq: { lat: 13.0827, lng: 80.2707 }, description: 'Rainfall flooding and shelter', phone: '+91-44-4567-8902', email: 'help@chennairescue.org', established: '2018', volunteerCount: 2 },
  { id: 'ngo-7', name: 'Pune Health Initiative', city: 'Pune', state: 'Maharashtra', color: '#ec4899', hq: { lat: 18.5204, lng: 73.8567 }, description: 'Health emergencies and blood donation drives', phone: '+91-20-4567-8903', email: 'info@punehealth.org', established: '2017', volunteerCount: 2 },
  { id: 'ngo-8', name: 'Rajputana Relief', city: 'Jaipur', state: 'Rajasthan', color: '#eab308', hq: { lat: 26.9124, lng: 75.7873 }, description: 'Drought and heatwave response', phone: '+91-141-4567-8904', email: 'care@rajputanarelief.org', established: '2011', volunteerCount: 2 },
  { id: 'ngo-9', name: 'Awadh Care', city: 'Lucknow', state: 'Uttar Pradesh', color: '#8b5cf6', hq: { lat: 26.8467, lng: 80.9462 }, description: 'Medical supplies & education', phone: '+91-522-4567-8905', email: 'support@awadhcare.org', established: '2016', volunteerCount: 2 },
  { id: 'ngo-10', name: 'Gujjar Volunteers', city: 'Ahmedabad', state: 'Gujarat', color: '#14b8a6', hq: { lat: 23.0225, lng: 72.5714 }, description: 'Earthquake preparedness & logistics', phone: '+91-79-4567-8906', email: 'volunteer@gujjar.org', established: '2019', volunteerCount: 2 },
];

// ==================== NEEDS DATA ====================

export const mockNeeds: Need[] = [
  // Delhi - Prayas Foundation
  { id: 'need-1', title: 'Insulin & Diabetes Medicines Needed', location: 'Yamuna Khadar, Delhi', description: 'Flash flood in low-lying area. Elderly diabetic patient trapped, needs insulin and glucose monitoring kit urgently.', urgency: 'critical', category: 'Medical', tags: ['Diabetes', 'Flood', 'Elderly'], timestamp: new Date(Date.now() - 2 * 3600000), lat: 28.6600, lng: 77.2620, contact: '+91-98110-99001', status: 'open', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', city: 'Delhi', userId: 'user-1', userName: "Sunita Rao" },
  { id: 'need-2', title: 'Rescue - Family Trapped in Flooded Building', location: 'Kalindi Kunj, Delhi', description: 'Yamuna flooding. Family of 5 stranded on rooftop, water level at 8 feet. Needs boat rescue immediately.', urgency: 'critical', category: 'Rescue', tags: ['Flood Rescue', 'Family', 'Urgent'], timestamp: new Date(Date.now() - 3600000), lat: 28.5350, lng: 77.3100, contact: '+91-98110-99002', status: 'open', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', city: 'Delhi' },
  { id: 'need-3', title: 'Food Packets for Flood Relief Camp', location: 'Burari Relief Camp, Delhi', description: '750+ displaced persons at relief camp. Running out of cooked meals. Need supplies for 3 days minimum.', urgency: 'high', category: 'Food', tags: ['Relief Camp', 'Displaced', 'Mass Feeding'], timestamp: new Date(Date.now() - 5 * 3600000), lat: 28.7270, lng: 77.1877, contact: '+91-98110-99003', status: 'in-progress', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', city: 'Delhi' },
  { id: 'need-4', title: 'Safe Drinking Water - Sangam Vihar', location: 'Sangam Vihar, Delhi', description: 'Waterlogging has contaminated tap water across 3 blocks. 200 households without potable water for 2 days.', urgency: 'high', category: 'Water', tags: ['Contamination', 'Community', 'Children'], timestamp: new Date(Date.now() - 8 * 3600000), lat: 28.5030, lng: 77.2530, contact: '+91-98110-99004', status: 'open', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', city: 'Delhi' },
  { id: 'need-5', title: 'Transport to Hospital - Pregnant Woman', location: 'Shahdara, Delhi', description: '9-month pregnant woman in labour. Roads flooded, ambulance cannot reach. Need high-clearance vehicle urgently.', urgency: 'critical', category: 'Transport', tags: ['Pregnancy', 'Hospital', 'Emergency'], timestamp: new Date(Date.now() - 1800000), lat: 28.6734, lng: 77.2887, contact: '+91-98110-99005', status: 'open', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', city: 'Delhi' },
  // Mumbai - Sahyog Relief Trust
  { id: 'need-6', title: 'Cyclone Evacuation - Dharavi Residents', location: 'Dharavi, Mumbai', description: 'Pre-cyclone warning issued. 400+ residents from low-lying Dharavi need evacuation to shelters before landfall at midnight.', urgency: 'critical', category: 'Rescue', tags: ['Cyclone', 'Evacuation', 'Mass Rescue'], timestamp: new Date(Date.now() - 3 * 3600000), lat: 19.0414, lng: 72.8543, contact: '+91-98200-55001', status: 'open', ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', city: 'Mumbai' },
  { id: 'need-7', title: 'Emergency Medical Camp - Kurla', location: 'Kurla West, Mumbai', description: 'Flooding has cutoff access to hospitals. Setting up temporary medical post, need doctors and nurses and medical supplies.', urgency: 'high', category: 'Medical', tags: ['Medical Camp', 'Flood', 'Healthcare'], timestamp: new Date(Date.now() - 4 * 3600000), lat: 19.0726, lng: 72.8797, contact: '+91-98200-55002', status: 'in-progress', ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', city: 'Mumbai' },
  { id: 'need-8', title: 'Tarpaulin & Temporary Shelters', location: 'Govandi, Mumbai', description: 'Slum dwelling roofs destroyed in storm. 80 families with no shelter. Need tarpaulins and basic material urgently.', urgency: 'high', category: 'Shelter', tags: ['Storm Damage', 'Slum', 'Families'], timestamp: new Date(Date.now() - 6 * 3600000), lat: 19.0435, lng: 72.9141, contact: '+91-98200-55003', status: 'open', ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', city: 'Mumbai' },
  { id: 'need-9', title: 'Boat & Driver for Rescue Ops', location: 'Chembur, Mumbai', description: 'Flooded colony. Need inflatable rescue boat and experienced operator to ferry stranded elderly and children from top floors.', urgency: 'critical', category: 'Transport', tags: ['Boat', 'Rescue', 'Elderly'], timestamp: new Date(Date.now() - 1.5 * 3600000), lat: 19.0622, lng: 72.9005, contact: '+91-98200-55004', status: 'open', ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', city: 'Mumbai' },
  // Bangalore - Seva Samithi
  { id: 'need-10', title: 'Dengue Outbreak - Medical Aid', location: 'Rajajinagar, Bangalore', description: 'Dengue fever outbreak post heavy rains. 30+ confirmed cases in residential area. Need doctors, IV drips and medicines.', urgency: 'high', category: 'Medical', tags: ['Dengue', 'Outbreak', 'Epidemic'], timestamp: new Date(Date.now() - 10 * 3600000), lat: 12.9884, lng: 77.5551, contact: '+91-98440-77001', status: 'open', ngoId: 'ngo-3', ngoName: 'Seva Samithi', city: 'Bangalore' },
  { id: 'need-11', title: 'Water Purification Tablets - HSR Layout', location: 'HSR Layout, Bangalore', description: 'Stagnant water in multiple sectors. 500 households need water purification tablets and hygiene awareness.', urgency: 'medium', category: 'Water', tags: ['Purification', 'Hygiene', 'Community'], timestamp: new Date(Date.now() - 14 * 3600000), lat: 12.9116, lng: 77.6389, contact: '+91-98440-77002', status: 'open', ngoId: 'ngo-3', ngoName: 'Seva Samithi', city: 'Bangalore' },
  { id: 'need-12', title: 'Food & Nutrition for Migrant Workers', location: 'Electronic City, Bangalore', description: 'Migrant construction workers stranded, no wages. 120 workers with malnourishment risk.', urgency: 'medium', category: 'Food', tags: ['Migrants', 'Nutrition', 'Workers'], timestamp: new Date(Date.now() - 18 * 3600000), lat: 12.8458, lng: 77.6637, contact: '+91-98440-77003', status: 'resolved', ngoId: 'ngo-3', ngoName: 'Seva Samithi', city: 'Bangalore' },
  // Noida/NCR - Aasra Welfare Society
  { id: 'need-13', title: 'Shelter for Flood Victims - Noida', location: 'Sector 62, Noida', description: 'Hindon river overflow. 300+ people need emergency shelter, bedding and blankets.', urgency: 'high', category: 'Shelter', tags: ['Flood', 'Hindon River', 'Displaced'], timestamp: new Date(Date.now() - 7 * 3600000), lat: 28.6269, lng: 77.3701, contact: '+91-98990-33001', status: 'open', ngoId: 'ngo-4', ngoName: 'Aasra Welfare Society', city: 'Noida' },
  { id: 'need-14', title: 'Food Supplies - Gurgaon Relief Centre', location: 'Sector 29, Gurgaon', description: 'Waterlogging across Gurgaon. Relief centre set up, food for 200 people needed immediately.', urgency: 'high', category: 'Food', tags: ['Waterlogging', 'Relief Centre', 'Community'], timestamp: new Date(Date.now() - 9 * 3600000), lat: 28.4744, lng: 77.0737, contact: '+91-98990-33002', status: 'in-progress', ngoId: 'ngo-4', ngoName: 'Aasra Welfare Society', city: 'Gurgaon' },
  { id: 'need-15', title: 'Medical Emergency - Snake Bite Antivenom', location: 'Greater Noida West', description: 'Flood-displaced snakes in area. Child bitten by Russell\'s viper. Needs antivenom injection and ICU transport.', urgency: 'critical', category: 'Medical', tags: ['Snake Bite', 'Child', 'Antivenom'], timestamp: new Date(Date.now() - 18 * 60000), lat: 28.5993, lng: 77.4354, contact: '+91-98990-33003', status: 'open', ngoId: 'ngo-4', ngoName: 'Aasra Welfare Society', city: 'Greater Noida' },
  // Kolkata - Kolkata Aid (Floods)
  { id: 'need-16', title: 'Severe Flooding in Howrah', location: 'Howrah, Kolkata', description: 'Massive flooding forcing 500+ out of homes. Rescue boat and life jackets needed.', urgency: 'critical', category: 'Rescue', tags: ['Flood', 'Evacuation'], timestamp: new Date(Date.now() - 3600000), lat: 22.5958, lng: 88.3110, contact: '+91-33-2211-3344', status: 'open', ngoId: 'ngo-5', ngoName: 'Kolkata Aid', city: 'Kolkata' },
  // Chennai - Chennai Rescue (Rainfall flooding and Shelter)
  { id: 'need-17', title: 'Emergency Shelter for Displaced', location: 'T Nagar, Chennai', description: 'Heavy rains submerged lower floors. 40 families need temporary shelter setups.', urgency: 'high', category: 'Shelter', tags: ['Rainfall', 'Housing'], timestamp: new Date(Date.now() - 7200000), lat: 13.0418, lng: 80.2341, contact: '+91-44-2233-4455', status: 'open', ngoId: 'ngo-6', ngoName: 'Chennai Rescue', city: 'Chennai' },
  // Pune - Pune Health Initiative (Medical)
  { id: 'need-18', title: 'Urgent Blood Units Needed', location: 'Deccan Gymkhana, Pune', description: 'Accident victims admitted locally. Need O- and B+ blood donors immediately.', urgency: 'critical', category: 'Medical', tags: ['Blood Donation', 'Emergency'], timestamp: new Date(Date.now() - 1500000), lat: 18.5167, lng: 73.8400, contact: '+91-20-8877-6655', status: 'open', ngoId: 'ngo-7', ngoName: 'Pune Health Initiative', city: 'Pune' },
  // Jaipur - Rajputana Relief (Water/Heatwave)
  { id: 'need-19', title: 'Drinking Water Shortage', location: 'Malviya Nagar, Jaipur', description: 'Severe heatwave. Colony water tank empty. Requesting water tanker drop.', urgency: 'high', category: 'Water', tags: ['Heatwave', 'Shortage'], timestamp: new Date(Date.now() - 8600000), lat: 26.8530, lng: 75.8047, contact: '+91-141-9988-7766', status: 'open', ngoId: 'ngo-8', ngoName: 'Rajputana Relief', city: 'Jaipur' },
  // Lucknow - Awadh Care (Food shortages)
  { id: 'need-20', title: 'Food Shortage for Evacuees', location: 'Gomti Nagar, Lucknow', description: 'Supply chain disruption. Need cooked meals for 150 evacuees staying at community hall.', urgency: 'medium', category: 'Food', tags: ['Meals', 'Relief Camp'], timestamp: new Date(Date.now() - 14400000), lat: 26.8490, lng: 80.9700, contact: '+91-522-3344-5566', status: 'open', ngoId: 'ngo-9', ngoName: 'Awadh Care', city: 'Lucknow' },
  // Ahmedabad - Gujjar Volunteers (Transport/Logistics)
  { id: 'need-21', title: 'Transport for Relief Materials', location: 'Navrangpura, Ahmedabad', description: 'Need heavy transport vehicle to move 500 tents and supplies to base camp.', urgency: 'medium', category: 'Transport', tags: ['Logistics', 'Vehicles'], timestamp: new Date(Date.now() - 36000000), lat: 23.0360, lng: 72.5615, contact: '+91-79-1122-3344', status: 'open', ngoId: 'ngo-10', ngoName: 'Gujjar Volunteers', city: 'Ahmedabad' },
];

// ==================== VOLUNTEERS DATA ====================

export const mockVolunteers: Volunteer[] = [
  { id: 'vol-1', name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', skills: ['Medical', 'First Aid', 'Emergency Response'], badges: ['Top Responder', 'Medical Expert'], rating: 4.9, totalHelps: 187, availability: 'available', location: 'Connaught Place, Delhi', phone: '+91-98110-12301', joinedDate: new Date('2024-01-15'), ngoId: 'ngo-1', ngoName: 'Prayas Foundation', lat: 28.6329, lng: 77.2195 },
  { id: 'vol-2', name: 'Deepika Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', skills: ['Rescue Operations', 'Water Safety'], badges: ['Rescue Expert'], rating: 4.8, totalHelps: 164, availability: 'available', location: 'Rohini, Delhi', phone: '+91-98110-12302', joinedDate: new Date('2024-02-20'), ngoId: 'ngo-1', ngoName: 'Prayas Foundation', lat: 28.7041, lng: 77.1025 },
  { id: 'vol-3', name: 'Rajesh Gupta', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', skills: ['Logistics', 'Transport', 'Supply Chain'], badges: ['Logistics Hero'], rating: 4.7, totalHelps: 143, availability: 'busy', location: 'Lajpat Nagar, Delhi', phone: '+91-98110-12303', joinedDate: new Date('2024-03-10'), ngoId: 'ngo-1', ngoName: 'Prayas Foundation', lat: 28.5665, lng: 77.2431 },
  { id: 'vol-4', name: 'Kavita Nair', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', skills: ['Food Distribution', 'Community Outreach'], badges: ['Community Leader', 'Top Responder'], rating: 4.9, totalHelps: 221, availability: 'available', location: 'Dwarka, Delhi', phone: '+91-98110-12304', joinedDate: new Date('2023-11-05'), ngoId: 'ngo-1', ngoName: 'Prayas Foundation', lat: 28.5823, lng: 77.0388 },
  { id: 'vol-5', name: 'Vikram Patil', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', skills: ['Rescue', 'Swimming', 'Emergency Response'], badges: ['Rescue Specialist', 'Verified'], rating: 4.8, totalHelps: 156, availability: 'available', location: 'Andheri, Mumbai', phone: '+91-98200-45601', joinedDate: new Date('2024-01-10'), ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', lat: 19.1197, lng: 72.8468 },
  { id: 'vol-6', name: 'Preethi Iyer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', skills: ['Medical', 'Pharmacy', 'Health Education'], badges: ['Medical Professional', 'Top Helper'], rating: 4.9, totalHelps: 198, availability: 'available', location: 'Bandra, Mumbai', phone: '+91-98200-45602', joinedDate: new Date('2023-10-01'), ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', lat: 19.0596, lng: 72.8295 },
  { id: 'vol-7', name: 'Suresh Desai', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', skills: ['Shelter Setup', 'Construction', 'Safety'], badges: ['Safety Expert'], rating: 4.6, totalHelps: 112, availability: 'offline', location: 'Dadar, Mumbai', phone: '+91-98200-45603', joinedDate: new Date('2024-04-15'), ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', lat: 19.0178, lng: 72.8478 },
  { id: 'vol-8', name: 'Anitha Reddy', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', skills: ['Medical Aid', 'Counseling', 'Mental Health'], badges: ['Medical Support', 'Counselor'], rating: 4.7, totalHelps: 134, availability: 'available', location: 'Koramangala, Bangalore', phone: '+91-98440-67801', joinedDate: new Date('2024-02-01'), ngoId: 'ngo-3', ngoName: 'Seva Samithi', lat: 12.9352, lng: 77.6245 },
  { id: 'vol-9', name: 'Mohammed Rafi', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop', skills: ['Food Distribution', 'Cooking', 'Nutrition'], badges: ['Community Champion'], rating: 4.8, totalHelps: 149, availability: 'busy', location: 'Whitefield, Bangalore', phone: '+91-98440-67802', joinedDate: new Date('2024-01-22'), ngoId: 'ngo-3', ngoName: 'Seva Samithi', lat: 12.9698, lng: 77.7500 },
  { id: 'vol-10', name: 'Lakshmi Venkat', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop', skills: ['Transport', 'Vehicle Operation', 'Navigation'], badges: ['Quick Responder'], rating: 4.5, totalHelps: 89, availability: 'available', location: 'Jayanagar, Bangalore', phone: '+91-98440-67803', joinedDate: new Date('2024-05-10'), ngoId: 'ngo-3', ngoName: 'Seva Samithi', lat: 12.9302, lng: 77.5832 },
  { id: 'vol-11', name: 'Puneet Saxena', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', skills: ['Rescue', 'Emergency Response', 'First Aid'], badges: ['Rescue Expert', 'Verified'], rating: 4.8, totalHelps: 121, availability: 'available', location: 'Sector 18, Noida', phone: '+91-98990-23401', joinedDate: new Date('2024-03-05'), ngoId: 'ngo-4', ngoName: 'Aasra Welfare Society', lat: 28.5706, lng: 77.3219 },
  { id: 'vol-12', name: 'Ritu Agarwal', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', skills: ['Shelter Management', 'Social Work', 'Community Organizing'], badges: ['Community Hero'], rating: 4.7, totalHelps: 97, availability: 'available', location: 'Gurgaon, Haryana', phone: '+91-98990-23402', joinedDate: new Date('2024-04-01'), ngoId: 'ngo-4', ngoName: 'Aasra Welfare Society', lat: 28.4595, lng: 77.0266 },
  { id: 'vol-13', name: 'Amit Roy', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', skills: ['Rescue', 'First Aid'], badges: ['Verified'], rating: 4.8, totalHelps: 76, availability: 'available', location: 'Salt Lake, Kolkata', joinedDate: new Date('2024-05-12'), ngoId: 'ngo-5', ngoName: 'Kolkata Aid', lat: 22.5850, lng: 88.4100 },
  { id: 'vol-14', name: 'Priya Sen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', skills: ['Logistics', 'Management'], badges: ['Logistics Hero'], rating: 4.7, totalHelps: 45, availability: 'available', location: 'Alipore, Kolkata', joinedDate: new Date('2024-06-01'), ngoId: 'ngo-5', ngoName: 'Kolkata Aid', lat: 22.5350, lng: 88.3300 },
  { id: 'vol-15', name: 'Karthik S', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', skills: ['Shelter Setup'], badges: ['Top Responder'], rating: 4.9, totalHelps: 110, availability: 'available', location: 'Adyar, Chennai', joinedDate: new Date('2023-11-20'), ngoId: 'ngo-6', ngoName: 'Chennai Rescue', lat: 13.0033, lng: 80.2555 },
  { id: 'vol-16', name: 'Rohan Kadam', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', skills: ['Medical', 'Blood Donation'], badges: ['Medical Support'], rating: 4.8, totalHelps: 80, availability: 'available', location: 'Kothrud, Pune', joinedDate: new Date('2024-02-15'), ngoId: 'ngo-7', ngoName: 'Pune Health Initiative', lat: 18.5074, lng: 73.8197 },
  { id: 'vol-17', name: 'Megha Singh', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', skills: ['Relief Distribution'], badges: ['Top Helper'], rating: 4.6, totalHelps: 55, availability: 'available', location: 'Vaishali Nagar, Jaipur', joinedDate: new Date('2024-04-10'), ngoId: 'ngo-8', ngoName: 'Rajputana Relief', lat: 26.9030, lng: 75.7480 },
  { id: 'vol-18', name: 'Imran Khan', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', skills: ['Cooking', 'Food Distribution'], badges: ['Community Champion'], rating: 4.7, totalHelps: 92, availability: 'available', location: 'Hazratganj, Lucknow', joinedDate: new Date('2024-01-30'), ngoId: 'ngo-9', ngoName: 'Awadh Care', lat: 26.8500, lng: 80.9500 },
  { id: 'vol-19', name: 'Alok Patel', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', skills: ['Transport', 'Logistics'], badges: ['Quick Responder'], rating: 4.5, totalHelps: 60, availability: 'available', location: 'Satellite, Ahmedabad', joinedDate: new Date('2024-07-05'), ngoId: 'ngo-10', ngoName: 'Gujjar Volunteers', lat: 23.0290, lng: 72.5190 },
];

// ==================== CHAT DATA ====================

export const mockChatMessages: ChatMessage[] = [
  { id: 'c1', senderId: 'vol-1', senderName: 'Arjun Mehta', message: 'I can respond to the insulin emergency in Yamuna Khadar. I have supplies. Reaching in 20 minutes.', timestamp: new Date(Date.now() - 25 * 60000), isCurrentUser: false },
  { id: 'c2', senderId: 'current', senderName: 'You', message: 'Great Arjun! The patient is on the 2nd floor, Block C. Water is knee-deep on ground floor.', timestamp: new Date(Date.now() - 23 * 60000), isCurrentUser: true },
  { id: 'c3', senderId: 'vol-1', senderName: 'Arjun Mehta', message: 'Understood. I have a boat arranged with Rajesh. We\'ll reach together. Sending live location.', timestamp: new Date(Date.now() - 21 * 60000), isCurrentUser: false },
  { id: 'c4', senderId: 'current', senderName: 'You', message: 'Perfect coordination. Deepika is also heading there for the rooftop rescue in Kalindi Kunj.', timestamp: new Date(Date.now() - 18 * 60000), isCurrentUser: true },
  { id: 'c5', senderId: 'vol-2', senderName: 'Deepika Sharma', message: 'Confirmed. NDRF has cleared us to operate. ETA 15 minutes at Kalindi Kunj bridge.', timestamp: new Date(Date.now() - 15 * 60000), isCurrentUser: false },
];

// ==================== LEADERBOARD DATA ====================

export const mockLeaderboard = [
  { id: 'l1', name: 'Kavita Nair', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', score: 2210, helpsCompleted: 221, rank: 1, badges: ['Community Leader', 'Top Responder'], ngoId: 'ngo-1', ngoName: 'Prayas Foundation' },
  { id: 'l2', name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', score: 1870, helpsCompleted: 187, rank: 2, badges: ['Top Responder', 'Medical Expert'], ngoId: 'ngo-1', ngoName: 'Prayas Foundation' },
  { id: 'l3', name: 'Preethi Iyer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', score: 1980, helpsCompleted: 198, rank: 3, badges: ['Medical Professional', 'Top Helper'], ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust' },
  { id: 'l4', name: 'Deepika Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', score: 1640, helpsCompleted: 164, rank: 4, badges: ['Rescue Expert'], ngoId: 'ngo-1', ngoName: 'Prayas Foundation' },
  { id: 'l5', name: 'Vikram Patil', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', score: 1560, helpsCompleted: 156, rank: 5, badges: ['Rescue Specialist'], ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust' },
  { id: 'l6', name: 'Mohammed Rafi', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop', score: 1490, helpsCompleted: 149, rank: 6, badges: ['Community Champion'], ngoId: 'ngo-3', ngoName: 'Seva Samithi' },
  { id: 'l7', name: 'Rajesh Gupta', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', score: 1430, helpsCompleted: 143, rank: 7, badges: ['Logistics Hero'], ngoId: 'ngo-1', ngoName: 'Prayas Foundation' },
  { id: 'l8', name: 'Anitha Reddy', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', score: 1340, helpsCompleted: 134, rank: 8, badges: ['Medical Support'], ngoId: 'ngo-3', ngoName: 'Seva Samithi' },
];

// ==================== DASHBOARD STATS ====================

export interface DashboardStats {
  totalNeeds: number;
  activeVolunteers: number;
  resolvedToday: number;
  responseTime: string;
}

export const dashboardStats: DashboardStats = {
  totalNeeds: 287,
  activeVolunteers: 412,
  resolvedToday: 63,
  responseTime: '6.2 min',
};

export const chartData = [
  { name: 'Mon', needs: 38, resolved: 29 },
  { name: 'Tue', needs: 51, resolved: 44 },
  { name: 'Wed', needs: 45, resolved: 37 },
  { name: 'Thu', needs: 68, resolved: 55 },
  { name: 'Fri', needs: 59, resolved: 48 },
  { name: 'Sat', needs: 82, resolved: 63 },
  { name: 'Sun', needs: 71, resolved: 58 },
];

export const categoryDistribution = [
  { name: 'Medical', value: 42 },
  { name: 'Rescue', value: 35 },
  { name: 'Food', value: 31 },
  { name: 'Water', value: 28 },
  { name: 'Shelter', value: 24 },
  { name: 'Transport', value: 19 },
];
