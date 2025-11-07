import os
from datetime import datetime, timedelta
import csv
import io
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, make_response
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from config import config
from models import db, User, HiveSite, IndividualHive, TaskType, HiveAction, DiseaseReport, ScheduledTask, TaskTemplate, TaskAssignment, init_default_tasks, init_default_task_templates
from forms import LoginForm, RegistrationForm, HiveSiteForm, IndividualHiveForm, HiveActionForm, DiseaseReportForm, FieldReportForm, ScheduledTaskForm, TaskTemplateForm, QuickScheduleForm, TaskAssignmentForm, UserManagementForm, UserEditForm, UserCreateForm

def calculate_time_series_data(sites, start_date, end_date, group_by):
    """Calculate time series data for analytics dashboard"""
    data = {
        'hive_strength': [],
        'supers_added': [],
        'hive_deaths': [],
        'disease_observations': []
    }
    
    # Generate time periods based on group_by
    if group_by == 'months':
        current = start_date.replace(day=1)
        while current <= end_date:
            next_month = current.replace(month=current.month + 1) if current.month < 12 else current.replace(year=current.year + 1, month=1)
            
            # Calculate metrics for this month
            total_strong = sum(c.strong_hives or 0 for c in sites)
            total_medium = sum(c.medium_hives or 0 for c in sites)
            total_weak = sum(c.weak_hives or 0 for c in sites)
            hive_strength = total_strong + (total_medium * 0.5) + (total_weak * 0.25)
            
            # Count supers added (approximated from actions)
            supers_added = HiveAction.query.filter(
                HiveAction.site_id.in_([c.id for c in sites]),
                HiveAction.task_name.like('%super%'),
                HiveAction.action_date >= current,
                HiveAction.action_date < next_month
            ).count()
            
            # Count hive deaths
            hive_deaths = sum(c.dead_hives or 0 for c in sites)
            
            # Count disease observations
            disease_obs = DiseaseReport.query.filter(
                DiseaseReport.site_id.in_([c.id for c in sites]),
                DiseaseReport.report_date >= current,
                DiseaseReport.report_date < next_month
            ).count()
            
            data['hive_strength'].append({'period': current.strftime('%Y-%m'), 'value': hive_strength})
            data['supers_added'].append({'period': current.strftime('%Y-%m'), 'value': supers_added})
            data['hive_deaths'].append({'period': current.strftime('%Y-%m'), 'value': hive_deaths})
            data['disease_observations'].append({'period': current.strftime('%Y-%m'), 'value': disease_obs})
            
            current = next_month
    
    return data

def calculate_categorical_breakdowns(sites, start_date, end_date):
    """Calculate categorical breakdowns for analytics dashboard"""
    site_ids = [c.id for c in sites]
    
    # Death reasons (from actions with death-related tasks)
    death_reasons = defaultdict(int)
    death_actions = HiveAction.query.filter(
        HiveAction.site_id.in_(site_ids),
        HiveAction.action_date >= start_date,
        HiveAction.action_date <= end_date,
        HiveAction.task_name.like('%death%')
    ).all()
    
    for action in death_actions:
        death_reasons[action.task_name] += 1
    
    # Disease observations
    diseases = defaultdict(int)
    disease_reports = DiseaseReport.query.filter(
        DiseaseReport.site_id.in_(site_ids),
        DiseaseReport.report_date >= start_date,
        DiseaseReport.report_date <= end_date
    ).all()
    
    for report in disease_reports:
        if report.afb_count > 0:
            diseases['AFB'] += report.afb_count
        if report.varroa_count > 0:
            diseases['Varroa'] += report.varroa_count
        if report.chalkbrood_count > 0:
            diseases['Chalkbrood'] += report.chalkbrood_count
        if report.sacbrood_count > 0:
            diseases['Sacbrood'] += report.sacbrood_count
        if report.dwv_count > 0:
            diseases['DWV'] += report.dwv_count
    
    # Requeening reasons
    requeening_reasons = defaultdict(int)
    requeen_actions = HiveAction.query.filter(
        HiveAction.site_id.in_(site_ids),
        HiveAction.action_date >= start_date,
        HiveAction.action_date <= end_date,
        HiveAction.task_name.like('%queen%')
    ).all()
    
    for action in requeen_actions:
        requeening_reasons[action.task_name] += 1
    
    # Consumables used
    consumables = defaultdict(int)
    consumable_actions = HiveAction.query.filter(
        HiveAction.site_id.in_(site_ids),
        HiveAction.action_date >= start_date,
        HiveAction.action_date <= end_date,
        HiveAction.task_name.in_(['Varroa Treatment', 'Sugar Syrup Feeding', 'Pollen Patty'])
    ).all()
    
    for action in consumable_actions:
        consumables[action.task_name] += 1
    
    return {
        'death_reasons': dict(death_reasons),
        'diseases': dict(diseases),
        'requeening_reasons': dict(requeening_reasons),
        'consumables': dict(consumables)
    }

def calculate_key_metrics(sites, start_date, end_date):
    """Calculate key performance metrics"""
    site_ids = [c.id for c in sites]
    
    # Total hive counts
    total_hives = sum(c.hive_count for c in sites)
    total_strong = sum(c.strong_hives or 0 for c in sites)
    total_medium = sum(c.medium_hives or 0 for c in sites)
    total_weak = sum(c.weak_hives or 0 for c in sites)
    total_dead = sum(c.dead_hives or 0 for c in sites)
    
    # Actions in period
    total_actions = HiveAction.query.filter(
        HiveAction.site_id.in_(site_ids),
        HiveAction.action_date >= start_date,
        HiveAction.action_date <= end_date
    ).count()
    
    # Disease reports
    total_disease_reports = DiseaseReport.query.filter(
        DiseaseReport.site_id.in_(site_ids),
        DiseaseReport.report_date >= start_date,
        DiseaseReport.report_date <= end_date
    ).count()
    
    # Quarantine sites
    quarantine_sites = sum(1 for c in sites if c.is_quarantine)
    
    return {
        'total_hives': total_hives,
        'total_strong': total_strong,
        'total_medium': total_medium,
        'total_weak': total_weak,
        'total_dead': total_dead,
        'total_actions': total_actions,
        'total_disease_reports': total_disease_reports,
        'quarantine_sites': quarantine_sites,
        'health_score': (total_strong + total_medium * 0.5) / max(total_hives, 1) * 100
    }

