"""
HomeCare Management System - WTForms
Professional Care Coordination Platform
"""

from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, IntegerField, SelectField, DateField, TimeField, BooleanField, PasswordField, SubmitField, HiddenField, FloatField, RadioField, FileField, MultipleFileField
from wtforms.validators import DataRequired, Length, Email, Optional, NumberRange, ValidationError, InputRequired
from wtforms.widgets import TextArea, CheckboxInput
from datetime import date, datetime

class LoginForm(FlaskForm):
    """Login form"""
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=80)])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Login')

class ClientForm(FlaskForm):
    """Client form for adding/editing clients"""
    name = StringField('Client Name', validators=[DataRequired(), Length(min=2, max=200)])
    description = TextAreaField('Description', validators=[Optional(), Length(max=1000)])
    age = IntegerField('Age', validators=[Optional(), NumberRange(min=0, max=120)])
    status = SelectField('Status', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('discharged', 'Discharged')
    ], default='active')
    care_level = SelectField('Care Level', choices=[
        ('standard', 'Standard'),
        ('intensive', 'Intensive'),
        ('specialized', 'Specialized'),
        ('palliative', 'Palliative')
    ], default='standard')
    
    # Contact information
    phone = StringField('Phone Number', validators=[Optional(), Length(max=20)])
    email = StringField('Email', validators=[Optional(), Email(), Length(max=120)])
    address = TextAreaField('Address', validators=[Optional(), Length(max=500)])
    emergency_contact = StringField('Emergency Contact', validators=[Optional(), Length(max=200)])
    
    # Medical information
    medical_conditions = TextAreaField('Medical Conditions', validators=[Optional(), Length(max=1000)])
    allergies = TextAreaField('Allergies', validators=[Optional(), Length(max=500)])
    medications = TextAreaField('Medications', validators=[Optional(), Length(max=1000)])
    special_instructions = TextAreaField('Special Instructions', validators=[Optional(), Length(max=1000)])
    
    # Location
    latitude = StringField('Latitude', validators=[Optional()])
    longitude = StringField('Longitude', validators=[Optional()])
    
    submit = SubmitField('Save Client')

class CareActionForm(FlaskForm):
    """Care action form for logging care activities"""
    client_id = SelectField('Client', coerce=int, validators=[DataRequired()])
    task_id = SelectField('Care Task', coerce=int, validators=[DataRequired()])
    action_date = DateField('Date', validators=[DataRequired()])
    action_time = TimeField('Time', validators=[Optional()])
    notes = TextAreaField('Notes', validators=[Optional(), Length(max=1000)])
    priority = SelectField('Priority', choices=[
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='normal')
    status = SelectField('Status', choices=[
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled')
    ], default='completed')
    
    submit = SubmitField('Log Care Action')

class ScheduledTaskForm(FlaskForm):
    """Scheduled task form for future care planning"""
    client_id = SelectField('Client', coerce=int, validators=[DataRequired()])
    assigned_to_id = SelectField('Assigned To', coerce=int, validators=[DataRequired()])
    task_id = SelectField('Care Task', coerce=int, validators=[DataRequired()])
    scheduled_date = DateField('Scheduled Date', validators=[DataRequired()])
    scheduled_time = TimeField('Scheduled Time', validators=[Optional()])
    priority = SelectField('Priority', choices=[
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='normal')
    notes = TextAreaField('Notes', validators=[Optional(), Length(max=1000)])
    
    submit = SubmitField('Schedule Task')

class EmployeeForm(FlaskForm):
    """Employee form for team management"""
    user_id = SelectField('User', coerce=int, validators=[DataRequired()])
    employee_id = StringField('Employee ID', validators=[Optional(), Length(max=50)])
    department = StringField('Department', validators=[Optional(), Length(max=100)])
    position = StringField('Position', validators=[Optional(), Length(max=100)])
    hire_date = DateField('Hire Date', validators=[Optional()])
    status = SelectField('Status', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('terminated', 'Terminated')
    ], default='active')
    skills = TextAreaField('Skills (one per line)', validators=[Optional()])
    certifications = TextAreaField('Certifications (one per line)', validators=[Optional()])
    emergency_contact = StringField('Emergency Contact', validators=[Optional(), Length(max=200)])
    
    submit = SubmitField('Save Employee')

class UserForm(FlaskForm):
    """User form for user management"""
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    first_name = StringField('First Name', validators=[Optional(), Length(max=100)])
    last_name = StringField('Last Name', validators=[Optional(), Length(max=100)])
    phone = StringField('Phone', validators=[Optional(), Length(max=20)])
    address = TextAreaField('Address', validators=[Optional(), Length(max=500)])
    role = SelectField('Role', choices=[
        ('admin', 'Admin'),
        ('developer', 'Developer'),
        ('supervisor', 'Supervisor'),
        ('caregiver', 'Caregiver')
    ], default='caregiver')
    status = SelectField('Status', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended')
    ], default='active')
    notes = TextAreaField('Notes', validators=[Optional(), Length(max=1000)])
    
    submit = SubmitField('Save User')

