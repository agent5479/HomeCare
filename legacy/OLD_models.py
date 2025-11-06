from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # User role and status management
    role = db.Column(db.String(50), default='staff')  # admin, owner, director, staff, contractor, trial
    status = db.Column(db.String(50), default='active')  # active, inactive, suspended, trial
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
    hive_sites = db.relationship('HiveSite', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    organization = db.relationship('Organization', backref='users', lazy='dynamic')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def get_full_name(self):
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def is_owner_or_admin(self):
        """Check if user is owner or admin"""
        return self.role in ['admin', 'owner'] or self.is_admin
    
    def can_edit_users(self):
        """Check if user can edit other users"""
        return self.is_admin or self.can_manage_users or self.role in ['admin', 'owner', 'director']
    
    def is_super_admin(self):
        """Check if user is a super admin (system-wide)"""
        return self.is_super_admin
    
    def is_org_admin(self):
        """Check if user is an organization admin"""
        return self.is_organization_admin or self.role in ['admin', 'owner']
    
    def can_manage_organization(self):
        """Check if user can manage organization settings"""
        return self.is_organization_admin or self.is_super_admin or self.role in ['admin', 'owner']
    
    def get_organization_users(self):
        """Get all users in the same organization"""
        if not self.organization_id:
            return User.query.filter_by(id=self.id)
        return User.query.filter_by(organization_id=self.organization_id)
    
    def get_role_display_name(self):
        """Get display name for role"""
        role_names = {
            'admin': 'Administrator',
            'owner': 'Owner',
            'director': 'Director',
            'staff': 'Staff Member',
            'contractor': 'Contractor',
            'trial': 'Trial User'
        }
        return role_names.get(self.role, self.role.title())
    
    def get_status_display_name(self):
        """Get display name for status"""
        status_names = {
            'active': 'Active',
            'inactive': 'Inactive',
            'suspended': 'Suspended',
            'trial': 'Trial'
        }
        return status_names.get(self.status, self.status.title())


class Organization(db.Model):
    """Organization model for multi-tenant architecture"""
    __tablename__ = 'organizations'
    
    id = db.Column(db.Integer, primary_key=True)
    firebase_org_id = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    # Organization settings
    max_users = db.Column(db.Integer, default=10)
    max_sites = db.Column(db.Integer, default=50)
    subscription_tier = db.Column(db.String(50), default='basic')  # basic, pro, enterprise
    
    # Contact information
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='organization', lazy='dynamic')
    
    def __repr__(self):
        return f'<Organization {self.name}>'
    
    def get_user_count(self):
        """Get number of active users in organization"""
        return self.users.filter_by(is_active=True).count()
    
    def get_site_count(self):
        """Get number of sites in organization"""
        return HiveSite.query.join(User).filter(
            User.organization_id == self.firebase_org_id,
            HiveSite.is_active == True
        ).count()


