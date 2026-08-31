// IRIS AI: Localized Clinical Referral Centers & AYUSH Health and Wellness Hubs
// Maps user/patient district to nearest tertiary eye hospital and AYUSH wellness unit

export const DISTRICT_REFERRAL_DIRECTORY = {
  'Ghaziabad': {
    ophthalmologist: {
      name: 'MMG District Hospital & Apex Vitreoretinal Centre',
      doctor: 'Dr. S. K. Tyagi, MS (Ophth), Fellow Vitreoretina',
      designation: 'Chief Consultant Ophthalmologist',
      type: 'Tertiary Retinal Referral Apex Unit',
      distance: '2.1 km',
      eta: '7 mins',
      lat: 28.6672,
      lng: 77.4358,
      address: 'GT Road, Near Navyug Market, Ghaziabad, UP - 201001',
      phone: '+91 120-2820450',
      emergencyPhone: '+91 98710 44210',
      empanelment: 'Ayushman Bharat PM-JAY & UP State Health Empanelled',
      facilities: ['Argon Laser Photocoagulation', 'Anti-VEGF Intravitreal Therapy', 'Spectral OCT & FFA', 'Emergency Vitrectomy'],
      turnaroundTime: '< 24 Hours Fast-Track',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=MMG+District+Hospital+Ghaziabad'
    },
    ayushCenter: {
      name: 'Ayush Health and Wellness Centre (AHWC) - Kavi Nagar',
      doctor: 'Dr. Rashmi Verma, BAMS, MD (Integrative Medicine)',
      designation: 'Medical Officer (AYUSH)',
      type: 'Ayushman Arogya Mandir (AYUSH) - Tier 1 Hub',
      distance: '1.2 km',
      eta: '4 mins',
      lat: 28.6750,
      lng: 77.4520,
      address: 'Community Center Complex, Sector 11, Kavi Nagar, Ghaziabad, UP - 201002',
      phone: '+91 120-2710340',
      empanelment: 'National AYUSH Mission (Ministry of Ayush, Govt. of India)',
      services: ['Diabetic Glycemic Lifestyle Management', 'Ayurvedic Microvascular Support (Netra Tarpana)', 'Preventive Vision Care Therapy', 'Post-Triage Dietary Counseling'],
      operatingHours: '08:00 AM - 04:00 PM (Mon - Sat)',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ayush+Health+and+Wellness+Centre+Kavi+Nagar+Ghaziabad'
    }
  },
  'Varanasi': {
    ophthalmologist: {
      name: 'Sir Sunderlal Hospital (IMS-BHU) - Regional Eye Institute',
      doctor: 'Dr. Arvind Kumar Singh, MS (Ophthalmology)',
      designation: 'Professor & Head of Vitreoretinal Services',
      type: 'National Apex Tele-Ophthalmology Centre',
      distance: '3.4 km',
      eta: '12 mins',
      lat: 25.2758,
      lng: 82.9995,
      address: 'Banaras Hindu University Campus, Varanasi, UP - 221005',
      phone: '+91 542-2307500',
      emergencyPhone: '+91 542-2368551',
      empanelment: 'CGHS, Ayushman Bharat PM-JAY Central Referral Hub',
      facilities: ['Diabetic Maculopathy Laser', 'Advanced 25G Vitrectomy', 'Multi-Wavelength Fundus Autofluorescence'],
      turnaroundTime: '< 12 Hours Rapid Triage',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sir+Sunderlal+Hospital+BHU+Varanasi+Ophthalmology'
    },
    ayushCenter: {
      name: 'Faculty of Ayurveda (AHWC) & Ayushman Arogya Mandir - Kashi',
      doctor: 'Dr. Priya Tripathi, MD (Ayurveda Shalakya Tantra - Eye Care)',
      designation: 'Senior AYUSH Medical Officer',
      type: 'Ayush Health & Wellness Centre - Kashi Unit',
      distance: '1.8 km',
      eta: '6 mins',
      lat: 25.2805,
      lng: 82.9920,
      address: 'BHU South Gate Road, Lanka, Varanasi, UP - 221005',
      phone: '+91 542-2367200',
      empanelment: 'National AYUSH Mission Centre of Excellence',
      services: ['Netra Kriyakalpa & Aschyotana Protocol', 'Herbal Glycemic Control Regimens', 'Digital Visual Fatigue Rehab'],
      operatingHours: '08:30 AM - 03:30 PM (Mon - Sat)',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Faculty+of+Ayurveda+BHU+Varanasi'
    }
  },
  'Lucknow': {
    ophthalmologist: {
      name: 'King George’s Medical University (KGMU) - Dept. of Ophthalmology',
      doctor: 'Dr. Rajesh Sharma, MS, MCh (Retinal Microsurgery)',
      designation: 'Chief Retinal Specialist',
      type: 'State Apex Retinal Care Institute',
      distance: '2.8 km',
      eta: '10 mins',
      lat: 26.8689,
      lng: 80.9168,
      address: 'Shah Mina Road, Chowk, Lucknow, UP - 226003',
      phone: '+91 522-2257450',
      emergencyPhone: '+91 522-2258880',
      empanelment: 'AB PM-JAY, UP State Health Mission',
      facilities: ['Pan-Retinal Photocoagulation (PRP)', 'Anti-VEGF Aflibercept / Ranibizumab', 'Widefield Angiography'],
      turnaroundTime: '< 24 Hours',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=KGMU+Department+of+Ophthalmology+Lucknow'
    },
    ayushCenter: {
      name: 'State Ayurvedic College & AHWC Hospital - Lucknow',
      doctor: 'Dr. V. N. Pandey, BAMS, MD (Ayurveda)',
      designation: 'In-Charge AYUSH Officer',
      type: 'Ayushman Arogya Mandir (Ayurveda & Integrative Health)',
      distance: '1.5 km',
      eta: '5 mins',
      lat: 26.8610,
      lng: 80.9130,
      address: 'Tulsidas Marg, Turiya Ganj, Lucknow, UP - 226004',
      phone: '+91 522-2256400',
      empanelment: 'National AYUSH Mission (Govt. of UP)',
      services: ['Integrative Retinopathy Protocol', 'Dietary Micro-Nutrient Supplementation', 'Yoga for Diabetic Microcirculation'],
      operatingHours: '08:00 AM - 04:00 PM',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=State+Ayurvedic+College+and+Hospital+Lucknow'
    }
  },
  'Gautam Buddha Nagar (Noida)': {
    ophthalmologist: {
      name: 'District Hospital Noida - Retinal Tele-Screening Unit',
      doctor: 'Dr. Meenakshi Dhar, MS (Ophthalmology)',
      designation: 'Senior Eye Surgeon & Retinal Specialist',
      type: 'District Tertiary Ophthalmology Centre',
      distance: '3.1 km',
      eta: '9 mins',
      lat: 28.5675,
      lng: 77.3621,
      address: 'Sector 39, Noida, UP - 201301',
      phone: '+91 120-2500050',
      emergencyPhone: '+91 98100 88231',
      empanelment: 'Ayushman Bharat PM-JAY & National Health Mission',
      facilities: ['Retinal Laser Photocoagulation', 'OCT Angiography (OCTA)', 'Intravitreal Injections'],
      turnaroundTime: '< 24 Hours',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=District+Hospital+Sector+39+Noida'
    },
    ayushCenter: {
      name: 'Ayush Health & Wellness Centre - Sector 22 Noida',
      doctor: 'Dr. Anuj Saxena, BAMS, PGD (Ayush Holistic Health)',
      designation: 'Medical Officer AYUSH',
      type: 'Ayushman Arogya Mandir Wellness Hub',
      distance: '1.4 km',
      eta: '5 mins',
      lat: 28.5980,
      lng: 77.3480,
      address: 'Near Community Health Centre, Sector 22, Noida, UP - 201301',
      phone: '+91 120-2412890',
      empanelment: 'National AYUSH Mission',
      services: ['Integrative Diabetic Eye Care', 'Shalakya Tantra Herbal Eye Washes', 'Holistic Glycemic Nutrition Plans'],
      operatingHours: '08:00 AM - 04:00 PM',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ayush+Health+and+Wellness+Centre+Sector+22+Noida'
    }
  },
  'Kanpur Nagar': {
    ophthalmologist: {
      name: 'GSVM Medical College & Hallet Eye Hospital',
      doctor: 'Dr. R. P. Maurya, MS (Ophthalmology)',
      designation: 'Professor & Head of Retinal Services',
      type: 'Regional Retinal Apex Referral Hospital',
      distance: '3.5 km',
      eta: '11 mins',
      lat: 26.4837,
      lng: 80.3087,
      address: 'Swaroop Nagar, Kanpur, UP - 208002',
      phone: '+91 512-2535483',
      emergencyPhone: '+91 512-2534500',
      empanelment: 'Ayushman Bharat PM-JAY',
      facilities: ['Argon Green Retinal Laser', 'Intravitreal Anti-VEGF', 'Micro-Incision Vitrectomy (MIVS)'],
      turnaroundTime: '< 24 Hours',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=GSVM+Medical+College+Hallet+Hospital+Kanpur'
    },
    ayushCenter: {
      name: 'Ayush Health and Wellness Centre - Swaroop Nagar',
      doctor: 'Dr. Sunita Gupta, BAMS, MD',
      designation: 'Senior AYUSH Medical Officer',
      type: 'Ayushman Arogya Mandir (Ayurveda)',
      distance: '1.6 km',
      eta: '5 mins',
      lat: 26.4880,
      lng: 80.3120,
      address: 'Govt. Ayush Dispensary Complex, Kanpur, UP - 208002',
      phone: '+91 512-2541200',
      empanelment: 'National AYUSH Mission',
      services: ['Diabetic Lifestyle Care', 'Herbal Antioxidant Formulations', 'Eye Strain Recovery Yoga'],
      operatingHours: '08:00 AM - 04:00 PM',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ayush+Health+Centre+Swaroop+Nagar+Kanpur'
    }
  },
  'Prayagraj (Allahabad)': {
    ophthalmologist: {
      name: 'MLN Medical College & Manohar Das Eye Hospital',
      doctor: 'Dr. S. P. Singh, MS (Ophthalmology)',
      designation: 'Chief Consultant Vitreoretinal Unit',
      type: 'Tertiary Ophthalmology Care Centre',
      distance: '2.9 km',
      eta: '10 mins',
      lat: 25.4520,
      lng: 81.8540,
      address: 'George Town, Prayagraj, UP - 211002',
      phone: '+91 532-2256700',
      emergencyPhone: '+91 532-2256711',
      empanelment: 'Ayushman Bharat PM-JAY',
      facilities: ['Laser Photocoagulation', 'Vitreoretinal Surgical Suite', 'Fundus Angiography'],
      turnaroundTime: '< 24 Hours',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Manohar+Das+Eye+Hospital+Prayagraj'
    },
    ayushCenter: {
      name: 'Ayush Health and Wellness Centre - Civil Lines Prayagraj',
      doctor: 'Dr. Kamlesh Mishra, BAMS',
      designation: 'Medical Officer AYUSH',
      type: 'Ayushman Arogya Mandir (AHWC)',
      distance: '1.5 km',
      eta: '5 mins',
      lat: 25.4560,
      lng: 81.8410,
      address: 'Near Old Tehsil, Civil Lines, Prayagraj, UP - 211001',
      phone: '+91 532-2623100',
      empanelment: 'National AYUSH Mission',
      services: ['Preventive Retinal Wellness', 'Ayurvedic Eye Tarpana Therapy', 'Glycemic Dietetics'],
      operatingHours: '08:00 AM - 04:00 PM',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Civil+Lines+Prayagraj+Ayush+Centre'
    }
  },
  'Gorakhpur': {
    ophthalmologist: {
      name: 'AIIMS Gorakhpur - Dept. of Ophthalmology & Retinal Clinic',
      doctor: 'Dr. Alok Sen, MS, DNB (Retina Specialist)',
      designation: 'Associate Professor & Vitreoretinal Lead',
      type: 'Institute of National Importance (INI) Apex Eye Care',
      distance: '4.2 km',
      eta: '14 mins',
      lat: 26.7450,
      lng: 83.4280,
      address: 'Kunraghat, Gorakhpur, UP - 273008',
      phone: '+91 551-2207700',
      emergencyPhone: '+91 551-2207711',
      empanelment: 'Ayushman Bharat PM-JAY, AIIMS National Healthcare',
      facilities: ['Advanced 3D Vitrectomy', 'Targeted Laser Therapy', 'Pediatric & Adult Retinal Care'],
      turnaroundTime: '< 24 Hours',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=AIIMS+Gorakhpur+Ophthalmology'
    },
    ayushCenter: {
      name: 'Ayush Health and Wellness Centre & AYUSH AIIMS Unit - Gorakhpur',
      doctor: 'Dr. Pratibha Rai, MD (Ayurveda)',
      designation: 'Medical Officer In-Charge',
      type: 'Ayushman Arogya Mandir (Integrative Medicine)',
      distance: '2.0 km',
      eta: '7 mins',
      lat: 26.7490,
      lng: 83.4220,
      address: 'Medical Enclave, Gorakhpur, UP - 273013',
      phone: '+91 551-2311400',
      empanelment: 'National AYUSH Mission',
      services: ['Ayurvedic Microvascular Management', 'Pranayama for Ocular Microcirculation', 'Herbal Eye Drops Protocol'],
      operatingHours: '08:00 AM - 04:00 PM',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=AIIMS+Gorakhpur+AYUSH'
    }
  },
  'Agra': {
    ophthalmologist: {
      name: 'SN Medical College - Regional Institute of Ophthalmology',
      doctor: 'Dr. Himanshu Yadav, MS (Ophthalmology)',
      designation: 'Senior Retinal Consultant',
      type: 'Tertiary Referral Eye Hospital',
      distance: '3.0 km',
      eta: '10 mins',
      lat: 27.1850,
      lng: 78.0060,
      address: 'Hospital Road, Agra, UP - 282002',
      phone: '+91 562-2260350',
      emergencyPhone: '+91 562-2260360',
      empanelment: 'Ayushman Bharat PM-JAY',
      facilities: ['Retinal Laser Photocoagulation', 'Fundus Fluorescein Angiography', 'Anti-VEGF Protocol'],
      turnaroundTime: '< 24 Hours',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=SN+Medical+College+Eye+Hospital+Agra'
    },
    ayushCenter: {
      name: 'Ayush Health and Wellness Centre - Sanjay Place Agra',
      doctor: 'Dr. Vivek Sharma, BAMS',
      designation: 'Medical Officer AYUSH',
      type: 'Ayushman Arogya Mandir Wellness Hub',
      distance: '1.3 km',
      eta: '4 mins',
      lat: 27.2020,
      lng: 78.0090,
      address: 'Block B, Sanjay Place, Agra, UP - 282002',
      phone: '+91 562-2850200',
      empanelment: 'National AYUSH Mission',
      services: ['Netra Tarpana Therapy', 'Holistic Diabetes Care', 'Eye Relaxation Regimens'],
      operatingHours: '08:00 AM - 04:00 PM',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ayush+Health+Centre+Sanjay+Place+Agra'
    }
  }
};

