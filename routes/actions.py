"""
HomeCare Management System - Care Action Routes
Professional Care Coordination Platform
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from models import db, CareAction, Client, CareTask
from forms import CareActionForm
from datetime import datetime, timedelta

actions_bp = Blueprint('actions', __name__)

@actions_bp.route('/')
@login_required
def list_actions():
    """List all care actions"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # Get filter parameters
    client_filter = request.args.get('client', 'all')
    task_filter = request.args.get('task', 'all')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')
    priority_filter = request.args.get('priority', 'all')
    
    # Build query
    query = CareAction.query
    
    if client_filter != 'all':
        query = query.filter_by(client_id=int(client_filter))
    
    if task_filter != 'all':
        query = query.filter_by(task_id=int(task_filter))
    
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
            query = query.filter(CareAction.action_date >= date_from_obj)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
            query = query.filter(CareAction.action_date <= date_to_obj)
        except ValueError:
            pass
    
    if priority_filter != 'all':
        query = query.filter_by(priority=priority_filter)
    
    actions = query.order_by(CareAction.action_date.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    # Get filter options
    clients = Client.query.filter_by(status='active').order_by(Client.name).all()
    tasks = CareTask.query.filter_by(is_active=True).order_by(CareTask.name).all()
    
    return render_template('actions/list.html',
                         actions=actions,
                         clients=clients,
                         tasks=tasks,
                         client_filter=client_filter,
                         task_filter=task_filter,
                         date_from=date_from,
                         date_to=date_to,
                         priority_filter=priority_filter)

@actions_bp.route('/add', methods=['GET', 'POST'])
@login_required
def add_action():
    """Add new care action"""
    form = CareActionForm()
    
    # Populate client and task choices
    form.client_id.choices = [(c.id, c.name) for c in Client.query.filter_by(status='active').order_by(Client.name).all()]
    form.task_id.choices = [(t.id, f"{t.name} ({t.category})") for t in CareTask.query.filter_by(is_active=True).order_by(CareTask.name).all()]
    
    if form.validate_on_submit():
        action = CareAction(
            client_id=form.client_id.data,
            performed_by_id=current_user.id,
            task_id=form.task_id.data,
            task_name=CareTask.query.get(form.task_id.data).name,
            task_category=CareTask.query.get(form.task_id.data).category,
            action_date=form.action_date.data,
            action_time=form.action_time.data,
            notes=form.notes.data,
            priority=form.priority.data,
            status=form.status.data
        )
        
        db.session.add(action)
        db.session.commit()
        
        flash('Care action has been logged successfully!', 'success')
        return redirect(url_for('actions.list_actions'))
    
    return render_template('actions/form.html', form=form, title='Log Care Action')

@actions_bp.route('/<int:id>')
@login_required
def view_action(id):
    """View care action details"""
    action = CareAction.query.get_or_404(id)
    return render_template('actions/view.html', action=action)

@actions_bp.route('/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_action(id):
    """Edit care action"""
    action = CareAction.query.get_or_404(id)
    form = CareActionForm(obj=action)
    
    # Populate client and task choices
    form.client_id.choices = [(c.id, c.name) for c in Client.query.filter_by(status='active').order_by(Client.name).all()]
    form.task_id.choices = [(t.id, f"{t.name} ({t.category})") for t in CareTask.query.filter_by(is_active=True).order_by(CareTask.name).all()]
    
    if form.validate_on_submit():
        action.client_id = form.client_id.data
        action.task_id = form.task_id.data
        action.task_name = CareTask.query.get(form.task_id.data).name
        action.task_category = CareTask.query.get(form.task_id.data).category
        action.action_date = form.action_date.data
        action.action_time = form.action_time.data
        action.notes = form.notes.data
        action.priority = form.priority.data
        action.status = form.status.data
        action.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        flash('Care action has been updated successfully!', 'success')
        return redirect(url_for('actions.view_action', id=action.id))
    
    return render_template('actions/form.html', form=form, title='Edit Care Action', action=action)

@actions_bp.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete_action(id):
    """Delete care action"""
    if not current_user.can_delete():
        flash('You do not have permission to delete care actions', 'error')
        return redirect(url_for('actions.list_actions'))
    
    action = CareAction.query.get_or_404(id)
    
    db.session.delete(action)
    db.session.commit()
    
    flash('Care action has been deleted successfully!', 'success')
    return redirect(url_for('actions.list_actions'))

@actions_bp.route('/quick-log', methods=['GET', 'POST'])
@login_required
def quick_log():
    """Quick care action logging"""
    if request.method == 'POST':
        # Handle quick logging form submission
        client_id = request.form.get('client_id')
        task_ids = request.form.get('task_ids', '').split(',')
        action_date = request.form.get('action_date')
        action_time = request.form.get('action_time')
        notes = request.form.get('notes', '')
        
        if not client_id or not task_ids or not action_date:
            flash('Please fill in all required fields', 'error')
            return redirect(url_for('actions.quick_log'))
        
        try:
            action_date = datetime.strptime(action_date, '%Y-%m-%d').date()
            action_time = datetime.strptime(action_time, '%H:%M').time() if action_time else None
        except ValueError:
            flash('Invalid date or time format', 'error')
            return redirect(url_for('actions.quick_log'))
        
        # Create actions for each task
        created_count = 0
        for task_id in task_ids:
            if task_id.strip():
                task = CareTask.query.get(int(task_id.strip()))
                if task:
                    action = CareAction(
                        client_id=int(client_id),
                        performed_by_id=current_user.id,
                        task_id=task.id,
                        task_name=task.name,
                        task_category=task.category,
                        action_date=action_date,
                        action_time=action_time,
                        notes=notes,
                        priority='normal',
                        status='completed'
                    )
                    db.session.add(action)
                    created_count += 1
        
        db.session.commit()
        flash(f'{created_count} care actions have been logged successfully!', 'success')
        return redirect(url_for('actions.list_actions'))
    
    # Get clients and tasks for the form
    clients = Client.query.filter_by(status='active').order_by(Client.name).all()
    tasks = CareTask.query.filter_by(is_active=True).order_by(CareTask.category, CareTask.name).all()
    
    return render_template('actions/quick_log.html', clients=clients, tasks=tasks)