class HiveSite(db.Model):
    """Hive site location model"""
    __tablename__ = 'hive_sites'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    hive_count = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Custom settings
    harvest_timeline = db.Column(db.String(100))
    sugar_requirements = db.Column(db.String(100))
    notes = db.Column(db.Text)
    
    # New landowner information
    landowner_name = db.Column(db.String(100))
    landowner_phone = db.Column(db.String(20))
    landowner_email = db.Column(db.String(120))
    landowner_address = db.Column(db.Text)
    
    # Site classification
    functional_classification = db.Column(db.String(20), default='production')  # production, nucleus, queen-rearing, research, education, quarantine, backup, custom
    seasonal_classification = db.Column(db.String(20), default='summer')  # summer, winter
    access_type = db.Column(db.String(20), default='all_weather')  # all_weather, dry_only
    contact_before_visit = db.Column(db.Boolean, default=False)
    is_quarantine = db.Column(db.Boolean, default=False)
    
    # Hive setup details
    single_brood_boxes = db.Column(db.Integer, default=0)
    double_brood_boxes = db.Column(db.Integer, default=0)
    nucs = db.Column(db.Integer, default=0)
    dead_hives = db.Column(db.Integer, default=0)
    top_splits = db.Column(db.Integer, default=0)
    
    # Hive strength ratings
    strong_hives = db.Column(db.Integer, default=0)
    medium_hives = db.Column(db.Integer, default=0)
    weak_hives = db.Column(db.Integer, default=0)
    
    # Overall site strength categorization
    site_strength = db.Column(db.String(20), default='medium')  # strong, medium, weak, nuc
    
    # Relationships
    individual_hives = db.relationship('IndividualHive', backref='site', lazy='dynamic', cascade='all, delete-orphan')
    actions = db.relationship('HiveAction', backref='site', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<HiveSite {self.name}>'
    
    def get_strength_display_name(self):
        """Get display name for site strength"""
        strength_names = {
            'strong': 'Strong',
            'medium': 'Medium',
            'weak': 'Weak',
            'nuc': 'NUC'
        }
        return strength_names.get(self.site_strength, 'Medium')
    
    def get_strength_color(self):
        """Get color for site strength"""
        colors = {
            'strong': 'success',
            'medium': 'warning',
            'weak': 'danger',
            'nuc': 'info'
        }
        return colors.get(self.site_strength, 'secondary')


class IndividualHive(db.Model):
    """Individual hive tracking (optional, for infection management)"""
    __tablename__ = 'individual_hives'
    
    id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('hive_sites.id'), nullable=False)
    hive_number = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='healthy')  # healthy, infected, quarantine, etc.
    
    # Hive strength categorization
    hive_strength = db.Column(db.String(20), default='medium')  # strong, medium, weak, nuc
    
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    actions = db.relationship('HiveAction', backref='individual_hive', lazy='dynamic')
    
    def __repr__(self):
        return f'<IndividualHive {self.hive_number}>'
    
    def get_strength_display_name(self):
        """Get display name for hive strength"""
        strength_names = {
            'strong': 'Strong',
            'medium': 'Medium',
            'weak': 'Weak',
            'nuc': 'NUC'
        }
        return strength_names.get(self.hive_strength, 'Medium')
    
    def get_strength_color(self):
        """Get color for hive strength"""
        colors = {
            'strong': 'success',
            'medium': 'warning',
            'weak': 'danger',
            'nuc': 'info'
        }
        return colors.get(self.hive_strength, 'secondary')


class TaskType(db.Model):
    """Predefined task types for hive management"""
    __tablename__ = 'task_types'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # inspection, feeding, treatment, harvest, maintenance
    is_active = db.Column(db.Boolean, default=True)
    order = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<TaskType {self.name}>'


