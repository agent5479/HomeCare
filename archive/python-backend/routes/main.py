"""
HomeCare Management System - Main Routes
Professional Care Coordination Platform
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from models import db, Client, CareAction, ScheduledTask, CareTask, User
from datetime import datetime, timedelta
import json

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@main_bp.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard"""
    # Get recent data
    recent_clients = Client.query.filter_by(status='active').order_by(Client.created_at.desc()).limit(5).all()
    recent_actions = CareAction.query.order_by(CareAction.action_date.desc()).limit(10).all()
    upcoming_tasks = ScheduledTask.query.filter(
        ScheduledTask.status == 'pending',
        ScheduledTask.scheduled_date >= datetime.now().date()
    ).order_by(ScheduledTask.scheduled_date.asc()).limit(10).all()
    
    # Get statistics
    total_clients = Client.query.filter_by(status='active').count()
    total_actions_today = CareAction.query.filter(
        CareAction.action_date == datetime.now().date()
    ).count()
    pending_tasks = ScheduledTask.query.filter_by(status='pending').count()
    urgent_tasks = ScheduledTask.query.filter(
        ScheduledTask.priority == 'urgent',
        ScheduledTask.status == 'pending'
    ).count()
    
    # Get care level distribution
    care_levels = db.session.query(
        Client.care_level,
        db.func.count(Client.id)
    ).filter_by(status='active').group_by(Client.care_level).all()
    
    # Get recent activity
    recent_activity = []
    for action in recent_actions[:5]:
        recent_activity.append({
            'type': 'action',
            'description': f"Care action: {action.task_name}",
            'client': action.client.name,
            'date': action.action_date,
            'user': action.performed_by.get_full_name()
        })
    
    for task in upcoming_tasks[:5]:
        recent_activity.append({
            'type': 'task',
            'description': f"Scheduled task: {task.task_name}",
            'client': task.client.name,
            'date': task.scheduled_date,
            'user': task.assigned_to.get_full_name()
        })
    
    # Sort by date
    recent_activity.sort(key=lambda x: x['date'], reverse=True)
    
    return render_template('dashboard.html',
                         recent_clients=recent_clients,
                         recent_actions=recent_actions,
                         upcoming_tasks=upcoming_tasks,
                         total_clients=total_clients,
                         total_actions_today=total_actions_today,
                         pending_tasks=pending_tasks,
                         urgent_tasks=urgent_tasks,
                         care_levels=care_levels,
                         recent_activity=recent_activity)

@main_bp.route('/analytics')
@login_required
def analytics():
    """Analytics dashboard"""
    # Get date range from request
    start_date = request.args.get('start_date', (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
    group_by = request.args.get('group_by', 'days')
    
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        start_date = (datetime.now() - timedelta(days=30)).date()
        end_date = datetime.now().date()
    
    # Get clients for the organization
    clients = Client.query.filter_by(status='active').all()
    
    # Calculate metrics
    metrics = calculate_care_metrics(clients, start_date, end_date, group_by)
    
    return render_template('analytics.html',
                         start_date=start_date,
                         end_date=end_date,
                         group_by=group_by,
                         metrics=metrics)

def calculate_care_metrics(clients, start_date, end_date, group_by):
    """Calculate care metrics for analytics"""
    data = {
        'active_clients': [],
        'care_actions': [],
        'scheduled_tasks': [],
        'urgent_cases': []
    }
    
    if group_by == 'days':
        current = start_date
        while current <= end_date:
            next_day = current + timedelta(days=1)
            
            # Calculate metrics for this day
            active_clients = len([c for c in clients if c.created_at.date() <= current])
            
            care_actions = CareAction.query.filter(
                CareAction.action_date >= current,
                CareAction.action_date < next_day
            ).count()
            
            scheduled_tasks = ScheduledTask.query.filter(
                ScheduledTask.scheduled_date >= current,
                ScheduledTask.scheduled_date < next_day
            ).count()
            
            urgent_cases = len([c for c in clients if c.care_level == 'urgent'])
            
            data['active_clients'].append({
                'date': current.strftime('%Y-%m-%d'),
                'value': active_clients
            })
            data['care_actions'].append({
                'date': current.strftime('%Y-%m-%d'),
                'value': care_actions
            })
            data['scheduled_tasks'].append({
                'date': current.strftime('%Y-%m-%d'),
                'value': scheduled_tasks
            })
            data['urgent_cases'].append({
                'date': current.strftime('%Y-%m-%d'),
                'value': urgent_cases
            })
            
            current = next_day
    
    return data

@main_bp.route('/api/stats')
@login_required
def api_stats():
    """API endpoint for dashboard statistics"""
    stats = {
        'total_clients': Client.query.filter_by(status='active').count(),
        'total_actions_today': CareAction.query.filter(
            CareAction.action_date == datetime.now().date()
        ).count(),
        'pending_tasks': ScheduledTask.query.filter_by(status='pending').count(),
        'urgent_tasks': ScheduledTask.query.filter(
            ScheduledTask.priority == 'urgent',
            ScheduledTask.status == 'pending'
        ).count()
    }
    
    return jsonify(stats)
