"""
HomeCare Management System - Database Models
Professional Care Coordination Platform
"""

from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import json
from collections import defaultdict

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """User model for authentication and role management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # User role and status management
    role = db.Column(db.String(50), default='caregiver')  # admin, developer, caregiver, supervisor
    status = db.Column(db.String(50), default='active')  # active, inactive, suspended
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    # Admin fields
    is_admin = db.Column(db.Boolean, default=False)
    can_manage_users = db.Column(db.Boolean, default=False)
    created_by_admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Multi-tenant architecture
    organization_id = db.Column(db.String(100), nullable=True)  # Firebase organization ID
    is_organization_admin = db.Column(db.Boolean, default=False)
    is_super_admin = db.Column(db.Boolean, default=False)  # Only for system administrators
    
    # Relationships
    clients = db.relationship('Client', backref='assigned_caregiver', lazy='dynamic', cascade='all, delete-orphan')
    care_actions = db.relationship('CareAction', backref='performed_by', lazy='dynamic', cascade='all, delete-orphan')
    scheduled_tasks = db.relationship('ScheduledTask', backref='assigned_to', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def get_full_name(self):
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def can_delete(self):
        """Check if user can delete records"""
        return self.role in ['admin', 'developer', 'supervisor']
    
    def can_manage_clients(self):
        """Check if user can manage clients"""
        return self.role in ['admin', 'developer', 'supervisor', 'caregiver']
    
    def __repr__(self):
        return f'<User {self.username}>'

class Client(db.Model):
    """Client model for home care recipients"""
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    age = db.Column(db.Integer)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))  # male, female, other
    status = db.Column(db.String(50), default='active')  # active, inactive, discharged, suspended
    care_level = db.Column(db.String(50), default='standard')  # standard, intensive, specialized, palliative
    
    # Contact information
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(50), default='US')
    
    # Emergency contacts
    emergency_contact_name = db.Column(db.String(200))
    emergency_contact_phone = db.Column(db.String(20))
    emergency_contact_relationship = db.Column(db.String(100))
    secondary_emergency_contact = db.Column(db.String(200))
    secondary_emergency_phone = db.Column(db.String(20))
    
    # Medical information
    medical_conditions = db.Column(db.Text)
    allergies = db.Column(db.Text)
    medications = db.Column(db.Text)
    special_instructions = db.Column(db.Text)
    dietary_restrictions = db.Column(db.Text)
    mobility_requirements = db.Column(db.Text)
    communication_needs = db.Column(db.Text)
    
    # Insurance and payment
    insurance_provider = db.Column(db.String(200))
    insurance_policy_number = db.Column(db.String(100))
    medicare_number = db.Column(db.String(100))
    medicaid_number = db.Column(db.String(100))
    payment_method = db.Column(db.String(50))  # private, insurance, medicare, medicaid
    
    # Care preferences
    preferred_caregiver_gender = db.Column(db.String(10))
    preferred_language = db.Column(db.String(50))
    cultural_considerations = db.Column(db.Text)
    religious_considerations = db.Column(db.Text)
    
    # Location
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    location_notes = db.Column(db.Text)
    
    # Care assessment
    care_needs_assessment = db.Column(db.Text)
    risk_factors = db.Column(db.Text)
    care_goals = db.Column(db.Text)
    care_restrictions = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_assessment_date = db.Column(db.Date)
    next_review_date = db.Column(db.Date)
    
    # Relationships
    assigned_caregiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    care_actions = db.relationship('CareAction', backref='client', lazy='dynamic', cascade='all, delete-orphan')
    scheduled_tasks = db.relationship('ScheduledTask', backref='client', lazy='dynamic', cascade='all, delete-orphan')
    care_plans = db.relationship('CarePlan', backref='client', lazy='dynamic', cascade='all, delete-orphan')
    medical_assessments = db.relationship('MedicalAssessment', backref='client', lazy='dynamic', cascade='all, delete-orphan')
    care_reports = db.relationship('CareReport', backref='client', lazy='dynamic', cascade='all, delete-orphan')
    incident_reports = db.relationship('IncidentReport', backref='client', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_care_level_class(self):
        """Get CSS class for care level"""
        level_classes = {
            'standard': 'bg-primary',
            'intensive': 'bg-warning',
            'specialized': 'bg-info',
            'palliative': 'bg-danger'
        }
        return level_classes.get(self.care_level, 'bg-secondary')
    
    def get_status_class(self):
        """Get CSS class for status"""
        status_classes = {
            'active': 'bg-success',
            'inactive': 'bg-secondary',
            'discharged': 'bg-info'
        }
        return status_classes.get(self.status, 'bg-secondary')
    
    def __repr__(self):
        return f'<Client {self.name}>'

class CareAction(db.Model):
    """Care action model for logging care activities"""
    __tablename__ = 'care_actions'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    performed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('care_tasks.id'), nullable=False)
    
    # Action details
    task_name = db.Column(db.String(200), nullable=False)
    task_category = db.Column(db.String(100))
    action_date = db.Column(db.Date, nullable=False)
    action_time = db.Column(db.Time)
    notes = db.Column(db.Text)
    priority = db.Column(db.String(20), default='normal')  # normal, high, urgent
    status = db.Column(db.String(20), default='completed')  # completed, pending, cancelled
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_priority_class(self):
        """Get CSS class for priority"""
        priority_classes = {
            'normal': 'bg-secondary',
            'high': 'bg-warning',
            'urgent': 'bg-danger'
        }
        return priority_classes.get(self.priority, 'bg-secondary')
    
    def __repr__(self):
        return f'<CareAction {self.task_name} for {self.client.name}>'

class CareTask(db.Model):
    """Care task template model"""
    __tablename__ = 'care_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_common = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    care_actions = db.relationship('CareAction', backref='care_task', lazy='dynamic')
    scheduled_tasks = db.relationship('ScheduledTask', backref='care_task', lazy='dynamic')
    
    def get_category_class(self):
        """Get CSS class for category"""
        category_classes = {
            'Personal Care': 'bg-primary',
            'Medical Care': 'bg-danger',
            'Daily Living': 'bg-success',
            'Emotional Support': 'bg-info',
            'Safety & Monitoring': 'bg-warning',
            'Specialized Care': 'bg-secondary'
        }
        return category_classes.get(self.category, 'bg-secondary')
    
    def __repr__(self):
        return f'<CareTask {self.name}>'

class ScheduledTask(db.Model):
    """Scheduled task model for future care planning"""
    __tablename__ = 'scheduled_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('care_tasks.id'), nullable=False)
    
    # Task details
    task_name = db.Column(db.String(200), nullable=False)
    task_category = db.Column(db.String(100))
    scheduled_date = db.Column(db.Date, nullable=False)
    scheduled_time = db.Column(db.Time)
    priority = db.Column(db.String(20), default='normal')  # normal, high, urgent
    status = db.Column(db.String(20), default='pending')  # pending, completed, cancelled
    notes = db.Column(db.Text)
    
    # Completion tracking
    completed_at = db.Column(db.DateTime)
    completed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    completion_notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def is_overdue(self):
        """Check if task is overdue"""
        if self.status == 'completed':
            return False
        return datetime.now().date() > self.scheduled_date
    
    def get_priority_class(self):
        """Get CSS class for priority"""
        priority_classes = {
            'normal': 'bg-secondary',
            'high': 'bg-warning',
            'urgent': 'bg-danger'
        }
        return priority_classes.get(self.priority, 'bg-secondary')
    
    def __repr__(self):
        return f'<ScheduledTask {self.task_name} for {self.client.name}>'

class Employee(db.Model):
    """Employee model for team management"""
    __tablename__ = 'employees'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Employee details
    employee_id = db.Column(db.String(50), unique=True)
    department = db.Column(db.String(100))
    position = db.Column(db.String(100))
    hire_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='active')  # active, inactive, terminated
    
    # Skills and certifications
    skills = db.Column(db.Text)  # JSON string of skills
    certifications = db.Column(db.Text)  # JSON string of certifications
    emergency_contact = db.Column(db.String(200))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_skills_list(self):
        """Get skills as a list"""
        if self.skills:
            return json.loads(self.skills)
        return []
    
    def set_skills_list(self, skills_list):
        """Set skills from a list"""
        self.skills = json.dumps(skills_list)
    
    def get_certifications_list(self):
        """Get certifications as a list"""
        if self.certifications:
            return json.loads(self.certifications)
        return []
    
    def set_certifications_list(self, certs_list):
        """Set certifications from a list"""
        self.certifications = json.dumps(certs_list)
    
    def __repr__(self):
        return f'<Employee {self.user.username}>'

class CarePlan(db.Model):
    """Care plan model for comprehensive care planning"""
    __tablename__ = 'care_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Plan details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    plan_type = db.Column(db.String(50), default='comprehensive')  # comprehensive, specialized, emergency
    status = db.Column(db.String(20), default='active')  # active, inactive, completed, suspended
    
    # Plan dates
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    review_date = db.Column(db.Date)
    
    # Plan goals and objectives
    primary_goals = db.Column(db.Text)
    secondary_goals = db.Column(db.Text)
    success_metrics = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    care_plan_tasks = db.relationship('CarePlanTask', backref='care_plan', lazy='dynamic', cascade='all, delete-orphan')
    assessments = db.relationship('MedicalAssessment', backref='care_plan', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<CarePlan {self.title} for {self.client.name}>'

class CarePlanTask(db.Model):
    """Care plan task model for detailed task planning"""
    __tablename__ = 'care_plan_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    care_plan_id = db.Column(db.Integer, db.ForeignKey('care_plans.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('care_tasks.id'), nullable=False)
    
    # Task details
    task_name = db.Column(db.String(200), nullable=False)
    task_category = db.Column(db.String(100))
    description = db.Column(db.Text)
    priority = db.Column(db.String(20), default='normal')  # normal, high, urgent
    frequency = db.Column(db.String(50), default='daily')  # daily, weekly, monthly, as_needed
    duration_minutes = db.Column(db.Integer, default=30)
    
    # Assignment
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_required = db.Column(db.Boolean, default=True)
    
    # Status tracking
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    completion_notes = db.Column(db.Text)
    completed_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<CarePlanTask {self.task_name}>'

class MedicalAssessment(db.Model):
    """Medical assessment model for health monitoring"""
    __tablename__ = 'medical_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    care_plan_id = db.Column(db.Integer, db.ForeignKey('care_plans.id'), nullable=True)
    performed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Assessment details
    assessment_type = db.Column(db.String(50), nullable=False)  # initial, routine, emergency, follow_up
    assessment_date = db.Column(db.Date, nullable=False)
    assessment_time = db.Column(db.Time)
    
    # Vital signs
    blood_pressure_systolic = db.Column(db.Integer)
    blood_pressure_diastolic = db.Column(db.Integer)
    heart_rate = db.Column(db.Integer)
    temperature = db.Column(db.Float)
    oxygen_saturation = db.Column(db.Integer)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    
    # Health indicators
    pain_level = db.Column(db.Integer)  # 0-10 scale
    mobility_level = db.Column(db.String(20))  # independent, assisted, dependent
    cognitive_status = db.Column(db.String(20))  # alert, confused, disoriented
    mood_status = db.Column(db.String(20))  # good, fair, poor, depressed
    
    # Assessment notes
    subjective_notes = db.Column(db.Text)  # Client's own report
    objective_notes = db.Column(db.Text)  # Caregiver's observations
    assessment_notes = db.Column(db.Text)  # Overall assessment
    recommendations = db.Column(db.Text)  # Care recommendations
    
    # Follow-up
    requires_follow_up = db.Column(db.Boolean, default=False)
    follow_up_date = db.Column(db.Date)
    follow_up_notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_bmi(self):
        """Calculate BMI if height and weight are available"""
        if self.height and self.weight:
            height_m = self.height / 100  # Convert cm to meters
            return round(self.weight / (height_m ** 2), 1)
        return None
    
    def get_blood_pressure_category(self):
        """Get blood pressure category"""
        if not self.blood_pressure_systolic or not self.blood_pressure_diastolic:
            return None
        
        sys = self.blood_pressure_systolic
        dia = self.blood_pressure_diastolic
        
        if sys < 120 and dia < 80:
            return 'normal'
        elif sys < 130 and dia < 80:
            return 'elevated'
        elif sys < 140 or dia < 90:
            return 'high_stage_1'
        elif sys < 180 or dia < 120:
            return 'high_stage_2'
        else:
            return 'hypertensive_crisis'
    
    def __repr__(self):
        return f'<MedicalAssessment {self.assessment_type} for {self.client.name}>'

class CareReport(db.Model):
    """Care report model for comprehensive reporting"""
    __tablename__ = 'care_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Report details
    report_type = db.Column(db.String(50), nullable=False)  # daily, weekly, monthly, incident, assessment
    report_date = db.Column(db.Date, nullable=False)
    report_period_start = db.Column(db.Date)
    report_period_end = db.Column(db.Date)
    
    # Report content
    title = db.Column(db.String(200), nullable=False)
    summary = db.Column(db.Text)
    detailed_notes = db.Column(db.Text)
    
    # Care activities summary
    total_actions = db.Column(db.Integer, default=0)
    completed_tasks = db.Column(db.Integer, default=0)
    pending_tasks = db.Column(db.Integer, default=0)
    urgent_issues = db.Column(db.Integer, default=0)
    
    # Health status
    overall_health_status = db.Column(db.String(20))  # excellent, good, fair, poor, critical
    mood_status = db.Column(db.String(20))
    mobility_status = db.Column(db.String(20))
    cognitive_status = db.Column(db.String(20))
    
    # Concerns and recommendations
    concerns = db.Column(db.Text)
    recommendations = db.Column(db.Text)
    follow_up_required = db.Column(db.Boolean, default=False)
    follow_up_notes = db.Column(db.Text)
    
    # Status
    status = db.Column(db.String(20), default='draft')  # draft, submitted, reviewed, approved
    reviewed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime)
    review_notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<CareReport {self.title} for {self.client.name}>'

class IncidentReport(db.Model):
    """Incident report model for safety and emergency tracking"""
    __tablename__ = 'incident_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    reported_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Incident details
    incident_type = db.Column(db.String(50), nullable=False)  # fall, medical_emergency, behavioral, safety, other
    incident_date = db.Column(db.Date, nullable=False)
    incident_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(200))
    
    # Incident description
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    immediate_actions = db.Column(db.Text)
    injuries_sustained = db.Column(db.Text)
    medical_attention_required = db.Column(db.Boolean, default=False)
    
    # Severity and priority
    severity = db.Column(db.String(20), default='low')  # low, medium, high, critical
    priority = db.Column(db.String(20), default='normal')  # normal, high, urgent
    
    # Follow-up
    follow_up_required = db.Column(db.Boolean, default=False)
    follow_up_actions = db.Column(db.Text)
    follow_up_date = db.Column(db.Date)
    follow_up_completed = db.Column(db.Boolean, default=False)
    
    # Status
    status = db.Column(db.String(20), default='open')  # open, investigating, resolved, closed
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    resolution_notes = db.Column(db.Text)
    resolved_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<IncidentReport {self.title} for {self.client.name}>'

class Notification(db.Model):
    """Notification model for alerts and reminders"""
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Notification details
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default='info')  # info, warning, error, success, reminder
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    
    # Related entities
    related_client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=True)
    related_task_id = db.Column(db.Integer, db.ForeignKey('scheduled_tasks.id'), nullable=True)
    related_action_id = db.Column(db.Integer, db.ForeignKey('care_actions.id'), nullable=True)
    
    # Status
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    is_archived = db.Column(db.Boolean, default=False)
    archived_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    
    def is_expired(self):
        """Check if notification has expired"""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False
    
    def __repr__(self):
        return f'<Notification {self.title} for {self.user.username}>'

class CareTemplate(db.Model):
    """Care template model for reusable care plans"""
    __tablename__ = 'care_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Template details
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))  # dementia, palliative, rehabilitation, etc.
    care_level = db.Column(db.String(50))  # standard, intensive, specialized, palliative
    
    # Template content
    template_data = db.Column(db.Text)  # JSON data for template structure
    is_public = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Usage tracking
    usage_count = db.Column(db.Integer, default=0)
    last_used_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_template_data(self):
        """Get template data as dictionary"""
        if self.template_data:
            return json.loads(self.template_data)
        return {}
    
    def set_template_data(self, data):
        """Set template data from dictionary"""
        self.template_data = json.dumps(data)
    
    def __repr__(self):
        return f'<CareTemplate {self.name}>'

class WeatherData(db.Model):
    """Weather data model for location-based weather tracking"""
    __tablename__ = 'weather_data'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=True)
    location_latitude = db.Column(db.Float, nullable=False)
    location_longitude = db.Column(db.Float, nullable=False)
    
    # Weather details
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    
    # Weather conditions
    temperature = db.Column(db.Float)  # Celsius
    humidity = db.Column(db.Float)  # Percentage
    pressure = db.Column(db.Float)  # hPa
    wind_speed = db.Column(db.Float)  # km/h
    wind_direction = db.Column(db.Integer)  # Degrees
    precipitation = db.Column(db.Float)  # mm
    uv_index = db.Column(db.Integer)
    
    # Weather description
    condition = db.Column(db.String(100))  # sunny, cloudy, rainy, etc.
    description = db.Column(db.String(200))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<WeatherData {self.condition} at {self.location_latitude}, {self.location_longitude}>'

def init_default_care_tasks(db):
    """Initialize default care tasks"""
    default_tasks = [
        # Personal Care
        {'name': 'Personal Hygiene Assistance', 'category': 'Personal Care', 'common': True, 'description': 'Assist with daily hygiene routines'},
        {'name': 'Bathing Assistance', 'category': 'Personal Care', 'common': True, 'description': 'Help with bathing and showering'},
        {'name': 'Dressing Assistance', 'category': 'Personal Care', 'common': True, 'description': 'Help with getting dressed and undressed'},
        {'name': 'Grooming Assistance', 'category': 'Personal Care', 'common': True, 'description': 'Assist with hair care, shaving, and grooming'},
        {'name': 'Toileting Assistance', 'category': 'Personal Care', 'common': True, 'description': 'Help with bathroom needs'},
        {'name': 'Mobility Assistance', 'category': 'Personal Care', 'common': True, 'description': 'Help with walking and movement'},
        
        # Medical Care
        {'name': 'Medication Administration', 'category': 'Medical Care', 'common': True, 'description': 'Administer prescribed medications'},
        {'name': 'Vital Signs Check', 'category': 'Medical Care', 'common': True, 'description': 'Monitor blood pressure, pulse, temperature'},
        {'name': 'Blood Pressure Monitoring', 'category': 'Medical Care', 'common': True, 'description': 'Regular blood pressure checks'},
        {'name': 'Blood Sugar Testing', 'category': 'Medical Care', 'common': True, 'description': 'Monitor blood glucose levels'},
        {'name': 'Wound Care', 'category': 'Medical Care', 'common': False, 'description': 'Clean and dress wounds'},
        {'name': 'Injection Administration', 'category': 'Medical Care', 'common': False, 'description': 'Give injections as prescribed'},
        {'name': 'Physical Therapy Exercises', 'category': 'Medical Care', 'common': False, 'description': 'Assist with prescribed exercises'},
        {'name': 'Respiratory Care', 'category': 'Medical Care', 'common': False, 'description': 'Assist with breathing treatments'},
        
        # Daily Living
        {'name': 'Meal Preparation', 'category': 'Daily Living', 'common': True, 'description': 'Prepare nutritious meals'},
        {'name': 'Feeding Assistance', 'category': 'Daily Living', 'common': True, 'description': 'Help with eating and drinking'},
        {'name': 'Housekeeping', 'category': 'Daily Living', 'common': True, 'description': 'Light housekeeping tasks'},
        {'name': 'Laundry', 'category': 'Daily Living', 'common': True, 'description': 'Wash and fold clothes'},
        {'name': 'Shopping', 'category': 'Daily Living', 'common': True, 'description': 'Grocery and personal shopping'},
        {'name': 'Transportation', 'category': 'Daily Living', 'common': True, 'description': 'Transport to appointments'},
        {'name': 'Appointment Scheduling', 'category': 'Daily Living', 'common': True, 'description': 'Schedule medical appointments'},
        {'name': 'Medication Pickup', 'category': 'Daily Living', 'common': True, 'description': 'Pick up prescriptions'},
        
        # Emotional Support
        {'name': 'Companionship', 'category': 'Emotional Support', 'common': True, 'description': 'Provide social interaction and companionship'},
        {'name': 'Social Activities', 'category': 'Emotional Support', 'common': True, 'description': 'Engage in recreational activities'},
        {'name': 'Mental Health Check', 'category': 'Emotional Support', 'common': True, 'description': 'Monitor emotional well-being'},
        {'name': 'Family Communication', 'category': 'Emotional Support', 'common': False, 'description': 'Facilitate family communication'},
        {'name': 'Crisis Intervention', 'category': 'Emotional Support', 'common': False, 'description': 'Provide crisis support'},
        
        # Safety & Monitoring
        {'name': 'Safety Assessment', 'category': 'Safety & Monitoring', 'common': True, 'description': 'Assess home safety conditions'},
        {'name': 'Fall Risk Assessment', 'category': 'Safety & Monitoring', 'common': True, 'description': 'Evaluate fall risk factors'},
        {'name': 'Home Safety Check', 'category': 'Safety & Monitoring', 'common': True, 'description': 'Check for safety hazards'},
        {'name': 'Emergency Response', 'category': 'Safety & Monitoring', 'common': False, 'description': 'Respond to emergency situations'},
        {'name': 'Security Check', 'category': 'Safety & Monitoring', 'common': False, 'description': 'Verify home security'},
        
        # Specialized Care
        {'name': 'Dementia Care', 'category': 'Specialized Care', 'common': False, 'description': 'Specialized dementia support'},
        {'name': 'Alzheimer\'s Support', 'category': 'Specialized Care', 'common': False, 'description': 'Alzheimer\'s specific care'},
        {'name': 'Disability Support', 'category': 'Specialized Care', 'common': False, 'description': 'Support for physical disabilities'},
        {'name': 'Palliative Care', 'category': 'Specialized Care', 'common': False, 'description': 'End-of-life comfort care'},
        {'name': 'Hospice Support', 'category': 'Specialized Care', 'common': False, 'description': 'Hospice care assistance'},
        {'name': 'Rehabilitation Support', 'category': 'Specialized Care', 'common': False, 'description': 'Post-injury rehabilitation'}
    ]
    
    for task_data in default_tasks:
        existing_task = CareTask.query.filter_by(name=task_data['name']).first()
        if not existing_task:
            task = CareTask(**task_data)
            db.session.add(task)
    
    db.session.commit()