class QuickScheduleForm(FlaskForm):
    """Quick schedule form for rapid task scheduling"""
    client_id = SelectField('Client', coerce=int, validators=[DataRequired()])
    task_ids = StringField('Task IDs (comma-separated)', validators=[DataRequired()])
    scheduled_date = DateField('Scheduled Date', validators=[DataRequired()])
    scheduled_time = TimeField('Scheduled Time', validators=[Optional()])
    priority = SelectField('Priority', choices=[
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='normal')
    notes = TextAreaField('Notes', validators=[Optional(), Length(max=1000)])
    
    submit = SubmitField('Schedule Tasks')

class EnhancedClientForm(FlaskForm):
    """Enhanced client form with comprehensive information"""
    # Basic Information
    name = StringField('Client Name', validators=[DataRequired(), Length(min=2, max=200)])
    description = TextAreaField('Description', validators=[Optional(), Length(max=1000)])
    age = IntegerField('Age', validators=[Optional(), NumberRange(min=0, max=120)])
    date_of_birth = DateField('Date of Birth', validators=[Optional()])
    gender = SelectField('Gender', choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], validators=[Optional()])
    status = SelectField('Status', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('discharged', 'Discharged'),
        ('suspended', 'Suspended')
    ], default='active')
    care_level = SelectField('Care Level', choices=[
        ('standard', 'Standard'),
        ('intensive', 'Intensive'),
        ('specialized', 'Specialized'),
        ('palliative', 'Palliative')
    ], default='standard')
    
    # Contact Information
    phone = StringField('Phone Number', validators=[Optional(), Length(max=20)])
    email = StringField('Email', validators=[Optional(), Email(), Length(max=120)])
    address = TextAreaField('Address', validators=[Optional(), Length(max=500)])
    city = StringField('City', validators=[Optional(), Length(max=100)])
    state = StringField('State', validators=[Optional(), Length(max=50)])
    postal_code = StringField('Postal Code', validators=[Optional(), Length(max=20)])
    country = StringField('Country', validators=[Optional(), Length(max=50)], default='US')
    
    # Emergency Contacts
    emergency_contact_name = StringField('Emergency Contact Name', validators=[Optional(), Length(max=200)])
    emergency_contact_phone = StringField('Emergency Contact Phone', validators=[Optional(), Length(max=20)])
    emergency_contact_relationship = StringField('Relationship', validators=[Optional(), Length(max=100)])
    secondary_emergency_contact = StringField('Secondary Emergency Contact', validators=[Optional(), Length(max=200)])
    secondary_emergency_phone = StringField('Secondary Emergency Phone', validators=[Optional(), Length(max=20)])
    
    # Medical Information
    medical_conditions = TextAreaField('Medical Conditions', validators=[Optional(), Length(max=2000)])
    allergies = TextAreaField('Allergies', validators=[Optional(), Length(max=1000)])
    medications = TextAreaField('Medications', validators=[Optional(), Length(max=2000)])
    special_instructions = TextAreaField('Special Instructions', validators=[Optional(), Length(max=2000)])
    dietary_restrictions = TextAreaField('Dietary Restrictions', validators=[Optional(), Length(max=1000)])
    mobility_requirements = TextAreaField('Mobility Requirements', validators=[Optional(), Length(max=1000)])
    communication_needs = TextAreaField('Communication Needs', validators=[Optional(), Length(max=1000)])
    
    # Insurance and Payment
    insurance_provider = StringField('Insurance Provider', validators=[Optional(), Length(max=200)])
    insurance_policy_number = StringField('Policy Number', validators=[Optional(), Length(max=100)])
    medicare_number = StringField('Medicare Number', validators=[Optional(), Length(max=100)])
    medicaid_number = StringField('Medicaid Number', validators=[Optional(), Length(max=100)])
    payment_method = SelectField('Payment Method', choices=[
        ('private', 'Private Pay'),
        ('insurance', 'Insurance'),
        ('medicare', 'Medicare'),
        ('medicaid', 'Medicaid')
    ], validators=[Optional()])
    
    # Care Preferences
    preferred_caregiver_gender = SelectField('Preferred Caregiver Gender', choices=[
        ('', 'No Preference'),
        ('male', 'Male'),
        ('female', 'Female')
    ], validators=[Optional()])
    preferred_language = StringField('Preferred Language', validators=[Optional(), Length(max=50)])
    cultural_considerations = TextAreaField('Cultural Considerations', validators=[Optional(), Length(max=1000)])
    religious_considerations = TextAreaField('Religious Considerations', validators=[Optional(), Length(max=1000)])
    
    # Location
    latitude = StringField('Latitude', validators=[Optional()])
    longitude = StringField('Longitude', validators=[Optional()])
    location_notes = TextAreaField('Location Notes', validators=[Optional(), Length(max=500)])
    
    # Care Assessment
    care_needs_assessment = TextAreaField('Care Needs Assessment', validators=[Optional(), Length(max=2000)])
    risk_factors = TextAreaField('Risk Factors', validators=[Optional(), Length(max=1000)])
    care_goals = TextAreaField('Care Goals', validators=[Optional(), Length(max=1000)])
    care_restrictions = TextAreaField('Care Restrictions', validators=[Optional(), Length(max=1000)])
    
    # Review Dates
    last_assessment_date = DateField('Last Assessment Date', validators=[Optional()])
    next_review_date = DateField('Next Review Date', validators=[Optional()])
    
    submit = SubmitField('Save Client')