class HiveAction(db.Model):
    """Record of actions performed on hives"""
    __tablename__ = 'hive_actions'
    
    id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('hive_sites.id'), nullable=False)
    individual_hive_id = db.Column(db.Integer, db.ForeignKey('individual_hives.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Action details
    task_type_id = db.Column(db.Integer, db.ForeignKey('task_types.id'), nullable=True)
    task_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    action_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Status
    is_archived = db.Column(db.Boolean, default=False)
    
    # Relationships
    user = db.relationship('User', backref='actions')
    task_type = db.relationship('TaskType', backref='actions')
    
    def __repr__(self):
        return f'<HiveAction {self.task_name} - {self.action_date}>'


class DiseaseReport(db.Model):
    """Disease reporting for sites"""
    __tablename__ = 'disease_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('hive_sites.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Disease counts
    afb_count = db.Column(db.Integer, default=0)  # American Foulbrood
    varroa_count = db.Column(db.Integer, default=0)  # Varroa mites
    chalkbrood_count = db.Column(db.Integer, default=0)  # Chalkbrood
    sacbrood_count = db.Column(db.Integer, default=0)  # Sacbrood
    dwv_count = db.Column(db.Integer, default=0)  # Deformed Wing Virus
    
    # Report details
    report_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    site = db.relationship('HiveSite', backref='disease_reports')
    user = db.relationship('User', backref='disease_reports')
    
    def __repr__(self):
        return f'<DiseaseReport {self.site.name} - {self.report_date}>'


class ScheduledTask(db.Model):
    """Scheduled tasks for hive management"""
    __tablename__ = 'scheduled_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    task_template_id = db.Column(db.Integer, db.ForeignKey('task_templates.id'), nullable=False)
    
    # Task details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    # Scheduling
    scheduled_date = db.Column(db.DateTime, nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    estimated_duration = db.Column(db.Integer, default=60)  # minutes
    
    # Status
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled, overdue
    priority = db.Column(db.String(10), default='medium')  # low, medium, high, urgent
    
    # Assignment
    assigned_to_site_id = db.Column(db.Integer, db.ForeignKey('hive_sites.id'), nullable=True)
    assigned_to_hive_id = db.Column(db.Integer, db.ForeignKey('individual_hives.id'), nullable=True)
    
    # Recurrence
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_pattern = db.Column(db.String(20))  # daily, weekly, monthly, yearly
    recurrence_interval = db.Column(db.Integer, default=1)
    recurrence_end_date = db.Column(db.DateTime, nullable=True)
    
    # Calendar integration
    google_calendar_event_id = db.Column(db.String(255), nullable=True)
    calendar_synced = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='scheduled_tasks')
    task_template = db.relationship('TaskTemplate', backref='scheduled_tasks')
    assigned_site = db.relationship('HiveSite', backref='scheduled_tasks')
    assigned_hive = db.relationship('IndividualHive', backref='scheduled_tasks')
    
    def __repr__(self):
        return f'<ScheduledTask {self.title} - {self.scheduled_date}>'
    
    def is_overdue(self):
        """Check if task is overdue"""
        if self.status in ['completed', 'cancelled']:
            return False
        return self.due_date and datetime.utcnow() > self.due_date
    
    def get_next_recurrence(self):
        """Calculate next occurrence for recurring tasks"""
        if not self.is_recurring:
            return None
        
        current = self.scheduled_date
        now = datetime.utcnow()
        
        while current <= now:
            if self.recurrence_pattern == 'daily':
                current += timedelta(days=self.recurrence_interval)
            elif self.recurrence_pattern == 'weekly':
                current += timedelta(weeks=self.recurrence_interval)
            elif self.recurrence_pattern == 'monthly':
                # Simple monthly calculation
                month = current.month + self.recurrence_interval
                year = current.year
                while month > 12:
                    month -= 12
                    year += 1
                current = current.replace(year=year, month=month)
            elif self.recurrence_pattern == 'yearly':
                current = current.replace(year=current.year + self.recurrence_interval)
        
        return current


class TaskTemplate(db.Model):
    """Predefined task templates for scheduling"""
    __tablename__ = 'task_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)  # Disease Management, Inspection, Feeding, etc.
    
    # Template details
    estimated_duration = db.Column(db.Integer, default=60)  # minutes
    priority = db.Column(db.String(10), default='medium')
    is_seasonal = db.Column(db.Boolean, default=False)
    season_months = db.Column(db.String(50))  # JSON array of months [3,4,5] for spring
    
    # Checklist items
    checklist_items = db.Column(db.Text)  # JSON array of checklist items
    
    # Equipment and supplies needed
    equipment_needed = db.Column(db.Text)  # JSON array of equipment
    supplies_needed = db.Column(db.Text)   # JSON array of supplies
    
    # Weather requirements
    weather_dependent = db.Column(db.Boolean, default=False)
    min_temperature = db.Column(db.Integer, nullable=True)
    max_temperature = db.Column(db.Integer, nullable=True)
    avoid_rain = db.Column(db.Boolean, default=False)
    
    # Timing constraints
    best_time_of_day = db.Column(db.String(20))  # morning, afternoon, evening, any
    avoid_times = db.Column(db.String(100))  # JSON array of times to avoid
    
    # Relationships and dependencies
    depends_on_tasks = db.Column(db.Text)  # JSON array of task template IDs
    follow_up_tasks = db.Column(db.Text)   # JSON array of task template IDs
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_system_template = db.Column(db.Boolean, default=False)  # System vs user-created
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref='task_templates')
    
    def __repr__(self):
        return f'<TaskTemplate {self.name}>'
    
    def get_checklist_items(self):
        """Get checklist items as list"""
        if self.checklist_items:
            return json.loads(self.checklist_items)
        return []
    
    def set_checklist_items(self, items):
        """Set checklist items from list"""
        self.checklist_items = json.dumps(items)
    
    def get_equipment_needed(self):
        """Get equipment needed as list"""
        if self.equipment_needed:
            return json.loads(self.equipment_needed)
        return []
    
    def set_equipment_needed(self, equipment):
        """Set equipment needed from list"""
        self.equipment_needed = json.dumps(equipment)
    
    def get_supplies_needed(self):
        """Get supplies needed as list"""
        if self.supplies_needed:
            return json.loads(self.supplies_needed)
        return []
    
    def set_supplies_needed(self, supplies):
        """Set supplies needed from list"""
        self.supplies_needed = json.dumps(supplies)


class TaskAssignment(db.Model):
    """Assignments of scheduled tasks to specific sites or hives"""
    __tablename__ = 'task_assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    scheduled_task_id = db.Column(db.Integer, db.ForeignKey('scheduled_tasks.id'), nullable=False)
    
    # Assignment target
    target_type = db.Column(db.String(20), nullable=False)  # site, individual_hive
    target_id = db.Column(db.Integer, nullable=False)  # ID of site or individual hive
    
    # Assignment details
    notes = db.Column(db.Text)
    estimated_duration = db.Column(db.Integer, default=60)  # Override template duration
    
    # Status
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, skipped
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    scheduled_task = db.relationship('ScheduledTask', backref='assignments')
    
    def __repr__(self):
        return f'<TaskAssignment {self.scheduled_task.title} - {self.target_type}:{self.target_id}>'


def init_default_task_templates(db_instance):
    """Initialize default task templates"""
    default_templates = [
        {
            'name': 'Disease Management',
            'category': 'Disease Management',
            'description': 'Comprehensive disease monitoring and treatment',
            'estimated_duration': 90,
            'priority': 'high',
            'is_seasonal': True,
            'season_months': '[3,4,5,9,10,11]',
            'weather_dependent': True,
            'min_temperature': 10,
            'avoid_rain': True,
            'best_time_of_day': 'morning',
            'checklist_items': '["Check for AFB symptoms", "Test for Varroa mites", "Inspect for Chalkbrood", "Check for Nosema", "Apply treatments if needed", "Record findings"]',
            'equipment_needed': '["Hive tool", "Smoker", "Alcohol wash kit", "Microscope", "Treatment supplies"]',
            'supplies_needed': '["Varroa treatment", "Oxytetracycline", "Formic acid"]'
        },
        {
            'name': 'General Inspection',
            'category': 'Inspection',
            'description': 'Regular comprehensive hive inspection',
            'estimated_duration': 45,
            'priority': 'medium',
            'is_seasonal': True,
            'season_months': '[3,4,5,6,7,8,9]',
            'weather_dependent': True,
            'min_temperature': 15,
            'avoid_rain': True,
            'best_time_of_day': 'morning',
            'checklist_items': '["Check queen presence", "Inspect brood pattern", "Check food stores", "Look for pests", "Assess hive strength", "Check for swarm cells"]',
            'equipment_needed': '["Hive tool", "Smoker", "Bee brush", "Frame grip"]',
            'supplies_needed': '[]'
        },
        {
            'name': 'Feeding Round',
            'category': 'Feeding',
            'description': 'Distribute supplemental feed to colonies',
            'estimated_duration': 30,
            'priority': 'medium',
            'is_seasonal': True,
            'season_months': '[2,3,9,10,11]',
            'weather_dependent': False,
            'best_time_of_day': 'evening',
            'checklist_items': '["Check existing feed levels", "Prepare sugar syrup", "Add pollen patties", "Check feeding stations", "Record amounts given"]',
            'equipment_needed': '["Feeding containers", "Measuring cups", "Syrup bucket"]',
            'supplies_needed': '["Sugar", "Pollen substitute", "Honey"]'
        },
        {
            'name': 'Harvest Honey',
            'category': 'Harvest',
            'description': 'Harvest honey from supers',
            'estimated_duration': 120,
            'priority': 'medium',
            'is_seasonal': True,
            'season_months': '[7,8,9]',
            'weather_dependent': True,
            'min_temperature': 20,
            'avoid_rain': True,
            'best_time_of_day': 'morning',
            'checklist_items': '["Check honey moisture content", "Remove supers", "Uncap frames", "Extract honey", "Filter honey", "Store properly"]',
            'equipment_needed': '["Honey extractor", "Uncapping knife", "Honey filter", "Storage containers"]',
            'supplies_needed': '["Honey containers", "Labels"]'
        },
        {
            'name': 'Spring Build Up',
            'category': 'Seasonal',
            'description': 'Early season colony stimulation',
            'estimated_duration': 60,
            'priority': 'high',
            'is_seasonal': True,
            'season_months': '[3,4,5]',
            'weather_dependent': True,
            'min_temperature': 12,
            'avoid_rain': True,
            'best_time_of_day': 'morning',
            'checklist_items': '["Check overwintering success", "Equalize colonies", "Add space", "Stimulate with feed", "Check for queen issues"]',
            'equipment_needed': '["Hive tool", "Smoker", "Extra boxes"]',
            'supplies_needed': '["Sugar syrup", "Pollen patties"]'
        },
        {
            'name': 'Treatment Round',
            'category': 'Treatment',
            'description': 'Apply pest control treatments',
            'estimated_duration': 75,
            'priority': 'high',
            'is_seasonal': True,
            'season_months': '[9,10,11,3,4]',
            'weather_dependent': True,
            'min_temperature': 10,
            'avoid_rain': True,
            'best_time_of_day': 'morning',
            'checklist_items': '["Test varroa levels", "Apply formic acid", "Check treatment effectiveness", "Record treatment dates", "Monitor for resistance"]',
            'equipment_needed': '["Treatment supplies", "Measuring tools", "Protective gear"]',
            'supplies_needed': '["Formic acid", "Oxalic acid", "Thymol"]'
        }
    ]
    
    for template_data in default_templates:
        existing = TaskTemplate.query.filter_by(name=template_data['name']).first()
        if not existing:
            template = TaskTemplate(**template_data)
            template.is_system_template = True
            db_instance.session.add(template)
    
    db_instance.session.commit()


def init_default_tasks(db_instance):
    """Initialize default task types"""
    default_tasks = [
        # Inspection tasks
        {'name': 'General Inspection', 'category': 'inspection', 'description': 'Regular hive inspection', 'order': 1},
        {'name': 'Queen Check', 'category': 'inspection', 'description': 'Check for queen presence and eggs', 'order': 2},
        {'name': 'Brood Pattern Check', 'category': 'inspection', 'description': 'Inspect brood pattern health', 'order': 3},
        {'name': 'Pest Inspection', 'category': 'inspection', 'description': 'Check for pests and diseases', 'order': 4},
        
        # Feeding tasks
        {'name': 'Sugar Syrup Feeding', 'category': 'feeding', 'description': 'Fed sugar syrup to colony', 'order': 10},
        {'name': 'Pollen Patty', 'category': 'feeding', 'description': 'Provided pollen substitute', 'order': 11},
        {'name': 'Fondant Feeding', 'category': 'feeding', 'description': 'Emergency winter feeding', 'order': 12},
        
        # Treatment tasks
        {'name': 'Varroa Treatment', 'category': 'treatment', 'description': 'Applied varroa mite treatment', 'order': 20},
        {'name': 'Nosema Treatment', 'category': 'treatment', 'description': 'Applied nosema treatment', 'order': 21},
        {'name': 'Small Hive Beetle Treatment', 'category': 'treatment', 'description': 'SHB management', 'order': 22},
        
        # Harvest tasks
        {'name': 'Honey Harvest', 'category': 'harvest', 'description': 'Harvested honey frames', 'order': 30},
        {'name': 'Wax Harvest', 'category': 'harvest', 'description': 'Collected beeswax', 'order': 31},
        {'name': 'Propolis Harvest', 'category': 'harvest', 'description': 'Collected propolis', 'order': 32},
        
        # Maintenance tasks
        {'name': 'Add Super', 'category': 'maintenance', 'description': 'Added honey super', 'order': 40},
        {'name': 'Remove Super', 'category': 'maintenance', 'description': 'Removed honey super', 'order': 41},
        {'name': 'Replace Frames', 'category': 'maintenance', 'description': 'Replaced old frames', 'order': 42},
        {'name': 'Hive Repair', 'category': 'maintenance', 'description': 'Repaired hive equipment', 'order': 43},
        {'name': 'Entrance Reducer', 'category': 'maintenance', 'description': 'Adjusted entrance reducer', 'order': 44},
        {'name': 'Queen Excluder', 'category': 'maintenance', 'description': 'Installed/removed queen excluder', 'order': 45},
        
        # Special events
        {'name': 'Swarm Collection', 'category': 'event', 'description': 'Collected a swarm', 'order': 50},
        {'name': 'Split Colony', 'category': 'event', 'description': 'Split colony for expansion', 'order': 51},
        {'name': 'Combine Colonies', 'category': 'event', 'description': 'Combined weak colonies', 'order': 52},
        {'name': 'Requeen', 'category': 'event', 'description': 'Introduced new queen', 'order': 53},
    ]
    
    for task_data in default_tasks:
        existing = TaskType.query.filter_by(name=task_data['name']).first()
        if not existing:
            task = TaskType(**task_data)
            db_instance.session.add(task)
    
    db_instance.session.commit()