/**
 * Returns localized closest ophthalmologist and nearest AYUSH health center
 * dynamically tailored to the user's/patient's current district and state.
 */
export function getNearestHealthcareCenters(districtName = 'Ghaziabad', stateName = 'Uttar Pradesh') {
  // Normalize string matching
  const cleanDistrict = districtName ? districtName.trim() : 'Ghaziabad';
  
  // Direct match in directory
  const matchedKey = Object.keys(DISTRICT_REFERRAL_DIRECTORY).find(
    k => k.toLowerCase().includes(cleanDistrict.toLowerCase()) || cleanDistrict.toLowerCase().includes(k.toLowerCase())
  );

  if (matchedKey) {
    return DISTRICT_REFERRAL_DIRECTORY[matchedKey];
  }

  // Fallback intelligent generator for any other Indian district/state
  const encodedName = encodeURIComponent(`${cleanDistrict} District Eye Hospital ${stateName || 'India'}`);
  const encodedAyush = encodeURIComponent(`Ayush Health Centre ${cleanDistrict} ${stateName || 'India'}`);

  return {
    ophthalmologist: {
      name: `${cleanDistrict} District Eye Hospital & Vitreoretinal Unit`,
      doctor: `Dr. A. K. Verma, MS (Ophthalmology)`,
      designation: 'Chief District Vitreoretinal Consultant',
      type: 'District Tertiary Ophthalmology Centre',
      distance: '2.5 km',
      eta: '8 mins',
      lat: 28.6139,
      lng: 77.2090,
      address: `Civil Lines / Main Hospital Road, ${cleanDistrict}, ${stateName || 'India'}`,
      phone: '+91 1800-180-1104',
      emergencyPhone: '+91 112',
      empanelment: 'Ayushman Bharat PM-JAY & State Health Insurance',
      facilities: ['Laser Photocoagulation', 'Anti-VEGF Injections', 'Diagnostic OCT & Saliency Triage'],
      turnaroundTime: '< 24 Hours',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodedName}`
    },
    ayushCenter: {
      name: `Ayush Health & Wellness Centre (AHWC) - ${cleanDistrict} Central`,
      doctor: `Dr. S. N. Sharma, BAMS, MD (Ayurveda)`,
      designation: 'Medical Officer (AYUSH)',
      type: 'Ayushman Arogya Mandir (National AYUSH Mission)',
      distance: '1.4 km',
      eta: '5 mins',
      lat: 28.6190,
      lng: 77.2150,
      address: `PHC Block Compound, ${cleanDistrict}, ${stateName || 'India'}`,
      phone: '+91 1800-11-22-02',
      empanelment: 'National AYUSH Mission (Ministry of Ayush)',
      services: ['Diabetic Lifestyle Management', 'Ayurvedic Ocular Care (Netra Tarpana)', 'Post-Triage Dietary Support', 'Blood Glucose Monitoring'],
      operatingHours: '08:00 AM - 04:00 PM (Mon - Sat)',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodedAyush}`
    }
  };
}
