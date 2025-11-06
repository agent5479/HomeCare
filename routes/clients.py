"""
HomeCare Management System - Client Routes
Professional Care Coordination Platform
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from models import db, Client, CareAction, ScheduledTask
from forms import ClientForm
from datetime import datetime, timedelta

clients_bp = Blueprint('clients', __name__)

@clients_bp.route('/')
@login_required
def list_clients():
    """List all clients"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # Get filter parameters
    status_filter = request.args.get('status', 'all')
    care_level_filter = request.args.get('care_level', 'all')
    search_query = request.args.get('search', '')
    
    # Build query
    query = Client.query
    
    if status_filter != 'all':
        query = query.filter_by(status=status_filter)
    
    if care_level_filter != 'all':
        query = query.filter_by(care_level=care_level_filter)
    
    if search_query:
        query = query.filter(
            Client.name.contains(search_query) |
            Client.description.contains(search_query)
        )
    
    clients = query.order_by(Client.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('clients/list.html', 
                         clients=clients,
                         status_filter=status_filter,
                         care_level_filter=care_level_filter,
                         search_query=search_query)

@clients_bp.route('/add', methods=['GET', 'POST'])
@login_required
def add_client():
    """Add new client"""
    form = ClientForm()
    
    if form.validate_on_submit():
        client = Client(
            name=form.name.data,
            description=form.description.data,
            age=form.age.data,
            status=form.status.data,
            care_level=form.care_level.data,
            phone=form.phone.data,
            email=form.email.data,
            address=form.address.data,
            emergency_contact=form.emergency_contact.data,
            medical_conditions=form.medical_conditions.data,
            allergies=form.allergies.data,
            medications=form.medications.data,
            special_instructions=form.special_instructions.data,
            latitude=float(form.latitude.data) if form.latitude.data else None,
            longitude=float(form.longitude.data) if form.longitude.data else None
        )
        
        db.session.add(client)
        db.session.commit()
        
        flash(f'Client "{client.name}" has been added successfully!', 'success')
        return redirect(url_for('clients.view_client', id=client.id))
    
    return render_template('clients/form.html', form=form, title='Add New Client')

@clients_bp.route('/<int:id>')
@login_required
def view_client(id):
    """View client details"""
    client = Client.query.get_or_404(id)
    
    # Get recent care actions
    recent_actions = CareAction.query.filter_by(client_id=id)\
        .order_by(CareAction.action_date.desc())\
        .limit(10).all()
    
    # Get upcoming scheduled tasks
    upcoming_tasks = ScheduledTask.query.filter(
        ScheduledTask.client_id == id,
        ScheduledTask.status == 'pending',
        ScheduledTask.scheduled_date >= datetime.now().date()
    ).order_by(ScheduledTask.scheduled_date.asc()).limit(10).all()
    
    return render_template('clients/view.html',
                         client=client,
                         recent_actions=recent_actions,
                         upcoming_tasks=upcoming_tasks)

@clients_bp.route('/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_client(id):
    """Edit client"""
    client = Client.query.get_or_404(id)
    form = ClientForm(obj=client)
    
    if form.validate_on_submit():
        client.name = form.name.data
        client.description = form.description.data
        client.age = form.age.data
        client.status = form.status.data
        client.care_level = form.care_level.data
        client.phone = form.phone.data
        client.email = form.email.data
        client.address = form.address.data
        client.emergency_contact = form.emergency_contact.data
        client.medical_conditions = form.medical_conditions.data
        client.allergies = form.allergies.data
        client.medications = form.medications.data
        client.special_instructions = form.special_instructions.data
        client.latitude = float(form.latitude.data) if form.latitude.data else None
        client.longitude = float(form.longitude.data) if form.longitude.data else None
        client.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        flash(f'Client "{client.name}" has been updated successfully!', 'success')
        return redirect(url_for('clients.view_client', id=client.id))
    
    return render_template('clients/form.html', form=form, title='Edit Client', client=client)

@clients_bp.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete_client(id):
    """Delete client"""
    if not current_user.can_delete():
        flash('You do not have permission to delete clients', 'error')
        return redirect(url_for('clients.list_clients'))
    
    client = Client.query.get_or_404(id)
    client_name = client.name
    
    db.session.delete(client)
    db.session.commit()
    
    flash(f'Client "{client_name}" has been deleted successfully!', 'success')
    return redirect(url_for('clients.list_clients'))

@clients_bp.route('/<int:id>/actions')
@login_required
def client_actions(id):
    """View client's care actions"""
    client = Client.query.get_or_404(id)
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    actions = CareAction.query.filter_by(client_id=id)\
        .order_by(CareAction.action_date.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return render_template('clients/actions.html', client=client, actions=actions)

@clients_bp.route('/<int:id>/tasks')
@login_required
def client_tasks(id):
    """View client's scheduled tasks"""
    client = Client.query.get_or_404(id)
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    tasks = ScheduledTask.query.filter_by(client_id=id)\
        .order_by(ScheduledTask.scheduled_date.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return render_template('clients/tasks.html', client=client, tasks=tasks)
