"""
HomeCare Management System - Task Routes
Professional Care Coordination Platform
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from models import db, ScheduledTask, Client, CareTask, User
from forms import ScheduledTaskForm, QuickScheduleForm
from datetime import datetime, timedelta

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/')
@login_required
def list_tasks():
    """List all scheduled tasks"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # Get filter parameters
    client_filter = request.args.get('client', 'all')
    assigned_to_filter = request.args.get('assigned_to', 'all')
    status_filter = request.args.get('status', 'all')
    priority_filter = request.args.get('priority', 'all')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')
    
    # Build query
    query = ScheduledTask.query
    
    if client_filter != 'all':
        query = query.filter_by(client_id=int(client_filter))
    
    if assigned_to_filter != 'all':
        query = query.filter_by(assigned_to_id=int(assigned_to_filter))
    
    if status_filter != 'all':
        query = query.filter_by(status=status_filter)
    
    if priority_filter != 'all':
        query = query.filter_by(priority=priority_filter)
    
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
            query = query.filter(ScheduledTask.scheduled_date >= date_from_obj)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
            query = query.filter(ScheduledTask.scheduled_date <= date_to_obj)
        except ValueError:
            pass
    
    tasks = query.order_by(ScheduledTask.scheduled_date.asc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    # Get filter options
    clients = Client.query.filter_by(status='active').order_by(Client.name).all()
    users = User.query.filter_by(is_active=True).order_by(User.first_name, User.last_name).all()
    
    return render_template('tasks/list.html',
                         tasks=tasks,
                         clients=clients,
                         users=users,
                         client_filter=client_filter,
                         assigned_to_filter=assigned_to_filter,
                         status_filter=status_filter,
                         priority_filter=priority_filter,
                         date_from=date_from,
                         date_to=date_to)

@tasks_bp.route('/add', methods=['GET', 'POST'])
@login_required
def add_task():
    """Add new scheduled task"""
    form = ScheduledTaskForm()
    
    # Populate choices
    form.client_id.choices = [(c.id, c.name) for c in Client.query.filter_by(status='active').order_by(Client.name).all()]
    form.assigned_to_id.choices = [(u.id, u.get_full_name()) for u in User.query.filter_by(is_active=True).order_by(User.first_name, User.last_name).all()]
    form.task_id.choices = [(t.id, f"{t.name} ({t.category})") for t in CareTask.query.filter_by(is_active=True).order_by(CareTask.name).all()]
    
    if form.validate_on_submit():
        task = ScheduledTask(
            client_id=form.client_id.data,
            assigned_to_id=form.assigned_to_id.data,
            task_id=form.task_id.data,
            task_name=CareTask.query.get(form.task_id.data).name,
            task_category=CareTask.query.get(form.task_id.data).category,
            scheduled_date=form.scheduled_date.data,
            scheduled_time=form.scheduled_time.data,
            priority=form.priority.data,
            notes=form.notes.data
        )
        
        db.session.add(task)
        db.session.commit()
        
        flash('Scheduled task has been created successfully!', 'success')
        return redirect(url_for('tasks.list_tasks'))
    
    return render_template('tasks/form.html', form=form, title='Schedule New Task')

@tasks_bp.route('/<int:id>')
@login_required
def view_task(id):
    """View scheduled task details"""
    task = ScheduledTask.query.get_or_404(id)
    return render_template('tasks/view.html', task=task)

@tasks_bp.route('/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_task(id):
    """Edit scheduled task"""
    task = ScheduledTask.query.get_or_404(id)
    form = ScheduledTaskForm(obj=task)
    
    # Populate choices
    form.client_id.choices = [(c.id, c.name) for c in Client.query.filter_by(status='active').order_by(Client.name).all()]
    form.assigned_to_id.choices = [(u.id, u.get_full_name()) for u in User.query.filter_by(is_active=True).order_by(User.first_name, User.last_name).all()]
    form.task_id.choices = [(t.id, f"{t.name} ({t.category})") for t in CareTask.query.filter_by(is_active=True).order_by(CareTask.name).all()]
    
    if form.validate_on_submit():
        task.client_id = form.client_id.data
        task.assigned_to_id = form.assigned_to_id.data
        task.task_id = form.task_id.data
        task.task_name = CareTask.query.get(form.task_id.data).name
        task.task_category = CareTask.query.get(form.task_id.data).category
        task.scheduled_date = form.scheduled_date.data
        task.scheduled_time = form.scheduled_time.data
        task.priority = form.priority.data
        task.notes = form.notes.data
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        flash('Scheduled task has been updated successfully!', 'success')
        return redirect(url_for('tasks.view_task', id=task.id))
    
    return render_template('tasks/form.html', form=form, title='Edit Scheduled Task', task=task)

@tasks_bp.route('/<int:id>/complete', methods=['POST'])
@login_required
def complete_task(id):
    """Mark task as completed"""
    task = ScheduledTask.query.get_or_404(id)
    
    if task.status == 'completed':
        flash('Task is already completed', 'info')
        return redirect(url_for('tasks.view_task', id=task.id))
    
    task.status = 'completed'
    task.completed_at = datetime.utcnow()
    task.completed_by_id = current_user.id
    task.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    flash('Task has been marked as completed!', 'success')
    return redirect(url_for('tasks.view_task', id=task.id))

@tasks_bp.route('/<int:id>/cancel', methods=['POST'])
@login_required
def cancel_task(id):
    """Cancel scheduled task"""
    task = ScheduledTask.query.get_or_404(id)
    
    if task.status == 'cancelled':
        flash('Task is already cancelled', 'info')
        return redirect(url_for('tasks.view_task', id=task.id))
    
    task.status = 'cancelled'
    task.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    flash('Task has been cancelled!', 'success')
    return redirect(url_for('tasks.view_task', id=task.id))

@tasks_bp.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete_task(id):
    """Delete scheduled task"""
    if not current_user.can_delete():
        flash('You do not have permission to delete tasks', 'error')
        return redirect(url_for('tasks.list_tasks'))
    
    task = ScheduledTask.query.get_or_404(id)
    
    db.session.delete(task)
    db.session.commit()
    
    flash('Scheduled task has been deleted successfully!', 'success')
    return redirect(url_for('tasks.list_tasks'))

@tasks_bp.route('/quick-schedule', methods=['GET', 'POST'])
@login_required
def quick_schedule():
    """Quick task scheduling"""
    form = QuickScheduleForm()
    
    # Populate choices
    form.client_id.choices = [(c.id, c.name) for c in Client.query.filter_by(status='active').order_by(Client.name).all()]
    
    if form.validate_on_submit():
        task_ids = [int(tid.strip()) for tid in form.task_ids.data.split(',') if tid.strip()]
        
        if not task_ids:
            flash('Please select at least one task', 'error')
            return redirect(url_for('tasks.quick_schedule'))
        
        # Create tasks for each selected task
        created_count = 0
        for task_id in task_ids:
            task = CareTask.query.get(task_id)
            if task:
                scheduled_task = ScheduledTask(
                    client_id=form.client_id.data,
                    assigned_to_id=current_user.id,
                    task_id=task.id,
                    task_name=task.name,
                    task_category=task.category,
                    scheduled_date=form.scheduled_date.data,
                    scheduled_time=form.scheduled_time.data,
                    priority=form.priority.data,
                    notes=form.notes.data
                )
                db.session.add(scheduled_task)
                created_count += 1
        
        db.session.commit()
        flash(f'{created_count} tasks have been scheduled successfully!', 'success')
        return redirect(url_for('tasks.list_tasks'))
    
    # Get tasks for selection
    tasks = CareTask.query.filter_by(is_active=True).order_by(CareTask.category, CareTask.name).all()
    
    return render_template('tasks/quick_schedule.html', form=form, tasks=tasks)

@tasks_bp.route('/overdue')
@login_required
def overdue_tasks():
    """List overdue tasks"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    overdue_tasks = ScheduledTask.query.filter(
        ScheduledTask.status == 'pending',
        ScheduledTask.scheduled_date < datetime.now().date()
    ).order_by(ScheduledTask.scheduled_date.asc())\
    .paginate(page=page, per_page=per_page, error_out=False)
    
    return render_template('tasks/overdue.html', tasks=overdue_tasks)