def create_app(config_name='default'):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    login_manager.login_message = 'Please log in to access this page.'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Create database tables
    with app.app_context():
        db.create_all()
        init_default_tasks(db)
        
        # Initialize default task templates
        init_default_task_templates(db)
        
        # Debug: Create a test user if none exists
        if app.config['DEBUG'] and User.query.count() == 0:
            test_user = User(username='admin', email='admin@homecare.com')
            test_user.set_password('admin123')
            db.session.add(test_user)
            db.session.commit()
            print("DEBUG: Created test user - username: admin, password: admin123")
    
    # Routes
    @app.route('/')
    def index():
        """Landing page"""
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        return render_template('landing.html')
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        """User login"""
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        
        form = LoginForm()
        if form.validate_on_submit():
            user = User.query.filter_by(username=form.username.data).first()
            if user and user.check_password(form.password.data):
                login_user(user, remember=form.remember_me.data)
                next_page = request.args.get('next')
                flash(f'Welcome back, {user.username}!', 'success')
                return redirect(next_page) if next_page else redirect(url_for('dashboard'))
            else:
                flash('Invalid username or password', 'danger')
        
        return render_template('login.html', form=form)
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        """User registration"""
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        
        form = RegistrationForm()
        if form.validate_on_submit():
            user = User(username=form.username.data, email=form.email.data)
            user.set_password(form.password.data)
            db.session.add(user)
            db.session.commit()
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
        
        return render_template('register.html', form=form)
    
    @app.route('/logout')
    @login_required
    def logout():
        """User logout"""
        logout_user()
        flash('You have been logged out.', 'info')
        return redirect(url_for('login'))
    
    @app.route('/dashboard')
    @login_required
    def dashboard():
        """Main dashboard"""
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        recent_actions = HiveAction.query.filter_by(user_id=current_user.id, is_archived=False)\
            .order_by(HiveAction.action_date.desc()).limit(10).all()
        
        stats = {
            'total_sites': len(sites),
            'total_hives': sum(c.hive_count for c in sites),
            'recent_actions_count': len(recent_actions)
        }
        
        return render_template('dashboard.html', 
                             sites=sites, 
                             recent_actions=recent_actions,
                             stats=stats,
                             google_maps_key=app.config['GOOGLE_MAPS_API_KEY'])
    
    @app.route('/sites')
    @login_required
    def sites():
        """View all hive sites"""
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True)\
            .order_by(HiveSite.created_at.desc()).all()
        return render_template('sites.html', 
                             sites=sites,
                             google_maps_key=app.config['GOOGLE_MAPS_API_KEY'])
    
    @app.route('/site/add', methods=['GET', 'POST'])
    @login_required
    def add_site():
        """Add new hive site"""
        form = HiveSiteForm()
        if form.validate_on_submit():
            site = HiveSite(
                user_id=current_user.id,
                name=form.name.data,
                description=form.description.data,
                latitude=form.latitude.data,
                longitude=form.longitude.data,
                hive_count=form.hive_count.data,
                harvest_timeline=form.harvest_timeline.data,
                sugar_requirements=form.sugar_requirements.data,
                notes=form.notes.data,
                # Landowner information
                landowner_name=form.landowner_name.data,
                landowner_phone=form.landowner_phone.data,
                landowner_email=form.landowner_email.data,
                landowner_address=form.landowner_address.data,
                # Site classification
                functional_classification=form.functional_classification.data,
                seasonal_classification=form.seasonal_classification.data,
                access_type=form.access_type.data,
                contact_before_visit=form.contact_before_visit.data,
                is_quarantine=form.is_quarantine.data,
                # Hive setup details
                single_brood_boxes=form.single_brood_boxes.data,
                double_brood_boxes=form.double_brood_boxes.data,
                nucs=form.nucs.data,
                dead_hives=form.dead_hives.data,
                top_splits=form.top_splits.data,
                # Hive strength ratings
                strong_hives=form.strong_hives.data,
                medium_hives=form.medium_hives.data,
                weak_hives=form.weak_hives.data,
                site_strength=form.site_strength.data
            )
            db.session.add(site)
            db.session.commit()
            flash(f'Hive site "{site.name}" added successfully!', 'success')
            return redirect(url_for('sites'))
        
        return render_template('site_form.html', form=form, title='Add Hive Site')
    
    @app.route('/site/<int:site_id>/edit', methods=['GET', 'POST'])
    @login_required
    def edit_site(site_id):
        """Edit hive site"""
        site = HiveSite.query.filter_by(id=site_id, user_id=current_user.id).first_or_404()
        form = HiveSiteForm(obj=site)
        
        if form.validate_on_submit():
            site.name = form.name.data
            site.description = form.description.data
            site.latitude = form.latitude.data
            site.longitude = form.longitude.data
            site.hive_count = form.hive_count.data
            site.harvest_timeline = form.harvest_timeline.data
            site.sugar_requirements = form.sugar_requirements.data
            site.notes = form.notes.data
            # Landowner information
            site.landowner_name = form.landowner_name.data
            site.landowner_phone = form.landowner_phone.data
            site.landowner_email = form.landowner_email.data
            site.landowner_address = form.landowner_address.data
            # Site classification
            site.functional_classification = form.functional_classification.data
            site.seasonal_classification = form.seasonal_classification.data
            site.access_type = form.access_type.data
            site.contact_before_visit = form.contact_before_visit.data
            site.is_quarantine = form.is_quarantine.data
            # Hive setup details
            site.single_brood_boxes = form.single_brood_boxes.data
            site.double_brood_boxes = form.double_brood_boxes.data
            site.nucs = form.nucs.data
            site.dead_hives = form.dead_hives.data
            site.top_splits = form.top_splits.data
            # Hive strength ratings
            site.strong_hives = form.strong_hives.data
            site.medium_hives = form.medium_hives.data
            site.weak_hives = form.weak_hives.data
            site.site_strength = form.site_strength.data
            site.updated_at = datetime.utcnow()
            db.session.commit()
            flash(f'Hive site "{site.name}" updated successfully!', 'success')
            return redirect(url_for('site_detail', site_id=site.id))
        
        return render_template('site_form.html', form=form, title='Edit Hive Site', site=site)
    
    @app.route('/site/<int:site_id>')
    @login_required
    def site_detail(site_id):
        """View site details"""
        site = HiveSite.query.filter_by(id=site_id, user_id=current_user.id).first_or_404()
        individual_hives = IndividualHive.query.filter_by(site_id=site_id, is_active=True).all()
        actions = HiveAction.query.filter_by(site_id=site_id, is_archived=False)\
            .order_by(HiveAction.action_date.desc()).all()
        disease_reports = DiseaseReport.query.filter_by(site_id=site_id)\
            .order_by(DiseaseReport.report_date.desc()).limit(5).all()
        
        return render_template('site_detail.html', 
                             site=site, 
                             individual_hives=individual_hives,
                             actions=actions,
                             disease_reports=disease_reports,
                             google_maps_key=app.config['GOOGLE_MAPS_API_KEY'])
    
    @app.route('/site/<int:site_id>/delete', methods=['POST'])
    @login_required
    def delete_site(site_id):
        """Delete (deactivate) hive site"""
        site = HiveSite.query.filter_by(id=site_id, user_id=current_user.id).first_or_404()
        site.is_active = False
        db.session.commit()
        flash(f'Hive site "{site.name}" has been deleted.', 'info')
        return redirect(url_for('sites'))
    
    @app.route('/site/<int:site_id>/hive/add', methods=['GET', 'POST'])
    @login_required
    def add_individual_hive(site_id):
        """Add individual hive to site"""
        site = HiveSite.query.filter_by(id=site_id, user_id=current_user.id).first_or_404()
        form = IndividualHiveForm()
        
        if form.validate_on_submit():
            hive = IndividualHive(
                site_id=site_id,
                hive_number=form.hive_number.data,
                status=form.status.data,
                hive_strength=form.hive_strength.data,
                notes=form.notes.data
            )
            db.session.add(hive)
            db.session.commit()
            flash(f'Individual hive "{hive.hive_number}" added to site "{site.name}"', 'success')
            return redirect(url_for('site_detail', site_id=site_id))
        
        return render_template('hive_form.html', form=form, site=site, title='Add Individual Hive')
    
    @app.route('/hive/<int:hive_id>/edit', methods=['GET', 'POST'])
    @login_required
    def edit_individual_hive(hive_id):
        """Edit individual hive"""
        hive = IndividualHive.query.get_or_404(hive_id)
        site = HiveSite.query.filter_by(id=hive.site_id, user_id=current_user.id).first_or_404()
        form = IndividualHiveForm(obj=hive)
        
        if form.validate_on_submit():
            hive.hive_number = form.hive_number.data
            hive.status = form.status.data
            hive.hive_strength = form.hive_strength.data
            hive.notes = form.notes.data
            hive.updated_at = datetime.utcnow()
            db.session.commit()
            flash(f'Individual hive "{hive.hive_number}" updated successfully!', 'success')
            return redirect(url_for('site_detail', site_id=site.id))
        
        return render_template('hive_form.html', form=form, site=site, hive=hive, title='Edit Individual Hive')
    
    @app.route('/actions')
    @login_required
    def actions():
        """View all actions"""
        page = request.args.get('page', 1, type=int)
        show_archived = request.args.get('archived', 'false') == 'true'
        
        query = HiveAction.query.filter_by(user_id=current_user.id)
        if not show_archived:
            query = query.filter_by(is_archived=False)
        
        actions = query.order_by(HiveAction.action_date.desc())\
            .paginate(page=page, per_page=app.config['ACTIONS_PER_PAGE'], error_out=False)
        
        return render_template('actions.html', actions=actions, show_archived=show_archived)
    
    @app.route('/action/log', methods=['GET', 'POST'])
    @login_required
    def log_action():
        """Log new hive action"""
        form = HiveActionForm()
        
        # Get pre-filled parameters from URL
        site_id = request.args.get('site_id', type=int)
        hive_id = request.args.get('hive_id', type=int)
        
        # Populate site choices
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        form.site_id.choices = [(c.id, c.name) for c in sites]
        
        # Pre-fill site if specified
        if site_id:
            form.site_id.data = site_id
            
            # Populate individual hive choices for the selected site
            individual_hives = IndividualHive.query.filter_by(site_id=site_id, is_active=True).all()
            form.individual_hive_id.choices = [(0, '-- All Hives --')] + [(h.id, h.hive_number) for h in individual_hives]
            
            # Pre-fill individual hive if specified
            if hive_id:
                form.individual_hive_id.data = hive_id
        else:
            # Populate individual hive choices (empty initially)
            form.individual_hive_id.choices = [(0, '-- Select Site First --')]
        
        # Populate task type choices
        task_types = TaskType.query.filter_by(is_active=True).order_by(TaskType.order).all()
        form.task_type_id.choices = [(0, '-- Custom Task --')] + [(t.id, f"{t.category.title()}: {t.name}") for t in task_types]
        
        if form.validate_on_submit():
            # Get task name
            if form.task_type_id.data and form.task_type_id.data > 0:
                task_type = TaskType.query.get(form.task_type_id.data)
                task_name = task_type.name
                task_type_id = task_type.id
            else:
                task_name = form.custom_task_name.data
                task_type_id = None
            
            # Get individual hive if specified
            individual_hive_id = form.individual_hive_id.data if form.individual_hive_id.data else None
            
            action = HiveAction(
                site_id=form.site_id.data,
                individual_hive_id=individual_hive_id,
                user_id=current_user.id,
                task_type_id=task_type_id,
                task_name=task_name,
                description=form.description.data,
                action_date=form.action_date.data if form.action_date.data else datetime.utcnow()
            )
            db.session.add(action)
            db.session.commit()
            flash(f'Action "{task_name}" logged successfully!', 'success')
            return redirect(url_for('actions'))
        
        return render_template('action_form.html', form=form, task_types=task_types)
    
    @app.route('/action/log-quick', methods=['POST'])
    @login_required
    def log_quick_action():
        """Quick action logging via AJAX"""
        data = request.get_json()
        
        task_ids = data.get('task_ids', [])
        site_id = data.get('site_id')
        individual_hive_id = data.get('individual_hive_id')
        action_date = datetime.fromisoformat(data.get('action_date')) if data.get('action_date') else datetime.utcnow()
        
        if not task_ids or not site_id:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Verify site belongs to user
        site = HiveSite.query.filter_by(id=site_id, user_id=current_user.id).first()
        if not site:
            return jsonify({'success': False, 'message': 'Invalid site'}), 404
        
        actions_logged = []
        for task_id in task_ids:
            task = TaskType.query.get(task_id)
            if task:
                action = HiveAction(
                    site_id=site_id,
                    individual_hive_id=individual_hive_id,
                    user_id=current_user.id,
                    task_type_id=task.id,
                    task_name=task.name,
                    action_date=action_date
                )
                db.session.add(action)
                actions_logged.append(task.name)
        
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': f'{len(actions_logged)} action(s) logged successfully',
            'actions': actions_logged
        })
    
    @app.route('/action/<int:action_id>/archive', methods=['POST'])
    @login_required
    def archive_action(action_id):
        """Archive an action"""
        action = HiveAction.query.filter_by(id=action_id, user_id=current_user.id).first_or_404()
        action.is_archived = True
        db.session.commit()
        return jsonify({'success': True, 'message': 'Action archived'})
    
    @app.route('/action/<int:action_id>/unarchive', methods=['POST'])
    @login_required
    def unarchive_action(action_id):
        """Unarchive an action"""
        action = HiveAction.query.filter_by(id=action_id, user_id=current_user.id).first_or_404()
        action.is_archived = False
        db.session.commit()
        return jsonify({'success': True, 'message': 'Action unarchived'})
    
    @app.route('/api/sites')
    @login_required
    def api_sites():
        """API endpoint for site data (for maps)"""
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        return jsonify([{
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'latitude': c.latitude,
            'longitude': c.longitude,
            'hive_count': c.hive_count,
            'harvest_timeline': c.harvest_timeline,
            'sugar_requirements': c.sugar_requirements
        } for c in sites])
    
    @app.route('/api/site/<int:site_id>/hives')
    @login_required
    def api_site_hives(site_id):
        """API endpoint for individual hives in a site"""
        site = HiveSite.query.filter_by(id=site_id, user_id=current_user.id).first_or_404()
        hives = IndividualHive.query.filter_by(site_id=site_id, is_active=True).all()
        
        return jsonify([{
            'id': h.id,
            'hive_number': h.hive_number,
            'status': h.status,
            'notes': h.notes
        } for h in hives])
    
    @app.route('/disease-report', methods=['GET', 'POST'])
    @login_required
    def disease_report():
        """Disease reporting form"""
        form = DiseaseReportForm()
        
        # Populate site choices
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        form.site_id.choices = [(c.id, c.name) for c in sites]
        
        if form.validate_on_submit():
            report = DiseaseReport(
                site_id=form.site_id.data,
                user_id=current_user.id,
                afb_count=form.afb_count.data,
                varroa_count=form.varroa_count.data,
                chalkbrood_count=form.chalkbrood_count.data,
                sacbrood_count=form.sacbrood_count.data,
                dwv_count=form.dwv_count.data,
                notes=form.notes.data,
                report_date=form.report_date.data if form.report_date.data else datetime.utcnow()
            )
            db.session.add(report)
            db.session.commit()
            flash('Disease report submitted successfully!', 'success')
            return redirect(url_for('site_detail', site_id=form.site_id.data))
        
        return render_template('disease_report.html', form=form)
    
    @app.route('/field-report', methods=['GET', 'POST'])
    @login_required
    def field_report():
        """Quick field reporting interface"""
        form = FieldReportForm()
        
        # Populate site choices
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        form.site_id.choices = [(c.id, c.name) for c in sites]
        
        if form.validate_on_submit():
            # Log actions based on checkboxes
            site_id = form.site_id.data
            site = HiveSite.query.get(site_id)
            
            actions_logged = []
            if form.inspection.data:
                action = HiveAction(
                    site_id=site_id,
                    user_id=current_user.id,
                    task_name='Field Inspection',
                    description='Quick field inspection',
                    action_date=datetime.utcnow()
                )
                db.session.add(action)
                actions_logged.append('Inspection')
            
            if form.feeding.data:
                action = HiveAction(
                    site_id=site_id,
                    user_id=current_user.id,
                    task_name='Field Feeding',
                    description='Quick feeding activity',
                    action_date=datetime.utcnow()
                )
                db.session.add(action)
                actions_logged.append('Feeding')
            
            if form.treatment.data:
                action = HiveAction(
                    site_id=site_id,
                    user_id=current_user.id,
                    task_name='Field Treatment',
                    description='Quick treatment application',
                    action_date=datetime.utcnow()
                )
                db.session.add(action)
                actions_logged.append('Treatment')
            
            if form.harvest.data:
                action = HiveAction(
                    site_id=site_id,
                    user_id=current_user.id,
                    task_name='Field Harvest',
                    description='Quick harvest activity',
                    action_date=datetime.utcnow()
                )
                db.session.add(action)
                actions_logged.append('Harvest')
            
            if form.maintenance.data:
                action = HiveAction(
                    site_id=site_id,
                    user_id=current_user.id,
                    task_name='Field Maintenance',
                    description='Quick maintenance activity',
                    action_date=datetime.utcnow()
                )
                db.session.add(action)
                actions_logged.append('Maintenance')
            
            # Update site hive counts and strength ratings
            site.strong_hives = form.strong_hives.data
            site.medium_hives = form.medium_hives.data
            site.weak_hives = form.weak_hives.data
            
            # Create disease report if any diseases reported
            if any([form.afb_count.data, form.varroa_count.data, form.chalkbrood_count.data, 
                   form.sacbrood_count.data, form.dwv_count.data]):
                disease_report = DiseaseReport(
                    site_id=site_id,
                    user_id=current_user.id,
                    afb_count=form.afb_count.data,
                    varroa_count=form.varroa_count.data,
                    chalkbrood_count=form.chalkbrood_count.data,
                    sacbrood_count=form.sacbrood_count.data,
                    dwv_count=form.dwv_count.data,
                    notes=form.notes.data,
                    report_date=datetime.utcnow()
                )
                db.session.add(disease_report)
            
            db.session.commit()
            
            flash(f'Field report submitted! Actions logged: {", ".join(actions_logged) if actions_logged else "None"}', 'success')
            return redirect(url_for('site_detail', site_id=site_id))
        
        return render_template('field_report.html', form=form)
    
    @app.route('/export/sites')
    @login_required
    def export_sites():
        """Export all sites with comprehensive data"""
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header with all new fields
        headers = [
            'Site ID', 'Name', 'Description', 'Latitude', 'Longitude', 'Hive Count',
            'Harvest Timeline', 'Sugar Requirements', 'Notes',
            # Landowner Information
            'Landowner Name', 'Landowner Phone', 'Landowner Email', 'Landowner Address',
            # Site Classification
            'Site Type', 'Access Type', 'Contact Before Visit', 'Is Quarantine',
            # Hive Setup Details
            'Single Brood Boxes', 'Double Brood Boxes', 'Nucs', 'Dead Hives', 'Top Splits',
            # Hive Strength Ratings
            'Strong Hives', 'Medium Hives', 'Weak Hives',
            # Timestamps
            'Created At', 'Updated At'
        ]
        writer.writerow(headers)
        
        # Write data
        for site in sites:
            writer.writerow([
                site.id,
                site.name,
                site.description or '',
                site.latitude,
                site.longitude,
                site.hive_count,
                site.harvest_timeline or '',
                site.sugar_requirements or '',
                site.notes or '',
                # Landowner Information
                site.landowner_name or '',
                site.landowner_phone or '',
                site.landowner_email or '',
                site.landowner_address or '',
                # Site Classification
                site.site_type or '',
                site.access_type or '',
                site.contact_before_visit,
                site.is_quarantine,
                # Hive Setup Details
                site.single_brood_boxes or 0,
                site.double_brood_boxes or 0,
                site.nucs or 0,
                site.dead_hives or 0,
                site.top_splits or 0,
                # Hive Strength Ratings
                site.strong_hives or 0,
                site.medium_hives or 0,
                site.weak_hives or 0,
                # Timestamps
                site.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                site.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=sites_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        return response
    
    @app.route('/export/actions')
    @login_required
    def export_actions():
        """Export all actions with comprehensive data"""
        actions = HiveAction.query.filter_by(user_id=current_user.id, is_archived=False)\
            .order_by(HiveAction.action_date.desc()).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        headers = [
            'Action ID', 'Site Name', 'Individual Hive', 'Task Name', 'Task Category',
            'Description', 'Action Date', 'Created At', 'Is Archived'
        ]
        writer.writerow(headers)
        
        # Write data
        for action in actions:
            writer.writerow([
                action.id,
                action.site.name,
                action.individual_hive.hive_number if action.individual_hive else '',
                action.task_name,
                action.task_type.category if action.task_type else '',
                action.description or '',
                action.action_date.strftime('%Y-%m-%d %H:%M:%S'),
                action.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                action.is_archived
            ])
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=actions_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        return response
    
    @app.route('/export/disease-reports')
    @login_required
    def export_disease_reports():
        """Export all disease reports"""
        disease_reports = DiseaseReport.query.join(HiveSite)\
            .filter(HiveSite.user_id == current_user.id)\
            .order_by(DiseaseReport.report_date.desc()).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        headers = [
            'Report ID', 'Site Name', 'Report Date', 'AFB Count', 'Varroa Count',
            'Chalkbrood Count', 'Sacbrood Count', 'DWV Count', 'Notes', 'Created At'
        ]
        writer.writerow(headers)
        
        # Write data
        for report in disease_reports:
            writer.writerow([
                report.id,
                report.site.name,
                report.report_date.strftime('%Y-%m-%d %H:%M:%S'),
                report.afb_count,
                report.varroa_count,
                report.chalkbrood_count,
                report.sacbrood_count,
                report.dwv_count,
                report.notes or '',
                report.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=disease_reports_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        return response
    
    @app.route('/export/individual-hives')
    @login_required
    def export_individual_hives():
        """Export all individual hives"""
        hives = IndividualHive.query.join(HiveSite)\
            .filter(HiveSite.user_id == current_user.id, IndividualHive.is_active == True)\
            .order_by(HiveSite.name, IndividualHive.hive_number).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        headers = [
            'Hive ID', 'Site Name', 'Hive Number', 'Status', 'Notes',
            'Created At', 'Updated At', 'Is Active'
        ]
        writer.writerow(headers)
        
        # Write data
        for hive in hives:
            writer.writerow([
                hive.id,
                hive.site.name,
                hive.hive_number,
                hive.status,
                hive.notes or '',
                hive.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                hive.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
                hive.is_active
            ])
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=individual_hives_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        return response
    
    @app.route('/export/comprehensive')
    @login_required
    def export_comprehensive():
        """Export comprehensive data including all new fields"""
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write comprehensive header
        headers = [
            # Site Basic Info
            'Site ID', 'Site Name', 'Description', 'Latitude', 'Longitude', 'Hive Count',
            'Harvest Timeline', 'Sugar Requirements', 'Site Notes',
            # Landowner Information
            'Landowner Name', 'Landowner Phone', 'Landowner Email', 'Landowner Address',
            # Site Classification
            'Site Type', 'Access Type', 'Contact Before Visit', 'Is Quarantine',
            # Hive Setup Details
            'Single Brood Boxes', 'Double Brood Boxes', 'Nucs', 'Dead Hives', 'Top Splits',
            # Hive Strength Ratings
            'Strong Hives', 'Medium Hives', 'Weak Hives',
            # Site Timestamps
            'Site Created At', 'Site Updated At',
            # Individual Hives Summary
            'Individual Hives Count', 'Healthy Hives', 'Infected Hives', 'Quarantine Hives', 'Weak Hives', 'Queenless Hives', 'Dead Hives',
            # Recent Actions Summary
            'Total Actions', 'Recent Actions (Last 30 days)', 'Last Action Date', 'Last Action Type',
            # Disease Reports Summary
            'Total Disease Reports', 'Latest Disease Report Date', 'AFB Total', 'Varroa Total', 'Chalkbrood Total', 'Sacbrood Total', 'DWV Total'
        ]
        writer.writerow(headers)
        
        # Write comprehensive data for each site
        for site in sites:
            # Get individual hives data
            individual_hives = IndividualHive.query.filter_by(site_id=site.id, is_active=True).all()
            hive_status_counts = {}
            for hive in individual_hives:
                hive_status_counts[hive.status] = hive_status_counts.get(hive.status, 0) + 1
            
            # Get actions data
            actions = HiveAction.query.filter_by(site_id=site.id, is_archived=False).all()
            recent_actions = HiveAction.query.filter_by(site_id=site.id, is_archived=False)\
                .filter(HiveAction.action_date >= datetime.utcnow().replace(day=1)).all()
            
            last_action = HiveAction.query.filter_by(site_id=site.id, is_archived=False)\
                .order_by(HiveAction.action_date.desc()).first()
            
            # Get disease reports data
            disease_reports = DiseaseReport.query.filter_by(site_id=site.id).all()
            latest_disease_report = DiseaseReport.query.filter_by(site_id=site.id)\
                .order_by(DiseaseReport.report_date.desc()).first()
            
            # Calculate disease totals
            afb_total = sum(report.afb_count for report in disease_reports)
            varroa_total = sum(report.varroa_count for report in disease_reports)
            chalkbrood_total = sum(report.chalkbrood_count for report in disease_reports)
            sacbrood_total = sum(report.sacbrood_count for report in disease_reports)
            dwv_total = sum(report.dwv_count for report in disease_reports)
            
            writer.writerow([
                # Site Basic Info
                site.id,
                site.name,
                site.description or '',
                site.latitude,
                site.longitude,
                site.hive_count,
                site.harvest_timeline or '',
                site.sugar_requirements or '',
                site.notes or '',
                # Landowner Information
                site.landowner_name or '',
                site.landowner_phone or '',
                site.landowner_email or '',
                site.landowner_address or '',
                # Site Classification
                site.site_type or '',
                site.access_type or '',
                site.contact_before_visit,
                site.is_quarantine,
                # Hive Setup Details
                site.single_brood_boxes or 0,
                site.double_brood_boxes or 0,
                site.nucs or 0,
                site.dead_hives or 0,
                site.top_splits or 0,
                # Hive Strength Ratings
                site.strong_hives or 0,
                site.medium_hives or 0,
                site.weak_hives or 0,
                # Site Timestamps
                site.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                site.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
                # Individual Hives Summary
                len(individual_hives),
                hive_status_counts.get('healthy', 0),
                hive_status_counts.get('infected', 0),
                hive_status_counts.get('quarantine', 0),
                hive_status_counts.get('weak', 0),
                hive_status_counts.get('queenless', 0),
                hive_status_counts.get('dead', 0),
                # Recent Actions Summary
                len(actions),
                len(recent_actions),
                last_action.action_date.strftime('%Y-%m-%d %H:%M:%S') if last_action else '',
                last_action.task_name if last_action else '',
                # Disease Reports Summary
                len(disease_reports),
                latest_disease_report.report_date.strftime('%Y-%m-%d %H:%M:%S') if latest_disease_report else '',
                afb_total,
                varroa_total,
                chalkbrood_total,
                sacbrood_total,
                dwv_total
            ])
        
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=comprehensive_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        return response
    
    @app.route('/export-management')
    @login_required
    def export_management():
        """Export management page"""
        # Get statistics for the export page
        sites_count = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).count()
        actions_count = HiveAction.query.filter_by(user_id=current_user.id, is_archived=False).count()
        disease_reports_count = DiseaseReport.query.join(HiveSite)\
            .filter(HiveSite.user_id == current_user.id).count()
        individual_hives_count = IndividualHive.query.join(HiveSite)\
            .filter(HiveSite.user_id == current_user.id, IndividualHive.is_active == True).count()
        
        stats = {
            'sites': sites_count,
            'actions': actions_count,
            'disease_reports': disease_reports_count,
            'individual_hives': individual_hives_count
        }
        
        return render_template('export_management.html', stats=stats)
    
    @app.route('/report-dashboard')
    @login_required
    def report_dashboard():
        """Advanced analytics dashboard for hive performance and health"""
        # Get date range parameters
        start_date = request.args.get('start_date', datetime.utcnow().replace(month=4, day=29).strftime('%Y-%m-%d'))
        end_date = request.args.get('end_date', datetime.utcnow().replace(month=10, day=29).strftime('%Y-%m-%d'))
        group_by = request.args.get('group_by', 'months')  # months or days
        
        # Parse dates
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        # Get all sites for the user
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        
        # Calculate time series data
        time_series_data = calculate_time_series_data(sites, start_dt, end_dt, group_by)
        
        # Calculate categorical breakdowns
        categorical_data = calculate_categorical_breakdowns(sites, start_dt, end_dt)
        
        # Calculate key metrics
        key_metrics = calculate_key_metrics(sites, start_dt, end_dt)
        
        return render_template('report_dashboard.html', 
                             time_series_data=time_series_data,
                             categorical_data=categorical_data,
                             key_metrics=key_metrics,
                             start_date=start_date,
                             end_date=end_date,
                             group_by=group_by,
                             sites=sites)
    
    @app.route('/api/report-data')
    @login_required
    def api_report_data():
        """API endpoint for report dashboard data"""
        start_date = request.args.get('start_date', datetime.utcnow().replace(month=4, day=29).strftime('%Y-%m-%d'))
        end_date = request.args.get('end_date', datetime.utcnow().replace(month=10, day=29).strftime('%Y-%m-%d'))
        group_by = request.args.get('group_by', 'months')
        
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        
        return jsonify({
            'time_series': calculate_time_series_data(sites, start_dt, end_dt, group_by),
            'categorical': calculate_categorical_breakdowns(sites, start_dt, end_dt),
            'key_metrics': calculate_key_metrics(sites, start_dt, end_dt)
        })
    
    @app.route('/scheduler')
    @login_required
    def scheduler():
        """Main scheduler page"""
        # Get upcoming tasks
        upcoming_tasks = ScheduledTask.query.filter_by(user_id=current_user.id)\
            .filter(ScheduledTask.status.in_(['pending', 'in_progress']))\
            .order_by(ScheduledTask.scheduled_date).limit(10).all()
        
        # Get overdue tasks
        overdue_tasks = ScheduledTask.query.filter_by(user_id=current_user.id)\
            .filter(ScheduledTask.status == 'pending')\
            .filter(ScheduledTask.due_date < datetime.utcnow()).all()
        
        # Get task templates
        task_templates = TaskTemplate.query.filter_by(is_active=True)\
            .order_by(TaskTemplate.category, TaskTemplate.name).all()
        
        # Get sites for assignment
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        
        return render_template('scheduler.html', 
                             upcoming_tasks=upcoming_tasks,
                             overdue_tasks=overdue_tasks,
                             task_templates=task_templates,
                             sites=sites)
    
    @app.route('/scheduler/templates')
    @login_required
    def task_templates():
        """Task templates management"""
        templates = TaskTemplate.query.filter_by(is_active=True)\
            .order_by(TaskTemplate.category, TaskTemplate.name).all()
        
        return render_template('task_templates.html', templates=templates)
    
    @app.route('/scheduler/templates/new', methods=['GET', 'POST'])
    @login_required
    def new_task_template():
        """Create new task template"""
        form = TaskTemplateForm()
        
        if form.validate_on_submit():
            template = TaskTemplate(
                name=form.name.data,
                description=form.description.data,
                category=form.category.data,
                estimated_duration=form.estimated_duration.data,
                priority=form.priority.data,
                is_seasonal=form.is_seasonal.data,
                season_months=form.season_months.data,
                weather_dependent=form.weather_dependent.data,
                min_temperature=form.min_temperature.data,
                max_temperature=form.max_temperature.data,
                avoid_rain=form.avoid_rain.data,
                best_time_of_day=form.best_time_of_day.data,
                user_id=current_user.id,
                is_system_template=False
            )
            
            # Process checklist items
            if form.checklist_items.data:
                items = [item.strip() for item in form.checklist_items.data.split('\n') if item.strip()]
                template.set_checklist_items(items)
            
            # Process equipment needed
            if form.equipment_needed.data:
                equipment = [item.strip() for item in form.equipment_needed.data.split('\n') if item.strip()]
                template.set_equipment_needed(equipment)
            
            # Process supplies needed
            if form.supplies_needed.data:
                supplies = [item.strip() for item in form.supplies_needed.data.split('\n') if item.strip()]
                template.set_supplies_needed(supplies)
            
            db.session.add(template)
            db.session.commit()
            
            flash('Task template created successfully!', 'success')
            return redirect(url_for('task_templates'))
        
        return render_template('task_template_form.html', form=form, title='New Task Template')
    
    @app.route('/scheduler/quick-schedule', methods=['GET', 'POST'])
    @login_required
    def quick_schedule():
        """Quick task scheduling interface"""
        form = QuickScheduleForm()
        
        # Populate form choices
        form.task_template_id.choices = [(t.id, f"{t.category} - {t.name}") 
                                        for t in TaskTemplate.query.filter_by(is_active=True)
                                        .order_by(TaskTemplate.category, TaskTemplate.name).all()]
        
        sites = HiveSite.query.filter_by(user_id=current_user.id, is_active=True).all()
        form.selected_sites.choices = [(c.id, c.name) for c in sites]
        
        individual_hives = IndividualHive.query.join(HiveSite)\
            .filter(HiveSite.user_id == current_user.id, IndividualHive.is_active == True).all()
        form.selected_hives.choices = [(h.id, f"{h.site.name} - {h.hive_number}") for h in individual_hives]
        
        if form.validate_on_submit():
            template = TaskTemplate.query.get(form.task_template_id.data)
            
            # Create scheduled task
            scheduled_task = ScheduledTask(
                user_id=current_user.id,
                task_template_id=form.task_template_id.data,
                title=template.name,
                description=template.description,
                scheduled_date=form.scheduled_date.data if form.scheduled_date.data else datetime.utcnow().date(),
                due_date=form.recurrence_end_date.data if form.schedule_type.data == 'recurring' else None,
                estimated_duration=template.estimated_duration,
                priority=form.priority.data,
                is_recurring=form.schedule_type.data == 'recurring',
                recurrence_pattern=form.recurrence_pattern.data if form.is_recurring else None,
                recurrence_interval=form.recurrence_interval.data if form.is_recurring else 1,
                recurrence_end_date=form.recurrence_end_date.data if form.is_recurring else None
            )
            
            db.session.add(scheduled_task)
            db.session.flush()  # Get the ID
            
            # Create assignments
            if form.assign_to_all_sites.data:
                for site in sites:
                    assignment = TaskAssignment(
                        scheduled_task_id=scheduled_task.id,
                        target_type='site',
                        target_id=site.id,
                        estimated_duration=template.estimated_duration
                    )
                    db.session.add(assignment)
            else:
                # Assign to selected sites
                for site_id in form.selected_sites.data:
                    assignment = TaskAssignment(
                        scheduled_task_id=scheduled_task.id,
                        target_type='site',
                        target_id=site_id,
                        estimated_duration=template.estimated_duration
                    )
                    db.session.add(assignment)
                
                # Assign to selected individual hives
                for hive_id in form.selected_hives.data:
                    assignment = TaskAssignment(
                        scheduled_task_id=scheduled_task.id,
                        target_type='individual_hive',
                        target_id=hive_id,
                        estimated_duration=template.estimated_duration
                    )
                    db.session.add(assignment)
            
            db.session.commit()
            flash(f'Task "{template.name}" scheduled successfully!', 'success')
            return redirect(url_for('scheduler'))
        
        return render_template('quick_schedule.html', form=form)
    
    @app.route('/scheduler/task/<int:task_id>')
    @login_required
    def scheduled_task_detail(task_id):
        """View scheduled task details"""
        task = ScheduledTask.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
        
        return render_template('scheduled_task_detail.html', task=task)
    
    @app.route('/scheduler/task/<int:task_id>/complete', methods=['POST'])
    @login_required
    def complete_scheduled_task(task_id):
        """Mark scheduled task as completed"""
        task = ScheduledTask.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
        
        task.status = 'completed'
        task.completed_at = datetime.utcnow()
        
        # Mark all assignments as completed
        for assignment in task.assignments:
            assignment.status = 'completed'
            assignment.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        flash(f'Task "{task.title}" marked as completed!', 'success')
        return redirect(url_for('scheduler'))
    
    @app.route('/scheduler/task/<int:task_id>/cancel', methods=['POST'])
    @login_required
    def cancel_scheduled_task(task_id):
        """Cancel scheduled task"""
        task = ScheduledTask.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
        
        task.status = 'cancelled'
        
        db.session.commit()
        
        flash(f'Task "{task.title}" cancelled!', 'info')
        return redirect(url_for('scheduler'))
    
    @app.route('/api/scheduler/tasks')
    @login_required
    def api_scheduled_tasks():
        """API endpoint for scheduled tasks"""
        start_date = request.args.get('start', datetime.utcnow().strftime('%Y-%m-%d'))
        end_date = request.args.get('end', (datetime.utcnow() + timedelta(days=30)).strftime('%Y-%m-%d'))
        
        tasks = ScheduledTask.query.filter_by(user_id=current_user.id)\
            .filter(ScheduledTask.scheduled_date >= start_date)\
            .filter(ScheduledTask.scheduled_date <= end_date)\
            .all()
        
        events = []
        for task in tasks:
            events.append({
                'id': task.id,
                'title': task.title,
                'start': task.scheduled_date.isoformat(),
                'end': (task.scheduled_date + timedelta(minutes=task.estimated_duration)).isoformat(),
                'backgroundColor': get_priority_color(task.priority),
                'borderColor': get_priority_color(task.priority),
                'extendedProps': {
                    'description': task.description,
                    'priority': task.priority,
                    'status': task.status,
                    'template': task.task_template.name if task.task_template else None
                }
            })
        
        return jsonify(events)
    
    def get_priority_color(priority):
        """Get color for task priority"""
        colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'urgent': '#dc3545'
        }
        return colors.get(priority, '#6c757d')
    
    @app.route('/admin/users')
    @login_required
    def admin_users():
        """Admin user management page"""
        if not current_user.can_edit_users():
            flash('Access denied. You do not have permission to manage users.', 'error')
            return redirect(url_for('dashboard'))
        
        users = User.query.order_by(User.created_at.desc()).all()
        return render_template('admin_users.html', users=users)
    
    @app.route('/admin/users/new', methods=['GET', 'POST'])
    @login_required
    def admin_create_user():
        """Create new user"""
        if not current_user.can_edit_users():
            flash('Access denied. You do not have permission to manage users.', 'error')
            return redirect(url_for('dashboard'))
        
        form = UserCreateForm()
        
        if form.validate_on_submit():
            user = User(
                username=form.username.data,
                email=form.email.data,
                first_name=form.first_name.data,
                last_name=form.last_name.data,
                phone=form.phone.data,
                address=form.address.data,
                role=form.role.data,
                status=form.status.data,
                is_admin=form.is_admin.data,
                can_manage_users=form.can_manage_users.data,
                notes=form.notes.data,
                created_by_admin_id=current_user.id
            )
            user.set_password(form.password.data)
            
            db.session.add(user)
            db.session.commit()
            
            flash(f'User {user.username} created successfully!', 'success')
            return redirect(url_for('admin_users'))
        
        return render_template('admin_user_form.html', form=form, title='Create New User')
    
    @app.route('/admin/users/<int:user_id>/edit', methods=['GET', 'POST'])
    @login_required
    def admin_edit_user(user_id):
        """Edit user"""
        if not current_user.can_edit_users():
            flash('Access denied. You do not have permission to manage users.', 'error')
            return redirect(url_for('dashboard'))
        
        user = User.query.get_or_404(user_id)
        form = UserManagementForm(obj=user)
        
        if form.validate_on_submit():
            user.username = form.username.data
            user.email = form.email.data
            user.first_name = form.first_name.data
            user.last_name = form.last_name.data
            user.phone = form.phone.data
            user.address = form.address.data
            user.role = form.role.data
            user.status = form.status.data
            user.is_admin = form.is_admin.data
            user.can_manage_users = form.can_manage_users.data
            user.is_active = form.is_active.data
            user.notes = form.notes.data
            
            db.session.commit()
            
            flash(f'User {user.username} updated successfully!', 'success')
            return redirect(url_for('admin_users'))
        
        return render_template('admin_user_form.html', form=form, title=f'Edit User: {user.username}', user=user)
    
    @app.route('/admin/users/<int:user_id>/delete', methods=['POST'])
    @login_required
    def admin_delete_user(user_id):
        """Delete user"""
        if not current_user.can_edit_users():
            flash('Access denied. You do not have permission to manage users.', 'error')
            return redirect(url_for('dashboard'))
        
        user = User.query.get_or_404(user_id)
        
        # Prevent deleting yourself
        if user.id == current_user.id:
            flash('You cannot delete your own account.', 'error')
            return redirect(url_for('admin_users'))
        
        username = user.username
        db.session.delete(user)
        db.session.commit()
        
        flash(f'User {username} deleted successfully!', 'success')
        return redirect(url_for('admin_users'))
    
    @app.route('/profile')
    @login_required
    def user_profile():
        """User profile page"""
        return render_template('user_profile.html', user=current_user)
    
    @app.route('/profile/edit', methods=['GET', 'POST'])
    @login_required
    def edit_profile():
        """Edit user's own profile"""
        form = UserEditForm(obj=current_user)
        
        if form.validate_on_submit():
            current_user.first_name = form.first_name.data
            current_user.last_name = form.last_name.data
            current_user.email = form.email.data
            current_user.phone = form.phone.data
            current_user.address = form.address.data
            current_user.notes = form.notes.data
            
            db.session.commit()
            
            flash('Your profile has been updated successfully!', 'success')
            return redirect(url_for('user_profile'))
        
        return render_template('edit_profile.html', form=form)
    
    # Debug routes (only available in debug mode)
    if app.config['DEBUG']:
        @app.route('/debug/db-info')
        def debug_db_info():
            """Debug endpoint to show database information"""
            users = User.query.count()
            sites = HiveSite.query.count()
            actions = HiveAction.query.count()
            tasks = TaskType.query.count()
            
            return jsonify({
                'database': app.config['SQLALCHEMY_DATABASE_URI'],
                'users': users,
                'sites': sites,
                'actions': actions,
                'task_types': tasks
            })
        
        @app.route('/debug/create-sample-data')
        def debug_create_sample_data():
            """Create sample data for testing"""
            # Create test user if not exists
            user = User.query.filter_by(username='testuser').first()
            if not user:
                user = User(username='testuser', email='test@homecare.com')
                user.set_password('test123')
                db.session.add(user)
                db.session.commit()
            
            # Create sample sites
            if HiveSite.query.filter_by(user_id=user.id).count() == 0:
                sites_data = [
                    {'name': 'North Field', 'lat': 40.7128, 'lon': -74.0060, 'hives': 5},
                    {'name': 'South Meadow', 'lat': 40.7580, 'lon': -73.9855, 'hives': 8},
                    {'name': 'East Garden', 'lat': 40.7489, 'lon': -73.9680, 'hives': 3}
                ]
                
                for data in sites_data:
                    site = HiveSite(
                        user_id=user.id,
                        name=data['name'],
                        latitude=data['lat'],
                        longitude=data['lon'],
                        hive_count=data['hives'],
                        harvest_timeline='Spring 2025',
                        sugar_requirements='10kg per month'
                    )
                    db.session.add(site)
                
                db.session.commit()
            
            return jsonify({'success': True, 'message': 'Sample data created'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])

