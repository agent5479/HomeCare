"""
HomeCare Management System - Flask Application
Professional Care Coordination Platform
"""

import os
from datetime import datetime, timedelta
import csv
import io
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, make_response
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from config import config
from models import db, User, Client, CareAction, CareTask, ScheduledTask, Employee, init_default_care_tasks
from forms import LoginForm, ClientForm, CareActionForm, ScheduledTaskForm, EmployeeForm

def calculate_care_metrics(clients, start_date, end_date, group_by):
    """Calculate care metrics for analytics dashboard"""
    data = {
        'active_clients': [],
        'care_actions': [],
        'scheduled_tasks': [],
        'urgent_cases': []
    }
    
    # Generate time periods based on group_by
    if group_by == 'months':
        current = start_date.replace(day=1)
        while current <= end_date:
            next_month = current.replace(month=current.month + 1) if current.month < 12 else current.replace(year=current.year + 1, month=1)
            
            # Calculate metrics for this month
            active_clients = Client.query.filter(
                Client.status == 'active',
                Client.created_at >= current,
                Client.created_at < next_month
            ).count()
            
            care_actions = CareAction.query.filter(
                CareAction.action_date >= current,
                CareAction.action_date < next_month
            ).count()
            
            scheduled_tasks = ScheduledTask.query.filter(
                ScheduledTask.scheduled_date >= current,
                ScheduledTask.scheduled_date < next_month
            ).count()
            
            urgent_cases = Client.query.filter(
                Client.care_level == 'urgent',
                Client.status == 'active'
            ).count()
            
            data['active_clients'].append({
                'date': current.strftime('%Y-%m'),
                'value': active_clients
            })
            data['care_actions'].append({
                'date': current.strftime('%Y-%m'),
                'value': care_actions
            })
            data['scheduled_tasks'].append({
                'date': current.strftime('%Y-%m'),
                'value': scheduled_tasks
            })
            data['urgent_cases'].append({
                'date': current.strftime('%Y-%m'),
                'value': urgent_cases
            })
            
            current = next_month
    
    return data

def create_app(config_name='default'):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    
    # Initialize login manager
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Register blueprints
    from routes import main_bp, auth_bp, clients_bp, actions_bp, tasks_bp, employees_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(clients_bp, url_prefix='/clients')
    app.register_blueprint(actions_bp, url_prefix='/actions')
    app.register_blueprint(tasks_bp, url_prefix='/tasks')
    app.register_blueprint(employees_bp, url_prefix='/employees')
    
    # Initialize database
    with app.app_context():
        db.create_all()
        
        # Initialize default care tasks
        init_default_care_tasks(db)
        
        # Create default users if none exist
        if User.query.count() == 0:
            # Jess - Admin
            jess = User(
                username='Jess',
                email='jess@homecare.com',
                role='admin',
                first_name='Jess',
                last_name='Admin',
                organization_id='Jess'
            )
            jess.set_password('JessCard2025!')
            db.session.add(jess)
            
            # GBTech - Developer
            gbtech = User(
                username='GBTech',
                email='gbtech@homecare.com',
                role='developer',
                first_name='GBTech',
                last_name='Developer',
                organization_id='GBTech'
            )
            gbtech.set_password('1q2w3e!Q@W#E')
            db.session.add(gbtech)
            
            db.session.commit()
            print("Created default users: Jess (admin) and GBTech (developer)")
    
    return app

# Error handlers
def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('errors/500.html'), 500

if __name__ == '__main__':
    app = create_app()
    register_error_handlers(app)
    app.run(debug=True, host='0.0.0.0', port=5000)