class MedicalAssessmentForm(FlaskForm):
    """Medical assessment form for health monitoring"""
    client_id = SelectField('Client', coerce=int, validators=[DataRequired()])
    assessment_type = SelectField('Assessment Type', choices=[
        ('initial', 'Initial Assessment'),
        ('routine', 'Routine Assessment'),
        ('emergency', 'Emergency Assessment'),
        ('follow_up', 'Follow-up Assessment')
    ], validators=[DataRequired()])
    assessment_date = DateField('Assessment Date', validators=[DataRequired()], default=date.today)
    assessment_time = TimeField('Assessment Time', validators=[Optional()])
    
    # Vital Signs
    blood_pressure_systolic = IntegerField('Systolic BP', validators=[Optional(), NumberRange(min=50, max=300)])
    blood_pressure_diastolic = IntegerField('Diastolic BP', validators=[Optional(), NumberRange(min=30, max=200)])
    heart_rate = IntegerField('Heart Rate (BPM)', validators=[Optional(), NumberRange(min=30, max=200)])
    temperature = FloatField('Temperature (°F)', validators=[Optional(), NumberRange(min=90, max=110)])
    oxygen_saturation = IntegerField('Oxygen Saturation (%)', validators=[Optional(), NumberRange(min=70, max=100)])
    weight = FloatField('Weight (lbs)', validators=[Optional(), NumberRange(min=50, max=500)])
    height = FloatField('Height (inches)', validators=[Optional(), NumberRange(min=36, max=84)])
    
    # Health Indicators
    pain_level = SelectField('Pain Level (0-10)', choices=[
        ('', 'Not Assessed'),
        ('0', '0 - No Pain'),
        ('1', '1 - Very Mild'),
        ('2', '2 - Mild'),
        ('3', '3 - Mild'),
        ('4', '4 - Moderate'),
        ('5', '5 - Moderate'),
        ('6', '6 - Moderate'),
        ('7', '7 - Severe'),
        ('8', '8 - Severe'),
        ('9', '9 - Very Severe'),
        ('10', '10 - Unbearable')
    ], validators=[Optional()])
    mobility_level = SelectField('Mobility Level', choices=[
        ('', 'Not Assessed'),
        ('independent', 'Independent'),
        ('assisted', 'Assisted'),
        ('dependent', 'Dependent')
    ], validators=[Optional()])
    cognitive_status = SelectField('Cognitive Status', choices=[
        ('', 'Not Assessed'),
        ('alert', 'Alert'),
        ('confused', 'Confused'),
        ('disoriented', 'Disoriented')
    ], validators=[Optional()])
    mood_status = SelectField('Mood Status', choices=[
        ('', 'Not Assessed'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('depressed', 'Depressed')
    ], validators=[Optional()])
    
    # Assessment Notes
    subjective_notes = TextAreaField('Subjective Notes (Client Report)', validators=[Optional(), Length(max=2000)])
    objective_notes = TextAreaField('Objective Notes (Observations)', validators=[Optional(), Length(max=2000)])
    assessment_notes = TextAreaField('Assessment Notes', validators=[Optional(), Length(max=2000)])
    recommendations = TextAreaField('Recommendations', validators=[Optional(), Length(max=2000)])
    
    # Follow-up
    requires_follow_up = BooleanField('Requires Follow-up')
    follow_up_date = DateField('Follow-up Date', validators=[Optional()])
    follow_up_notes = TextAreaField('Follow-up Notes', validators=[Optional(), Length(max=1000)])
    
    submit = SubmitField('Save Assessment')

class CarePlanForm(FlaskForm):
    """Care plan form for comprehensive care planning"""
    client_id = SelectField('Client', coerce=int, validators=[DataRequired()])
    title = StringField('Plan Title', validators=[DataRequired(), Length(max=200)])
    description = TextAreaField('Description', validators=[Optional(), Length(max=2000)])
    plan_type = SelectField('Plan Type', choices=[
        ('comprehensive', 'Comprehensive'),
        ('specialized', 'Specialized'),
        ('emergency', 'Emergency')
    ], default='comprehensive')
    status = SelectField('Status', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('completed', 'Completed'),
        ('suspended', 'Suspended')
    ], default='active')
    
    # Plan Dates
    start_date = DateField('Start Date', validators=[DataRequired()], default=date.today)
    end_date = DateField('End Date', validators=[Optional()])
    review_date = DateField('Review Date', validators=[Optional()])
    
    # Goals and Objectives
    primary_goals = TextAreaField('Primary Goals', validators=[Optional(), Length(max=2000)])
    secondary_goals = TextAreaField('Secondary Goals', validators=[Optional(), Length(max=2000)])
    success_metrics = TextAreaField('Success Metrics', validators=[Optional(), Length(max=2000)])
    
    submit = SubmitField('Save Care Plan')

