# Actions Terminology Update - Home Care Workers

## ✅ Updates Completed

### 1. Actions.js Terminology Updates ✅
- ✅ **Variable Names**: `hivesArray` → `clientsArray` (with backward compatibility)
- ✅ **Display Icons**: Hexagon (`bi-hexagon`) → Home care icon (`bi-house-heart`)
- ✅ **Filter Keywords**: Added home care terms to strength keywords:
  - Added: `'independent', 'assisted', 'dependent', 'rehabilitation', 'hospice', 'client status', 'status update'`
- ✅ **Move Keywords**: Added care-specific terms:
  - Added: `'discharge', 'admission', 'placement'`
- ✅ **Client References**: Updated to use `client.clientName` with fallback to `hiveName`

### 2. HTML Form Updates ✅
- ✅ **Label**: "Specific Hive (Optional)" → "Specific Client (Optional)"
- ✅ **Placeholder**: "All hives in site" → "All clients at location"
- ✅ **Filter Label**: "Hide Hive Strength Updates" → "Hide Client Status Updates"
- ✅ **Icon**: Hexagon → Heart-pulse icon
- ✅ **Placeholder Text**: "inspection or treatment" → "care visit or assessment"
- ✅ **Site Label**: "Apiary Sites" → "Client Locations"
- ✅ **Form Placeholder**: "Main Apiary, North Field" → "Main Care Facility, North Branch"
- ✅ **Help Text**: "apiary location" → "client location"

### 3. Site Classification Updates ✅
- ✅ **Functional Classification**:
  - "Production" → "Residential Care"
  - "NUC (Nucleus)" → "Assisted Living"
  - "Queen Rearing" → "Rehabilitation Facility"
  - Kept: Research, Education, Quarantine, Backup, Custom
- ✅ **Seasonal Classification**:
  - "Summer Site" → "Temporary/Seasonal"
  - "Winter Site" → "Short-term Care"
  - "All Year Round" → "Long-term Care"

### 4. Task List Expansion ✅
Added 35 new home care-specific tasks (task_41 through task_75):

#### Health & Medical Tasks:
- Medication Administration (common)
- Medication Refill Coordination
- Blood Glucose Monitoring
- Blood Pressure Monitoring (common)
- Temperature Check
- Pain Assessment
- Hydration Monitoring
- Skin Integrity Check
- Catheter Care
- Oxygen Therapy Support
- Medication Side Effect Monitoring

#### Personal Care Tasks:
- Bowel & Bladder Care
- Dressing Assistance

#### Assessment Tasks:
- Fall Risk Assessment
- Nutrition Assessment
- Behavioral Observation
- Sleep Pattern Monitoring

#### Support Services Tasks:
- Appointment Reminder
- Appointment Escort
- Respite Care
- Grief Support
- Social Activities
- Laundry Assistance
- Pet Care Assistance
- Mail & Bill Organization
- Technology Assistance

#### Specialized Care Tasks:
- Dementia Care Support
- End-of-Life Care Support
- Cognitive Exercises
- Range of Motion Exercises

#### Safety & Administration Tasks:
- Home Modification Assessment
- Emergency Contact Update
- Insurance Coordination
- Care Team Meeting
- Caregiver Training

---

## 📊 Task Categories

The system now includes tasks across these categories:
- **Assessment** - Client evaluations and monitoring
- **Health** - Medical care and health monitoring
- **Personal Care** - Daily living assistance
- **Support Services** - Practical assistance and companionship
- **Safety** - Safety checks and risk assessments
- **Administration** - Record keeping and coordination
- **Management** - Care coordination and planning
- **Communication** - Family and team communication
- **Emergency** - Emergency response
- **Problems** - Issue identification and resolution
- **Seasonal** - Seasonal care planning
- **Maintenance** - Equipment and facility maintenance

---

## ✅ Backward Compatibility

All changes maintain backward compatibility:
- ✅ Old variable names still work (aliases created)
- ✅ Old field names still work (support both)
- ✅ Old filter keywords still work (expanded, not replaced)

---

## ✅ Status

**Actions Terminology**: ✅ **COMPLETE**  
**Task List**: ✅ **EXPANDED** (40 → 75 tasks)  
**HTML Forms**: ✅ **UPDATED**  
**Icons**: ✅ **UPDATED**  

The actions system is now fully adapted for home care workers with appropriate terminology and comprehensive task options.

---

**Date**: January 28, 2025  
**Version**: 2.0 - CareMarshall


