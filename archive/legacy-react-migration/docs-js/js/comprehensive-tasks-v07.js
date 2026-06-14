// CareMarshall Comprehensive Task Library v0.8
// Professional Home Care Tasks for NZ Care Providers
// This file contains the default task library - admins can customize via the interface

const COMPREHENSIVE_TASKS_V07 = [
    // =====================================================
    // PERSONAL CARE & HYGIENE (100-199)
    // =====================================================
    { id: 'task_100', name: 'Shower Assistance', category: 'Personal Care', description: 'Assist client with showering', common: true },
    { id: 'task_101', name: 'Bath Assistance', category: 'Personal Care', description: 'Assist client with bathing', common: true },
    { id: 'task_102', name: 'Bed Bath', category: 'Personal Care', description: 'Provide bed bath for immobile clients' },
    { id: 'task_103', name: 'Sponge Bath', category: 'Personal Care', description: 'Provide sponge bath' },
    { id: 'task_104', name: 'Hair Washing', category: 'Personal Care', description: 'Wash and dry client hair' },
    { id: 'task_105', name: 'Hair Styling/Grooming', category: 'Personal Care', description: 'Style, brush, and groom hair' },
    { id: 'task_106', name: 'Shaving - Face', category: 'Personal Care', description: 'Assist with facial shaving' },
    { id: 'task_107', name: 'Shaving - Body', category: 'Personal Care', description: 'Assist with body shaving' },
    { id: 'task_108', name: 'Nail Care - Hands', category: 'Personal Care', description: 'Trim and file fingernails' },
    { id: 'task_109', name: 'Nail Care - Feet', category: 'Personal Care', description: 'Trim and file toenails' },
    { id: 'task_110', name: 'Oral Hygiene', category: 'Personal Care', description: 'Assist with teeth brushing and mouth care', common: true },
    { id: 'task_111', name: 'Denture Care', category: 'Personal Care', description: 'Clean and maintain dentures' },
    { id: 'task_112', name: 'Skin Care - Moisturizing', category: 'Personal Care', description: 'Apply moisturizers and lotions' },
    { id: 'task_113', name: 'Skin Care - Treatment', category: 'Personal Care', description: 'Apply prescribed skin treatments' },
    { id: 'task_114', name: 'Dressing Assistance - Morning', category: 'Personal Care', description: 'Help client get dressed in morning', common: true },
    { id: 'task_115', name: 'Dressing Assistance - Evening', category: 'Personal Care', description: 'Help client get ready for bed' },
    { id: 'task_116', name: 'Clothing Selection', category: 'Personal Care', description: 'Help choose appropriate clothing' },
    { id: 'task_117', name: 'Toileting Assistance', category: 'Personal Care', description: 'Assist with toilet use', common: true },
    { id: 'task_118', name: 'Commode Assistance', category: 'Personal Care', description: 'Assist with bedside commode' },
    { id: 'task_119', name: 'Incontinence Care - Pad Change', category: 'Personal Care', description: 'Change incontinence pads' },
    { id: 'task_120', name: 'Incontinence Care - Cleaning', category: 'Personal Care', description: 'Provide hygiene care after incontinence' },
    { id: 'task_121', name: 'Catheter Care - Bag Empty', category: 'Personal Care', description: 'Empty catheter drainage bag' },
    { id: 'task_122', name: 'Catheter Care - Cleaning', category: 'Personal Care', description: 'Clean catheter site' },
    { id: 'task_123', name: 'Stoma Care', category: 'Personal Care', description: 'Change and clean stoma bags' },
    { id: 'task_124', name: 'Perineal Care', category: 'Personal Care', description: 'Provide perineal hygiene care' },
    { id: 'task_125', name: 'Foot Care', category: 'Personal Care', description: 'Provide foot hygiene and care' },
    
    // =====================================================
    // MEDICATION & HEALTH MONITORING (200-299)
    // =====================================================
    { id: 'task_200', name: 'Medication Administration - Morning', category: 'Health', description: 'Administer morning medications', common: true },
    { id: 'task_201', name: 'Medication Administration - Afternoon', category: 'Health', description: 'Administer afternoon medications' },
    { id: 'task_202', name: 'Medication Administration - Evening', category: 'Health', description: 'Administer evening medications', common: true },
    { id: 'task_203', name: 'Medication Administration - Bedtime', category: 'Health', description: 'Administer bedtime medications' },
    { id: 'task_204', name: 'Medication Reminder', category: 'Health', description: 'Remind client to take medications' },
    { id: 'task_205', name: 'Medication Compliance Check', category: 'Health', description: 'Verify medications are taken correctly', common: true },
    { id: 'task_206', name: 'Medication Refill Coordination', category: 'Health', description: 'Arrange prescription refills with pharmacy' },
    { id: 'task_207', name: 'Medication Review', category: 'Health', description: 'Review medication list with client/family' },
    { id: 'task_208', name: 'Medication Storage Check', category: 'Health', description: 'Ensure proper medication storage' },
    { id: 'task_209', name: 'Blood Pressure Check', category: 'Health', description: 'Monitor and record blood pressure', common: true },
    { id: 'task_210', name: 'Blood Glucose Monitoring', category: 'Health', description: 'Test and record blood sugar levels', common: true },
    { id: 'task_211', name: 'Temperature Check', category: 'Health', description: 'Monitor body temperature' },
    { id: 'task_212', name: 'Pulse Check', category: 'Health', description: 'Monitor heart rate and rhythm' },
    { id: 'task_213', name: 'Oxygen Saturation Check', category: 'Health', description: 'Monitor blood oxygen levels with pulse oximeter' },
    { id: 'task_214', name: 'Weight Monitoring', category: 'Health', description: 'Weigh client and record weight changes' },
    { id: 'task_215', name: 'Wound Care - Cleaning', category: 'Health', description: 'Clean and inspect wounds' },
    { id: 'task_216', name: 'Wound Care - Dressing Change', category: 'Health', description: 'Change wound dressings' },
    { id: 'task_217', name: 'Pressure Sore Prevention', category: 'Health', description: 'Reposition client and monitor skin' },
    { id: 'task_218', name: 'Pressure Sore Treatment', category: 'Health', description: 'Treat existing pressure sores' },
    { id: 'task_219', name: 'Oxygen Therapy - Setup', category: 'Health', description: 'Set up oxygen therapy equipment' },
    { id: 'task_220', name: 'Oxygen Therapy - Monitoring', category: 'Health', description: 'Monitor oxygen therapy delivery' },
    { id: 'task_221', name: 'Nebulizer Treatment', category: 'Health', description: 'Administer nebulizer medication' },
    { id: 'task_222', name: 'Insulin Injection', category: 'Health', description: 'Administer insulin injections' },
    { id: 'task_223', name: 'Pain Assessment', category: 'Health', description: 'Assess and document pain levels' },
    { id: 'task_224', name: 'Pain Management Support', category: 'Health', description: 'Implement pain management strategies' },
    { id: 'task_225', name: 'Vital Signs - Full Check', category: 'Health', description: 'Complete vital signs assessment', common: true },
    { id: 'task_226', name: 'Medication Side Effect Monitoring', category: 'Health', description: 'Monitor for medication side effects' },
    { id: 'task_227', name: 'Fluid Intake Monitoring', category: 'Health', description: 'Monitor and record fluid intake' },
    { id: 'task_228', name: 'Output Monitoring', category: 'Health', description: 'Monitor and record urinary output' },
    
    // =====================================================
    // MEAL PREPARATION & DIETARY (300-399)
    // =====================================================
    { id: 'task_300', name: 'Breakfast Preparation', category: 'Meal Prep', description: 'Prepare morning meal', common: true },
    { id: 'task_301', name: 'Lunch Preparation', category: 'Meal Prep', description: 'Prepare midday meal', common: true },
    { id: 'task_302', name: 'Dinner Preparation', category: 'Meal Prep', description: 'Prepare evening meal', common: true },
    { id: 'task_303', name: 'Snack Preparation', category: 'Meal Prep', description: 'Prepare snacks between meals' },
    { id: 'task_304', name: 'Meal Planning', category: 'Meal Prep', description: 'Plan meals for the week' },
    { id: 'task_305', name: 'Grocery Shopping', category: 'Meal Prep', description: 'Purchase groceries for meals' },
    { id: 'task_306', name: 'Feeding Assistance', category: 'Meal Prep', description: 'Assist client with eating' },
    { id: 'task_307', name: 'Pureed Food Preparation', category: 'Meal Prep', description: 'Prepare pureed meals for dysphagia' },
    { id: 'task_308', name: 'Soft Food Preparation', category: 'Meal Prep', description: 'Prepare soft texture meals' },
    { id: 'task_309', name: 'Diabetic Meal Preparation', category: 'Meal Prep', description: 'Prepare diabetic-friendly meals' },
    { id: 'task_310', name: 'Low Sodium Meal Preparation', category: 'Meal Prep', description: 'Prepare low-sodium meals' },
    { id: 'task_311', name: 'Low Fat Meal Preparation', category: 'Meal Prep', description: 'Prepare low-fat meals' },
    { id: 'task_312', name: 'Gluten-Free Meal Preparation', category: 'Meal Prep', description: 'Prepare gluten-free meals' },
    { id: 'task_313', name: 'Vegetarian Meal Preparation', category: 'Meal Prep', description: 'Prepare vegetarian meals' },
    { id: 'task_314', name: 'Vegan Meal Preparation', category: 'Meal Prep', description: 'Prepare vegan meals' },
    { id: 'task_315', name: 'Cultural/Religious Meal Prep', category: 'Meal Prep', description: 'Prepare culturally appropriate meals' },
    { id: 'task_316', name: 'Thickened Fluid Preparation', category: 'Meal Prep', description: 'Prepare thickened fluids for swallowing difficulties' },
    { id: 'task_317', name: 'Meal Heating/Reheating', category: 'Meal Prep', description: 'Heat prepared meals' },
    { id: 'task_318', name: 'Food Storage Organization', category: 'Meal Prep', description: 'Organize and label food storage' },
    { id: 'task_319', name: 'Nutritional Supplement Preparation', category: 'Meal Prep', description: 'Prepare nutritional drinks/supplements' },
    { id: 'task_320', name: 'Meal Portion Control', category: 'Meal Prep', description: 'Portion meals according to dietary plan' },
    
    // =====================================================
    // HOUSEKEEPING & CLEANING (400-499)
    // =====================================================
    { id: 'task_400', name: 'Kitchen Cleaning', category: 'Housekeeping', description: 'Clean kitchen surfaces and appliances', common: true },
    { id: 'task_401', name: 'Bathroom Cleaning', category: 'Housekeeping', description: 'Clean bathroom fixtures and surfaces', common: true },
    { id: 'task_402', name: 'Bedroom Cleaning', category: 'Housekeeping', description: 'Clean and tidy bedroom' },
    { id: 'task_403', name: 'Living Room Cleaning', category: 'Housekeeping', description: 'Clean and tidy living areas' },
    { id: 'task_404', name: 'Vacuuming', category: 'Housekeeping', description: 'Vacuum carpets and rugs' },
    { id: 'task_405', name: 'Mopping Floors', category: 'Housekeeping', description: 'Mop hard floors' },
    { id: 'task_406', name: 'Dusting', category: 'Housekeeping', description: 'Dust furniture and surfaces' },
    { id: 'task_407', name: 'Dish Washing', category: 'Housekeeping', description: 'Wash and dry dishes' },
    { id: 'task_408', name: 'Laundry - Washing', category: 'Housekeeping', description: 'Wash clothing and linens' },
    { id: 'task_409', name: 'Laundry - Drying', category: 'Housekeeping', description: 'Dry laundry' },
    { id: 'task_410', name: 'Laundry - Folding', category: 'Housekeeping', description: 'Fold and organize clean laundry' },
    { id: 'task_411', name: 'Laundry - Ironing', category: 'Housekeeping', description: 'Iron clothing and linens' },
    { id: 'task_412', name: 'Bed Making', category: 'Housekeeping', description: 'Make bed with fresh linens' },
    { id: 'task_413', name: 'Linen Change', category: 'Housekeeping', description: 'Change bed linens' },
    { id: 'task_414', name: 'Garbage/Rubbish Removal', category: 'Housekeeping', description: 'Empty bins and take out rubbish' },
    { id: 'task_415', name: 'Recycling Organization', category: 'Housekeeping', description: 'Sort and organize recycling' },
    { id: 'task_416', name: 'Window Cleaning', category: 'Housekeeping', description: 'Clean windows and glass surfaces' },
    { id: 'task_417', name: 'Refrigerator Cleaning', category: 'Housekeeping', description: 'Clean and organize refrigerator' },
    { id: 'task_418', name: 'Oven Cleaning', category: 'Housekeeping', description: 'Clean oven and stovetop' },
    { id: 'task_419', name: 'Pantry Organization', category: 'Housekeeping', description: 'Organize pantry and check expiry dates' },
    { id: 'task_420', name: 'Closet Organization', category: 'Housekeeping', description: 'Organize clothing in closets' },
    { id: 'task_421', name: 'Decluttering', category: 'Housekeeping', description: 'Help organize and declutter living spaces' },
    
    // =====================================================
    // MOBILITY & PHYSICAL ASSISTANCE (500-599)
    // =====================================================
    { id: 'task_500', name: 'Transfer Assistance - Bed to Chair', category: 'Mobility', description: 'Assist with transfer from bed to chair', common: true },
    { id: 'task_501', name: 'Transfer Assistance - Chair to Bed', category: 'Mobility', description: 'Assist with transfer from chair to bed', common: true },
    { id: 'task_502', name: 'Transfer Assistance - Wheelchair', category: 'Mobility', description: 'Assist with wheelchair transfers' },
    { id: 'task_503', name: 'Walking Assistance', category: 'Mobility', description: 'Assist client with walking', common: true },
    { id: 'task_504', name: 'Walker Assistance', category: 'Mobility', description: 'Assist client using walker' },
    { id: 'task_505', name: 'Cane Assistance', category: 'Mobility', description: 'Assist client using cane' },
    { id: 'task_506', name: 'Repositioning in Bed', category: 'Mobility', description: 'Reposition client in bed for comfort' },
    { id: 'task_507', name: 'Lifting Assistance', category: 'Mobility', description: 'Assist with lifting using proper techniques' },
    { id: 'task_508', name: 'Hoyer Lift Operation', category: 'Mobility', description: 'Use Hoyer lift for transfers' },
    { id: 'task_509', name: 'Range of Motion Exercises - Upper', category: 'Mobility', description: 'Assist with upper body ROM exercises' },
    { id: 'task_510', name: 'Range of Motion Exercises - Lower', category: 'Mobility', description: 'Assist with lower body ROM exercises' },
    { id: 'task_511', name: 'Stretching Exercises', category: 'Mobility', description: 'Guide stretching exercises' },
    { id: 'task_512', name: 'Balance Exercises', category: 'Mobility', description: 'Supervise balance and stability exercises' },
    { id: 'task_513', name: 'Walking Program', category: 'Mobility', description: 'Support regular walking routine' },
    { id: 'task_514', name: 'Fall Prevention Check', category: 'Mobility', description: 'Assess fall hazards and prevention' },
    
    // =====================================================
    // SOCIAL & EMOTIONAL SUPPORT (600-699)
    // =====================================================
    { id: 'task_600', name: 'Companionship Visit', category: 'Social Support', description: 'Provide social interaction and company', common: true },
    { id: 'task_601', name: 'Conversation/Chat', category: 'Social Support', description: 'Engage in meaningful conversation' },
    { id: 'task_602', name: 'Reading Aloud', category: 'Social Support', description: 'Read books, newspapers, or magazines to client' },
    { id: 'task_603', name: 'Music Therapy', category: 'Social Support', description: 'Listen to or play music together' },
    { id: 'task_604', name: 'Games/Puzzles', category: 'Social Support', description: 'Play games or do puzzles together' },
    { id: 'task_605', name: 'Arts & Crafts', category: 'Social Support', description: 'Engage in creative activities' },
    { id: 'task_606', name: 'Reminiscence Therapy', category: 'Social Support', description: 'Discuss memories and life stories' },
    { id: 'task_607', name: 'Photo Album Review', category: 'Social Support', description: 'Look through photos and discuss memories' },
    { id: 'task_608', name: 'Cognitive Exercises', category: 'Social Support', description: 'Mental stimulation activities' },
    { id: 'task_609', name: 'Technology Assistance - Phone', category: 'Social Support', description: 'Help use phone for calls' },
    { id: 'task_610', name: 'Technology Assistance - Computer', category: 'Social Support', description: 'Help use computer/tablet' },
    { id: 'task_611', name: 'Technology Assistance - TV', category: 'Social Support', description: 'Help operate television/remote' },
    { id: 'task_612', name: 'Video Call Setup', category: 'Social Support', description: 'Set up video calls with family' },
    { id: 'task_613', name: 'Letter Writing Assistance', category: 'Social Support', description: 'Help write letters or cards' },
    { id: 'task_614', name: 'Email Assistance', category: 'Social Support', description: 'Help send and read emails' },
    { id: 'task_615', name: 'Social Media Assistance', category: 'Social Support', description: 'Help use social media' },
    { id: 'task_616', name: 'Emotional Support', category: 'Social Support', description: 'Provide emotional support and listening' },
    { id: 'task_617', name: 'Anxiety Management', category: 'Social Support', description: 'Support anxiety reduction techniques' },
    { id: 'task_618', name: 'Depression Support', category: 'Social Support', description: 'Monitor and support mental wellbeing' },
    
    // =====================================================
    // TRANSPORTATION & OUTINGS (700-799)
    // =====================================================
    { id: 'task_700', name: 'Medical Appointment Transport', category: 'Transportation', description: 'Transport to medical appointments', common: true },
    { id: 'task_701', name: 'Pharmacy Visit', category: 'Transportation', description: 'Transport to pharmacy for prescriptions' },
    { id: 'task_702', name: 'Grocery Shopping Trip', category: 'Transportation', description: 'Transport for grocery shopping' },
    { id: 'task_703', name: 'Social Outing', category: 'Transportation', description: 'Transport for social activities' },
    { id: 'task_704', name: 'Church/Religious Services', category: 'Transportation', description: 'Transport to religious services' },
    { id: 'task_705', name: 'Shopping Trip - Clothing', category: 'Transportation', description: 'Transport for clothing shopping' },
    { id: 'task_706', name: 'Shopping Trip - General', category: 'Transportation', description: 'Transport for general shopping' },
    { id: 'task_707', name: 'Hairdresser/Barber Appointment', category: 'Transportation', description: 'Transport to hair appointments' },
    { id: 'task_708', name: 'Bank Visit', category: 'Transportation', description: 'Transport to bank for banking needs' },
    { id: 'task_709', name: 'Post Office Visit', category: 'Transportation', description: 'Transport to post office' },
    { id: 'task_710', name: 'Library Visit', category: 'Transportation', description: 'Transport to library' },
    { id: 'task_711', name: 'Park/Outdoor Outing', category: 'Transportation', description: 'Transport for outdoor activities' },
    { id: 'task_712', name: 'Family Visit', category: 'Transportation', description: 'Transport to visit family members' },
    { id: 'task_713', name: 'Community Center Visit', category: 'Transportation', description: 'Transport to community activities' },
    { id: 'task_714', name: 'Exercise Class Transport', category: 'Transportation', description: 'Transport to exercise classes' },
    
    // =====================================================
    // ADMINISTRATIVE & MANAGEMENT (800-899)
    // =====================================================
    { id: 'task_800', name: 'Care Plan Review', category: 'Administration', description: 'Review and update care plan' },
    { id: 'task_801', name: 'Client Assessment', category: 'Administration', description: 'Complete client assessment', common: true },
    { id: 'task_802', name: 'Progress Notes', category: 'Administration', description: 'Document care provided and observations' },
    { id: 'task_803', name: 'Incident Report', category: 'Administration', description: 'Document and report incidents' },
    { id: 'task_804', name: 'Family Communication', category: 'Administration', description: 'Communicate with family members', common: true },
    { id: 'task_805', name: 'Care Team Meeting', category: 'Administration', description: 'Attend care coordination meetings' },
    { id: 'task_806', name: 'Appointment Scheduling', category: 'Administration', description: 'Schedule medical appointments' },
    { id: 'task_807', name: 'Appointment Reminders', category: 'Administration', description: 'Remind client of upcoming appointments' },
    { id: 'task_808', name: 'Insurance Coordination', category: 'Administration', description: 'Coordinate with insurance providers' },
    { id: 'task_809', name: 'Benefits Management', category: 'Administration', description: 'Assist with benefit applications' },
    { id: 'task_810', name: 'Bill Organization', category: 'Administration', description: 'Organize and track bills' },
    { id: 'task_811', name: 'Mail Management', category: 'Administration', description: 'Sort and organize mail' },
    { id: 'task_812', name: 'Emergency Contact Update', category: 'Administration', description: 'Update emergency contact information' },
    { id: 'task_813', name: 'Medical Record Organization', category: 'Administration', description: 'Organize medical documents' },
    { id: 'task_814', name: 'Equipment Inventory', category: 'Administration', description: 'Track care equipment inventory' },
    
    // =====================================================
    // SAFETY & EMERGENCY (900-999)
    // =====================================================
    { id: 'task_900', name: 'Home Safety Inspection', category: 'Safety', description: 'Inspect home for safety hazards', common: true },
    { id: 'task_901', name: 'Fall Prevention Assessment', category: 'Safety', description: 'Assess and address fall risks' },
    { id: 'task_902', name: 'Smoke Detector Check', category: 'Safety', description: 'Test smoke alarms' },
    { id: 'task_903', name: 'Emergency Plan Review', category: 'Safety', description: 'Review emergency procedures' },
    { id: 'task_904', name: 'Emergency Equipment Check', category: 'Safety', description: 'Check emergency equipment functionality' },
    { id: 'task_905', name: 'Fire Safety Check', category: 'Safety', description: 'Review fire safety and exit routes' },
    { id: 'task_906', name: 'Medication Safety Review', category: 'Safety', description: 'Review medication storage and labeling' },
    { id: 'task_907', name: 'Food Safety Check', category: 'Safety', description: 'Check food storage and expiry dates' },
    { id: 'task_908', name: 'Infection Control Measures', category: 'Safety', description: 'Implement infection prevention' },
    { id: 'task_909', name: 'Emergency Response', category: 'Safety', description: 'Respond to client emergencies' }
];

// Export for use in main application
if (typeof window !== 'undefined') {
    window.COMPREHENSIVE_TASKS_V07 = COMPREHENSIVE_TASKS_V07;
}