class CareReportForm(FlaskForm):
    """Care report form for comprehensive reporting"""
    client_id = SelectField('Client', coerce=int, validators=[DataRequired()])
    report_type = SelectField('Report Type', choices=[
        ('daily', 'Daily Report'),
        ('weekly', 'Weekly Report'),
        ('monthly', 'Monthly Report'),
        ('incident', 'Incident Report'),
        ('assessment', 'Assessment Report')
    ], validators=[DataRequired()])
    report_date = DateField('Report Date', validators=[DataRequired()], default=date.today)
    report_period_start = DateField('Report Period Start', validators=[Optional()])
    report_period_end = DateField('Report Period End', validators=[Optional()])
    
    # Report Content
    title = StringField('Report Title', validators=[DataRequired(), Length(max=200)])
    summary = TextAreaField('Summary', validators=[Optional(), Length(max=2000)])
    detailed_notes = TextAreaField('Detailed Notes', validators=[Optional(), Length(max=5000)])
    
    # Health Status
    overall_health_status = SelectField('Overall Health Status', choices=[
        ('', 'Not Assessed'),
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('critical', 'Critical')
    ], validators=[Optional()])
    mood_status = SelectField('Mood Status', choices=[
        ('', 'Not Assessed'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('depressed', 'Depressed')
    ], validators=[Optional()])
    mobility_status = SelectField('Mobility Status', choices=[
        ('', 'Not Assessed'),
        ('independent', 'Independent'),
        ('assisted', 'Assisted'),
        ('dependent', 'Dependent')
    ], validators=[Optional()])
    cognitive_status = SelectField('Cognitive Status', choices=[
        ('', 'Not Assessed'),
        ('alert', 'Alert'),
        ('confused', 'Confused'),
        ('disoriented', 'Disoriented')
    ], validators=[Optional()])
    
    # Concerns and Recommendations
    concerns = TextAreaField('Concerns', validators=[Optional(), Length(max=2000)])
    recommendations = TextAreaField('Recommendations', validators=[Optional(), Length(max=2000)])
    follow_up_required = BooleanField('Follow-up Required')
    follow_up_notes = TextAreaField('Follow-up Notes', validators=[Optional(), Length(max=1000)])
    
    submit = SubmitField('Save Report')

class IncidentReportForm(FlaskForm):
    """Incident report form for safety and emergency tracking"""
    client_id = SelectField('Client', coerce=int, validators=[DataRequired()])
    incident_type = SelectField('Incident Type', choices=[
        ('fall', 'Fall'),
        ('medical_emergency', 'Medical Emergency'),
        ('behavioral', 'Behavioral Issue'),
        ('safety', 'Safety Concern'),
        ('other', 'Other')
    ], validators=[DataRequired()])
    incident_date = DateField('Incident Date', validators=[DataRequired()], default=date.today)
    incident_time = TimeField('Incident Time', validators=[DataRequired()])
    location = StringField('Location', validators=[Optional(), Length(max=200)])
    
    # Incident Description
    title = StringField('Incident Title', validators=[DataRequired(), Length(max=200)])
    description = TextAreaField('Description', validators=[DataRequired(), Length(max=2000)])
    immediate_actions = TextAreaField('Immediate Actions Taken', validators=[Optional(), Length(max=2000)])
    injuries_sustained = TextAreaField('Injuries Sustained', validators=[Optional(), Length(max=1000)])
    medical_attention_required = BooleanField('Medical Attention Required')
    
    # Severity and Priority
    severity = SelectField('Severity', choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical')
    ], default='low')
    priority = SelectField('Priority', choices=[
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='normal')
    
    # Follow-up
    follow_up_required = BooleanField('Follow-up Required')
    follow_up_actions = TextAreaField('Follow-up Actions', validators=[Optional(), Length(max=2000)])
    follow_up_date = DateField('Follow-up Date', validators=[Optional()])
    
    submit = SubmitField('Save Incident Report')

class CareTemplateForm(FlaskForm):
    """Care template form for reusable care plans"""
    name = StringField('Template Name', validators=[DataRequired(), Length(max=200)])
    description = TextAreaField('Description', validators=[Optional(), Length(max=1000)])
    category = SelectField('Category', choices=[
        ('dementia', 'Dementia Care'),
        ('palliative', 'Palliative Care'),
        ('rehabilitation', 'Rehabilitation'),
        ('post_surgery', 'Post-Surgery Care'),
        ('chronic_condition', 'Chronic Condition'),
        ('general', 'General Care')
    ], validators=[Optional()])
    care_level = SelectField('Care Level', choices=[
        ('standard', 'Standard'),
        ('intensive', 'Intensive'),
        ('specialized', 'Specialized'),
        ('palliative', 'Palliative')
    ], default='standard')
    is_public = BooleanField('Make Template Public')
    
    submit = SubmitField('Save Template')

class NotificationForm(FlaskForm):
    """Notification form for alerts and reminders"""
    user_id = SelectField('User', coerce=int, validators=[DataRequired()])
    title = StringField('Title', validators=[DataRequired(), Length(max=200)])
    message = TextAreaField('Message', validators=[DataRequired(), Length(max=1000)])
    notification_type = SelectField('Type', choices=[
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
        ('reminder', 'Reminder')
    ], default='info')
    priority = SelectField('Priority', choices=[
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='normal')
    expires_at = DateField('Expires At', validators=[Optional()])
    
    submit = SubmitField('Send Notification')

class ExportForm(FlaskForm):
    """Export form for data export"""
    export_type = SelectField('Export Type', choices=[
        ('clients', 'Clients'),
        ('care_actions', 'Care Actions'),
        ('scheduled_tasks', 'Scheduled Tasks'),
        ('medical_assessments', 'Medical Assessments'),
        ('care_reports', 'Care Reports'),
        ('incident_reports', 'Incident Reports')
    ], validators=[DataRequired()])
    format = SelectField('Format', choices=[
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('pdf', 'PDF')
    ], default='csv')
    date_from = DateField('From Date', validators=[Optional()])
    date_to = DateField('To Date', validators=[Optional()])
    include_archived = BooleanField('Include Archived Records')
    
    submit = SubmitField('Export Data')
