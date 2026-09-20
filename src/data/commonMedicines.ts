export interface MedicineSuggestion {
  name: string;
  defaultDosage: string;
  category: string;
  timing?: "Morning" | "Afternoon" | "Evening" | "Night";
  instructions?: string;
}

export const COMMON_MEDICINES: MedicineSuggestion[] = [
  // A
  { name: "Aceclofenac", defaultDosage: "100mg", category: "Joint Pain & Arthritis", timing: "Morning", instructions: "After meals with water" },
  { name: "Allopurinol", defaultDosage: "100mg", category: "Gout & Uric Acid", timing: "Morning", instructions: "Drink plenty of water" },
  { name: "Alprazolam", defaultDosage: "0.25mg", category: "Sleep & Calm", timing: "Night", instructions: "At bedtime as advised" },
  { name: "Amlodipine", defaultDosage: "5mg", category: "Blood Pressure", timing: "Morning", instructions: "Take once daily in morning" },
  { name: "Amoxicillin", defaultDosage: "500mg", category: "Antibiotic", timing: "Morning", instructions: "Complete full antibiotic course" },
  { name: "Antacid Gel / Syrup", defaultDosage: "10ml", category: "Gastric & Acidity", timing: "Morning", instructions: "Before breakfast on empty stomach" },
  { name: "Aspirin / Ecosprin", defaultDosage: "75mg", category: "Blood Thinner & Heart", timing: "Afternoon", instructions: "Take after lunch" },
  { name: "Atenolol", defaultDosage: "50mg", category: "Blood Pressure & Heart", timing: "Morning", instructions: "Check pulse before taking" },
  { name: "Atorvastatin", defaultDosage: "10mg", category: "Cholesterol & Heart", timing: "Night", instructions: "Take post-dinner before sleep" },
  { name: "Azithromycin", defaultDosage: "500mg", category: "Antibiotic", timing: "Morning", instructions: "Take 1 hour before or 2 hours after food" },

  // B
  { name: "Baclofen", defaultDosage: "10mg", category: "Muscle Relaxant", timing: "Night", instructions: "Take with meals" },
  { name: "Benidipine", defaultDosage: "4mg", category: "Hypertension", timing: "Morning", instructions: "Take after breakfast" },
  { name: "Betahistine", defaultDosage: "16mg", category: "Vertigo & Dizziness", timing: "Morning", instructions: "Take with or after food" },
  { name: "Bimatoprost Eye Drops", defaultDosage: "1 drop", category: "Glaucoma Care", timing: "Night", instructions: "Instill one drop into affected eye(s)" },
  { name: "Bisoprolol", defaultDosage: "2.5mg", category: "Heart Rate & BP", timing: "Morning", instructions: "Take in the morning with water" },
  { name: "Budecort Inhaler", defaultDosage: "200mcg", category: "Asthma & COPD", timing: "Morning", instructions: "Rinse mouth thoroughly after puff" },

  // C
  { name: "Calcium + Vit D3 (Shelcal)", defaultDosage: "500mg", category: "Bone Health", timing: "Morning", instructions: "Take after breakfast" },
  { name: "Candesartan", defaultDosage: "8mg", category: "Blood Pressure", timing: "Morning", instructions: "Take daily at same time" },
  { name: "Carvedilol", defaultDosage: "6.25mg", category: "Heart Care", timing: "Morning", instructions: "Take with food" },
  { name: "Cefixime", defaultDosage: "200mg", category: "Antibiotic", timing: "Morning", instructions: "Take after food" },
  { name: "Cetirizine", defaultDosage: "10mg", category: "Allergy & Cold", timing: "Night", instructions: "May cause drowsiness, take at night" },
  { name: "Cholecalciferol (Vit D3)", defaultDosage: "60,000 IU", category: "Vitamin D3", timing: "Morning", instructions: "Take once weekly with milk" },
  { name: "Cilnidipine", defaultDosage: "10mg", category: "Blood Pressure", timing: "Morning", instructions: "Take after morning breakfast" },
  { name: "Ciprofloxacin", defaultDosage: "500mg", category: "Antibiotic", timing: "Morning", instructions: "Avoid milk or calcium within 2 hours" },
  { name: "Clonazepam", defaultDosage: "0.5mg", category: "Sleep & Nerve Calm", timing: "Night", instructions: "Take at bedtime" },
  { name: "Clopidogrel (Deplatt)", defaultDosage: "75mg", category: "Blood Thinner", timing: "Afternoon", instructions: "Take after lunch" },
  { name: "CoQ10 / Ubiquinone", defaultDosage: "100mg", category: "Heart Supplement", timing: "Morning", instructions: "Take with breakfast" },

  // D
  { name: "Dabigatran (Pradaxa)", defaultDosage: "110mg", category: "Anticoagulant", timing: "Morning", instructions: "Swallow whole with a full glass of water" },
  { name: "Dapagliflozin (Forxiga)", defaultDosage: "10mg", category: "Diabetes & Kidney", timing: "Morning", instructions: "Drink adequate water throughout day" },
  { name: "Deflazacort", defaultDosage: "6mg", category: "Anti-inflammatory", timing: "Morning", instructions: "Take with meals" },
  { name: "Diclofenac", defaultDosage: "50mg", category: "Pain & Swelling", timing: "Afternoon", instructions: "Take after food, never empty stomach" },
  { name: "Digoxin", defaultDosage: "0.25mg", category: "Heart Rhythm", timing: "Morning", instructions: "Follow exact doctor prescription" },
  { name: "Diltiazem", defaultDosage: "60mg", category: "Blood Pressure & Angina", timing: "Morning", instructions: "Take before meals" },
  { name: "Dolo 650 (Paracetamol)", defaultDosage: "650mg", category: "Fever & Pain Relief", timing: "Morning", instructions: "Take as needed after food, max 3 daily" },
  { name: "Domperidone", defaultDosage: "10mg", category: "Digestion & Nausea", timing: "Morning", instructions: "Take 15-30 mins before food" },
  { name: "Donepezil", defaultDosage: "5mg", category: "Memory & Cognition", timing: "Night", instructions: "Take at bedtime" },
  { name: "Duloxetine", defaultDosage: "30mg", category: "Nerve Pain & Mood", timing: "Morning", instructions: "Take with or without food" },

  // E
  { name: "Ecosprin (Aspirin)", defaultDosage: "75mg", category: "Cardio Protective", timing: "Afternoon", instructions: "Take after lunch" },
  { name: "Empagliflozin (Jardiance)", defaultDosage: "10mg", category: "Diabetes & Heart", timing: "Morning", instructions: "Take in the morning with water" },
  { name: "Enalapril", defaultDosage: "5mg", category: "Blood Pressure", timing: "Morning", instructions: "Can take with or without food" },
  { name: "Escitalopram", defaultDosage: "10mg", category: "Mood & Wellbeing", timing: "Morning", instructions: "Take in the morning" },
  { name: "Esomeprazole", defaultDosage: "40mg", category: "GERD & Acidity", timing: "Morning", instructions: "Take 30 mins before breakfast" },
  { name: "Evion 400 (Vit E)", defaultDosage: "400mg", category: "Muscle Cramps & Skin", timing: "Night", instructions: "Take after dinner" },
  { name: "Ezetimibe", defaultDosage: "10mg", category: "Cholesterol", timing: "Night", instructions: "Take at night" },

  // F
  { name: "Febuxostat", defaultDosage: "40mg", category: "Uric Acid Control", timing: "Morning", instructions: "Take daily with water" },
  { name: "Fenofibrate", defaultDosage: "145mg", category: "Triglycerides", timing: "Night", instructions: "Take with evening meal" },
  { name: "Fexofenadine", defaultDosage: "120mg", category: "Allergy Relief", timing: "Morning", instructions: "Take with water, avoid fruit juices within 2 hrs" },
  { name: "Finasteride", defaultDosage: "5mg", category: "Prostate Health", timing: "Night", instructions: "Take daily at bedtime" },
  { name: "Fluconazole", defaultDosage: "150mg", category: "Antifungal", timing: "Morning", instructions: "Take as per schedule" },
  { name: "Folic Acid", defaultDosage: "5mg", category: "Blood Builder", timing: "Morning", instructions: "Take with breakfast" },
  { name: "Foracort Inhaler", defaultDosage: "200mcg", category: "Respiratory Inhaler", timing: "Morning", instructions: "Rinse mouth after inhalation" },
  { name: "Furosemide (Lasix)", defaultDosage: "40mg", category: "Water Retention & BP", timing: "Morning", instructions: "Take in morning to prevent nighttime urination" },

  // G
  { name: "Gabapentin", defaultDosage: "300mg", category: "Nerve Pain", timing: "Night", instructions: "Take at bedtime with water" },
  { name: "Gemfibrozil", defaultDosage: "600mg", category: "Cholesterol", timing: "Morning", instructions: "Take 30 mins before breakfast" },
  { name: "Gliclazide", defaultDosage: "60mg", category: "Diabetes", timing: "Morning", instructions: "Take with breakfast" },
  { name: "Glimepiride", defaultDosage: "1mg", category: "Diabetes", timing: "Morning", instructions: "Take right before or with breakfast" },
  { name: "Glipizide", defaultDosage: "5mg", category: "Diabetes", timing: "Morning", instructions: "Take 30 mins before first meal" },
  { name: "Glucosamine", defaultDosage: "750mg", category: "Joint Cartilage", timing: "Morning", instructions: "Take with breakfast" },

  // H
  { name: "Haloperidol", defaultDosage: "0.5mg", category: "Geriatric Care", timing: "Night", instructions: "As prescribed by specialist" },
  { name: "Hydralazine", defaultDosage: "25mg", category: "High Blood Pressure", timing: "Morning", instructions: "Take with food" },
  { name: "Hydrochlorothiazide", defaultDosage: "12.5mg", category: "Diuretic & BP", timing: "Morning", instructions: "Take in morning" },
  { name: "Hydroxychloroquine", defaultDosage: "200mg", category: "Rheumatoid Arthritis", timing: "Morning", instructions: "Take with food or milk" },
  { name: "Hydroxyzine", defaultDosage: "25mg", category: "Allergy & Itching", timing: "Night", instructions: "Take at bedtime" },

  // I
  { name: "Ibuprofen", defaultDosage: "400mg", category: "Pain & Fever", timing: "Afternoon", instructions: "Always take with food or milk" },
  { name: "Indapamide", defaultDosage: "1.5mg", category: "Blood Pressure", timing: "Morning", instructions: "Take in the morning" },
  { name: "Insulin Glargine (Lantus)", defaultDosage: "10 units", category: "Long-acting Insulin", timing: "Night", instructions: "Inject subcutaneously at same time nightly" },
  { name: "Insulin Regular (Actrapid)", defaultDosage: "8 units", category: "Fast-acting Insulin", timing: "Morning", instructions: "Inject 30 mins before meal" },
  { name: "Ipratropium Inhaler", defaultDosage: "20mcg", category: "Bronchospasm Relief", timing: "Morning", instructions: "Use spacer if prescribed" },
  { name: "Iron (Ferrous Ascorbate)", defaultDosage: "100mg", category: "Anemia & Iron", timing: "Morning", instructions: "Take with Vit C / water on empty stomach if tolerated" },
  { name: "Isosorbide Mononitrate (Sorbitrate)", defaultDosage: "20mg", category: "Angina & Heart", timing: "Morning", instructions: "Take on empty stomach with water" },
  { name: "Ivabradine", defaultDosage: "5mg", category: "Heart Rate Regulation", timing: "Morning", instructions: "Take twice daily with meals" },

  // J
  { name: "Januvia (Sitagliptin)", defaultDosage: "100mg", category: "Diabetes", timing: "Morning", instructions: "Take once daily with or without food" },
  { name: "Jardiance (Empagliflozin)", defaultDosage: "10mg", category: "Diabetes & Heart", timing: "Morning", instructions: "Take in the morning" },
  { name: "Jalra (Vildagliptin)", defaultDosage: "50mg", category: "Diabetes", timing: "Morning", instructions: "Take with morning meal" },

  // K
  { name: "Ketorolac", defaultDosage: "10mg", category: "Acute Pain", timing: "Morning", instructions: "Short-term use only with food" },
  { name: "Potassium Chloride (Potklor)", defaultDosage: "500mg", category: "Electrolyte Support", timing: "Morning", instructions: "Dissolve fully or take with water" },

  // L
  { name: "Lactulose Solution", defaultDosage: "15ml", category: "Digestive / Laxative", timing: "Night", instructions: "Take after dinner with warm water" },
  { name: "Lansoprazole", defaultDosage: "30mg", category: "Acid Reflux", timing: "Morning", instructions: "Take 30 mins before breakfast" },
  { name: "Levetiracetam", defaultDosage: "500mg", category: "Neurological Care", timing: "Morning", instructions: "Take regularly at 12-hr intervals" },
  { name: "Levocetirizine", defaultDosage: "5mg", category: "Allergy & Sneezing", timing: "Night", instructions: "Take before sleep" },
  { name: "Levofloxacin", defaultDosage: "500mg", category: "Antibiotic", timing: "Morning", instructions: "Drink plenty of fluids" },
  { name: "Levothyroxine (Thyronorm)", defaultDosage: "50mcg", category: "Thyroid Hormone", timing: "Morning", instructions: "First thing in morning, empty stomach, 1 hr before tea/food" },
  { name: "Linagliptin (Trajenta)", defaultDosage: "5mg", category: "Diabetes", timing: "Morning", instructions: "Safe with kidney impairment, take with or without food" },
  { name: "Lipaglyn", defaultDosage: "4mg", category: "Triglycerides & Sugar", timing: "Night", instructions: "Take once daily after dinner" },
  { name: "Liv-52", defaultDosage: "1 tablet", category: "Liver Support", timing: "Morning", instructions: "Take before meals" },
  { name: "Lorazepam", defaultDosage: "1mg", category: "Anxiety & Sleep", timing: "Night", instructions: "Take at bedtime as prescribed" },
  { name: "Losartan", defaultDosage: "50mg", category: "Blood Pressure", timing: "Morning", instructions: "Take once daily in the morning" },
  { name: "Lubricating Eye Drops (Refresh)", defaultDosage: "1 drop", category: "Dry Eye Relief", timing: "Morning", instructions: "Instill 1 drop in each eye 3-4 times daily" },

  // M
  { name: "Magnesium Glycinate", defaultDosage: "200mg", category: "Cramps & Sleep", timing: "Night", instructions: "Take 30 mins before sleep" },
  { name: "Melatonin", defaultDosage: "3mg", category: "Sleep Regularity", timing: "Night", instructions: "Take 45 mins before bedtime in dim light" },
  { name: "Memantine", defaultDosage: "10mg", category: "Memory & Alzheimer's", timing: "Morning", instructions: "Take with or without food" },
  { name: "Metformin", defaultDosage: "500mg", category: "Diabetes", timing: "Morning", instructions: "Always take with or immediately after meals" },
  { name: "Methylcobalamin (Vit B12)", defaultDosage: "1500mcg", category: "Nerve Health", timing: "Morning", instructions: "Take after breakfast for nerve strength" },
  { name: "Methylprednisolone", defaultDosage: "4mg", category: "Anti-inflammatory", timing: "Morning", instructions: "Take after breakfast" },
  { name: "Metoclopramide", defaultDosage: "10mg", category: "Anti-nausea", timing: "Morning", instructions: "Take 15-30 mins before meals" },
  { name: "Metoprolol Succinate", defaultDosage: "25mg", category: "Heart Rate & BP", timing: "Morning", instructions: "Swallow whole, do not crush" },
  { name: "Metronidazole", defaultDosage: "400mg", category: "Gastro Infection", timing: "Morning", instructions: "Take with food, avoid alcohol" },
  { name: "Montelukast", defaultDosage: "10mg", category: "Asthma & Allergy", timing: "Night", instructions: "Take in the evening" },
  { name: "Moxifloxacin Eye Drops", defaultDosage: "1 drop", category: "Eye Care", timing: "Morning", instructions: "Instill 1 drop 3 times daily" },
  { name: "Multivitamin Senior Formula", defaultDosage: "1 tablet", category: "Daily Vitality", timing: "Morning", instructions: "Take with morning breakfast" },

  // N
  { name: "Nebivolol", defaultDosage: "5mg", category: "Blood Pressure & Heart", timing: "Morning", instructions: "Take once daily in morning" },
  { name: "Nicorandil", defaultDosage: "5mg", category: "Angina Prevention", timing: "Morning", instructions: "Take with water as prescribed" },
  { name: "Nifedipine", defaultDosage: "20mg", category: "Blood Pressure", timing: "Morning", instructions: "Swallow whole with water" },
  { name: "Nitrofurantoin", defaultDosage: "100mg", category: "Urinary Care", timing: "Night", instructions: "Take with food or milk" },
  { name: "Nitroglycerin Sublingual", defaultDosage: "0.5mg", category: "Chest Pain SOS", timing: "Morning", instructions: "Place under tongue if acute chest pain occurs" },
  { name: "Nortriptyline", defaultDosage: "10mg", category: "Nerve Pain & Sleep", timing: "Night", instructions: "Take at bedtime" },

  // O
  { name: "Olmesartan", defaultDosage: "20mg", category: "Blood Pressure", timing: "Morning", instructions: "Take daily at same time" },
  { name: "Omeprazole", defaultDosage: "20mg", category: "Acidity & GERD", timing: "Morning", instructions: "Take 30 mins before breakfast" },
  { name: "Ondansetron", defaultDosage: "4mg", category: "Nausea Relief", timing: "Morning", instructions: "Dissolve on tongue or swallow with water" },
  { name: "ORS (Oral Rehydration)", defaultDosage: "1 sachet", category: "Hydration & Electrolytes", timing: "Morning", instructions: "Dissolve 1 sachet in 1 liter clean water" },
  { name: "Oxcarbazepine", defaultDosage: "150mg", category: "Nerve Pain", timing: "Morning", instructions: "Take with food" },

  // P
  { name: "Pan-D (Pantoprazole + Domp)", defaultDosage: "1 capsule", category: "Reflux & Acidity", timing: "Morning", instructions: "Take 30 mins before breakfast empty stomach" },
  { name: "Pantoprazole", defaultDosage: "40mg", category: "Stomach Acidity", timing: "Morning", instructions: "Take 30-45 mins before breakfast" },
  { name: "Paracetamol", defaultDosage: "650mg", category: "Fever & Pain", timing: "Morning", instructions: "Take after food, maintain 6 hr gap" },
  { name: "Pentoxifylline", defaultDosage: "400mg", category: "Circulation Care", timing: "Morning", instructions: "Take with meals" },
  { name: "Pioglitazone", defaultDosage: "15mg", category: "Diabetes", timing: "Morning", instructions: "Take once daily" },
  { name: "Piracetam", defaultDosage: "800mg", category: "Cognitive Support", timing: "Morning", instructions: "Take before meals" },
  { name: "Prasugrel", defaultDosage: "10mg", category: "Blood Thinner", timing: "Morning", instructions: "Take with or without food" },
  { name: "Pravastatin", defaultDosage: "20mg", category: "Cholesterol", timing: "Night", instructions: "Take at bedtime" },
  { name: "Prazosin", defaultDosage: "2mg", category: "BP & Prostate", timing: "Night", instructions: "Take first dose at bedtime to avoid dizziness" },
  { name: "Prednisolone", defaultDosage: "5mg", category: "Anti-inflammatory", timing: "Morning", instructions: "Take after breakfast with milk or food" },
  { name: "Pregabalin", defaultDosage: "75mg", category: "Diabetic Neuropathy", timing: "Night", instructions: "Take before bedtime" },
  { name: "Propranolol", defaultDosage: "20mg", category: "Tremors & Migraine", timing: "Morning", instructions: "Take before food" },

  // Q
  { name: "Quetiapine", defaultDosage: "25mg", category: "Sleep & Mood", timing: "Night", instructions: "Take at bedtime as prescribed" },
  { name: "Quinapril", defaultDosage: "10mg", category: "Blood Pressure", timing: "Morning", instructions: "Take at same time daily" },

  // R
  { name: "Rabeprazole", defaultDosage: "20mg", category: "Acid Reflux", timing: "Morning", instructions: "Take before morning breakfast" },
  { name: "Ramipril", defaultDosage: "2.5mg", category: "Blood Pressure & Heart", timing: "Morning", instructions: "Take in the morning with water" },
  { name: "Ranolazine", defaultDosage: "500mg", category: "Chronic Angina", timing: "Morning", instructions: "Swallow whole with water" },
  { name: "Repaglinide", defaultDosage: "1mg", category: "Post-Meal Sugar", timing: "Morning", instructions: "Take 15 mins before each major meal" },
  { name: "Rifaximin (Rifagut)", defaultDosage: "400mg", category: "Gut Cleanser / IBS", timing: "Morning", instructions: "Take with or without food" },
  { name: "Risperidone", defaultDosage: "0.5mg", category: "Geriatric Calm", timing: "Night", instructions: "Low dose at bedtime" },
  { name: "Rivaroxaban (Xarelto)", defaultDosage: "15mg", category: "Blood Clot Prevention", timing: "Night", instructions: "Take with evening meal" },
  { name: "Rosuvastatin", defaultDosage: "10mg", category: "Cholesterol & Lipids", timing: "Night", instructions: "Take once daily at bedtime" },

  // S
  { name: "Sacubitril + Valsartan (Vymada)", defaultDosage: "50mg", category: "Heart Failure", timing: "Morning", instructions: "Take twice daily with or without food" },
  { name: "Salbutamol (Asthalin) Inhaler", defaultDosage: "100mcg", category: "Asthma SOS Inhaler", timing: "Morning", instructions: "Use 1-2 puffs as needed for breathlessness" },
  { name: "Saroglitazar (Lipaglyn)", defaultDosage: "4mg", category: "Triglycerides & Sugar", timing: "Night", instructions: "Take once daily after dinner" },
  { name: "Sertraline", defaultDosage: "50mg", category: "Mood Support", timing: "Morning", instructions: "Take with morning breakfast" },
  { name: "Shelcal 500 (Calcium + D3)", defaultDosage: "500mg", category: "Bone Health", timing: "Morning", instructions: "Take after breakfast with water" },
  { name: "Silodosin", defaultDosage: "8mg", category: "Prostate & Urinary Flow", timing: "Night", instructions: "Take with food once daily at same time" },
  { name: "Sitagliptin", defaultDosage: "50mg", category: "Diabetes", timing: "Morning", instructions: "Take once daily with or without meals" },
  { name: "Spironolactone", defaultDosage: "25mg", category: "Diuretic & Heart", timing: "Morning", instructions: "Take in the morning with meals" },
  { name: "Sucralfate Suspension", defaultDosage: "10ml", category: "Stomach Ulcers", timing: "Morning", instructions: "Take 1 hour before meals on empty stomach" },
  { name: "Sulfasalazine", defaultDosage: "500mg", category: "Inflammatory Bowel / Joints", timing: "Morning", instructions: "Take after food with plenty of water" },

  // T
  { name: "Tamsulosin", defaultDosage: "0.4mg", category: "Prostate & Urine Flow", timing: "Night", instructions: "Take 30 mins after dinner" },
  { name: "Telmisartan", defaultDosage: "40mg", category: "Blood Pressure", timing: "Morning", instructions: "Take once daily after breakfast" },
  { name: "Teneligliptin", defaultDosage: "20mg", category: "Diabetes", timing: "Morning", instructions: "Take once daily before or with breakfast" },
  { name: "Theophylline", defaultDosage: "300mg", category: "Respiratory Relief", timing: "Morning", instructions: "Take after meals" },
  { name: "Thyronorm (Levothyroxine)", defaultDosage: "50mcg", category: "Thyroid Care", timing: "Morning", instructions: "First thing in morning empty stomach, wait 1 hr before tea" },
  { name: "Ticagrelor", defaultDosage: "90mg", category: "Blood Thinner", timing: "Morning", instructions: "Take twice daily with or without food" },
  { name: "Timolol Eye Drops", defaultDosage: "1 drop", category: "Eye Pressure", timing: "Morning", instructions: "Instill 1 drop twice daily" },
  { name: "Tolterodine", defaultDosage: "2mg", category: "Bladder Control", timing: "Morning", instructions: "Swallow whole with water" },
  { name: "Torsemide", defaultDosage: "10mg", category: "Water Retention & Edema", timing: "Morning", instructions: "Take in the morning with food" },
  { name: "Tramadol", defaultDosage: "50mg", category: "Severe Pain", timing: "Morning", instructions: "Take as prescribed with food" },
  { name: "Trazodone", defaultDosage: "25mg", category: "Sleep Aid", timing: "Night", instructions: "Take shortly before bedtime" },
  { name: "Trimetazidine", defaultDosage: "35mg", category: "Heart Angina", timing: "Morning", instructions: "Take with meals" },

  // U
  { name: "Ubiquinol / CoQ10", defaultDosage: "100mg", category: "Heart & Muscle", timing: "Morning", instructions: "Take with breakfast" },
  { name: "Ursodeoxycholic Acid (UDCA)", defaultDosage: "300mg", category: "Liver & Gallbladder", timing: "Night", instructions: "Take with meals or milk" },
  { name: "Urimax (Tamsulosin)", defaultDosage: "0.4mg", category: "Prostate Relief", timing: "Night", instructions: "Take 30 mins after dinner" },

  // V
  { name: "Valganciclovir", defaultDosage: "450mg", category: "Antiviral", timing: "Morning", instructions: "Take with food" },
  { name: "Valsartan", defaultDosage: "80mg", category: "Blood Pressure", timing: "Morning", instructions: "Take daily with water" },
  { name: "Venlafaxine", defaultDosage: "37.5mg", category: "Neuropathic Pain & Mood", timing: "Morning", instructions: "Take with morning food" },
  { name: "Verapamil", defaultDosage: "40mg", category: "Heart Rhythm & BP", timing: "Morning", instructions: "Take with food or milk" },
  { name: "Vildagliptin (Jalra)", defaultDosage: "50mg", category: "Diabetes", timing: "Morning", instructions: "Take with meals" },
  { name: "Vitamin B-Complex + Zinc", defaultDosage: "1 capsule", category: "Nerve & Energy", timing: "Morning", instructions: "Take after breakfast" },
  { name: "Vitamin C", defaultDosage: "500mg", category: "Immunity", timing: "Morning", instructions: "Chew or swallow after food" },
  { name: "Vitamin D3 60K", defaultDosage: "60,000 IU", category: "Bone & Muscle", timing: "Morning", instructions: "Take once weekly with warm milk" },
  { name: "Voglibose", defaultDosage: "0.2mg", category: "Post-Meal Blood Sugar", timing: "Morning", instructions: "Take immediately before or with first bite of food" },
  { name: "Vymada", defaultDosage: "50mg", category: "Heart Failure", timing: "Morning", instructions: "Take twice daily as prescribed" },

  // W
  { name: "Warfarin", defaultDosage: "2mg", category: "Anticoagulant", timing: "Night", instructions: "Take at same time every evening, monitor PT/INR" },

  // X
  { name: "Xipamide", defaultDosage: "20mg", category: "Diuretic & Edema", timing: "Morning", instructions: "Take with morning breakfast" },
  { name: "Xylometazoline Nasal Drops", defaultDosage: "2 drops", category: "Nasal Decongestion", timing: "Night", instructions: "Use for maximum 3-5 consecutive days" },

  // Z
  { name: "Zincovit", defaultDosage: "1 tablet", category: "Multivitamin & Minerals", timing: "Morning", instructions: "Take after morning meal" },
  { name: "Zolpidem", defaultDosage: "5mg", category: "Sleep Induction", timing: "Night", instructions: "Take immediately before going to bed" },
  { name: "Zyloric (Allopurinol)", defaultDosage: "100mg", category: "Uric Acid & Gout", timing: "Morning", instructions: "Take after meals with plenty of fluids" },
];

/**
 * Filter medicines matching the query:
 * Prioritizes medicines where name starts with the typed first letter/prefix,
 * followed by medicines containing the query.
 */
export function searchMedicines(query: string, limit = 12): MedicineSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const firstLetter = q[0];

  // 1. Matches that strictly start with the query (e.g. "A", "Am", "Amlodipine")
  const startsWithQuery = COMMON_MEDICINES.filter((m) =>
    m.name.toLowerCase().startsWith(q)
  );

  // 2. Matches where first letter matches the first letter of query (e.g. user typed 'a' -> all starting with 'a')
  const startsWithFirstLetter = COMMON_MEDICINES.filter(
    (m) =>
      m.name.toLowerCase().startsWith(firstLetter) &&
      !startsWithQuery.includes(m)
  );

  // 3. Matches that contain the query somewhere inside
  const containsQuery = COMMON_MEDICINES.filter(
    (m) =>
      m.name.toLowerCase().includes(q) &&
      !startsWithQuery.includes(m) &&
      !startsWithFirstLetter.includes(m)
  );

  return [...startsWithQuery, ...startsWithFirstLetter, ...containsQuery].slice(0, limit);
}
