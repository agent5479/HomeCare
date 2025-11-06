"""
HomeCare Management System - Employee Routes
Professional Care Coordination Platform
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from models import db, Employee, User, CareAction, ScheduledTask
from forms import EmployeeForm, UserForm
from datetime import datetime, timedelta

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('/')
@login_required
def list_employees():
    """List all employees"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # Get filter parameters
    status_filter = request.args.get('status', 'all')
    department_filter = request.args.get('department', 'all')
    search_query = request.args.get('search', '')
    
    # Build query
    query = Employee.query.join(User)
    
    if status_filter != 'all':
        query = query.filter(Employee.status == status_filter)
    
    if department_filter != 'all':
        query = query.filter(Employee.department == department_filter)
    
    if search_query:
        query = query.filter(
            User.first_name.contains(search_query) |
            User.last_name.contains(search_query) |
            User.username.contains(search_query)
        )
    
    employees = query.order_by(User.first_name, User.last_name)\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    # Get unique departments for filter
    departments = db.session.query(Employee.department)\
        .filter(Employee.department.isnot(None))\
        .distinct().all()
    departments = [d[0] for d in departments if d[0]]
    
    return render_template('employees/list.html',
                         employees=employees,
                         status_filter=status_filter,
                         department_filter=department_filter,
                         search_query=search_query,
                         departments=departments)

@employees_bp.route('/add', methods=['GET', 'POST'])
@login_required
def add_employee():
    """Add new employee"""
    if not current_user.can_manage_users():
        flash('You do not have permission to add employees', 'error')
        return redirect(url_for('employees.list_employees'))
    
    form = EmployeeForm()
    
    # Populate user choices (users without employee records)
    existing_employee_user_ids = db.session.query(Employee.user_id).all()
    existing_employee_user_ids = [e[0] for e in existing_employee_user_ids]
    
    form.user_id.choices = [(u.id, u.get_full_name()) for u in 
                           User.query.filter(
                               User.id.notin_(existing_employee_user_ids),
                               User.is_active == True
                           ).order_by(User.first_name, User.last_name).all()]
    
    if form.validate_on_submit():
        # Parse skills and certifications
        skills = [skill.strip() for skill in form.skills.data.split('\n') if skill.strip()]
        certifications = [cert.strip() for cert in form.certifications.data.split('\n') if cert.strip()]
        
        employee = Employee(
            user_id=form.user_id.data,
            employee_id=form.employee_id.data,
            department=form.department.data,
            position=form.position.data,
            hire_date=form.hire_date.data,
            status=form.status.data,
            emergency_contact=form.emergency_contact.data
        )
        
        employee.set_skills_list(skills)
        employee.set_certifications_list(certifications)
        
        db.session.add(employee)
        db.session.commit()
        
        flash('Employee has been added successfully!', 'success')
        return redirect(url_for('employees.view_employee', id=employee.id))
    
    return render_template('employees/form.html', form=form, title='Add New Employee')

@employees_bp.route('/<int:id>')
@login_required
def view_employee(id):
    """View employee details"""
    employee = Employee.query.get_or_404(id)
    
    # Get recent care actions
    recent_actions = CareAction.query.filter_by(performed_by_id=employee.user_id)\
        .order_by(CareAction.action_date.desc())\
        .limit(10).all()
    
    # Get upcoming scheduled tasks
    upcoming_tasks = ScheduledTask.query.filter(
        ScheduledTask.assigned_to_id == employee.user_id,
        ScheduledTask.status == 'pending',
        ScheduledTask.scheduled_date >= datetime.now().date()
    ).order_by(ScheduledTask.scheduled_date.asc()).limit(10).all()
    
    # Get statistics
    total_actions = CareAction.query.filter_by(performed_by_id=employee.user_id).count()
    total_tasks = ScheduledTask.query.filter_by(assigned_to_id=employee.user_id).count()
    completed_tasks = ScheduledTask.query.filter(
        ScheduledTask.assigned_to_id == employee.user_id,
        ScheduledTask.status == 'completed'
    ).count()
    
    return render_template('employees/view.html',
                         employee=employee,
                         recent_actions=recent_actions,
                         upcoming_tasks=upcoming_tasks,
                         total_actions=total_actions,
                         total_tasks=total_tasks,
                         completed_tasks=completed_tasks)

@employees_bp.route('/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_employee(id):
    """Edit employee"""
    if not current_user.can_manage_users():
        flash('You do not have permission to edit employees', 'error')
        return redirect(url_for('employees.list_employees'))
    
    employee = Employee.query.get_or_404(id)
    form = EmployeeForm(obj=employee)
    
    # Populate user choices
    form.user_id.choices = [(u.id, u.get_full_name()) for u in 
                           User.query.filter_by(is_active=True).order_by(User.first_name, User.last_name).all()]
    
    # Pre-populate skills and certifications
    form.skills.data = '\n'.join(employee.get_skills_list())
    form.certifications.data = '\n'.join(employee.get_certifications_list())
    
    if form.validate_on_submit():
        # Parse skills and certifications
        skills = [skill.strip() for skill in form.skills.data.split('\n') if skill.strip()]
        certifications = [cert.strip() for cert in form.certifications.data.split('\n') if cert.strip()]
        
        employee.user_id = form.user_id.data
        employee.employee_id = form.employee_id.data
        employee.department = form.department.data
        employee.position = form.position.data
        employee.hire_date = form.hire_date.data
        employee.status = form.status.data
        employee.emergency_contact = form.emergency_contact.data
        employee.updated_at = datetime.utcnow()
        
        employee.set_skills_list(skills)
        employee.set_certifications_list(certifications)
        
        db.session.commit()
        
        flash('Employee has been updated successfully!', 'success')
        return redirect(url_for('employees.view_employee', id=employee.id))
    
    return render_template('employees/form.html', form=form, title='Edit Employee', employee=employee)

@employees_bp.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete_employee(id):
    """Delete employee"""
    if not current_user.can_manage_users():
        flash('You do not have permission to delete employees', 'error')
        return redirect(url_for('employees.list_employees'))
    
    employee = Employee.query.get_or_404(id)
    employee_name = employee.user.get_full_name()
    
    db.session.delete(employee)
    db.session.commit()
    
    flash(f'Employee "{employee_name}" has been deleted successfully!', 'success')
    return redirect(url_for('employees.list_employees'))

@employees_bp.route('/users')
@login_required
def list_users():
    """List all users"""
    if not current_user.can_manage_users():
        flash('You do not have permission to view users', 'error')
        return redirect(url_for('main.dashboard'))
    
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    users = User.query.order_by(User.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return render_template('employees/users.html', users=users)

@employees_bp.route('/users/add', methods=['GET', 'POST'])
@login_required
def add_user():
    """Add new user"""
    if not current_user.can_manage_users():
        flash('You do not have permission to add users', 'error')
        return redirect(url_for('employees.list_users'))
    
    form = UserForm()
    
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
            notes=form.notes.data
        )
        
        # Set default password (user should change it)
        user.set_password('password123')
        
        db.session.add(user)
        db.session.commit()
        
        flash(f'User "{user.username}" has been created successfully!', 'success')
        return redirect(url_for('employees.view_user', id=user.id))
    
    return render_template('employees/user_form.html', form=form, title='Add New User')

@employees_bp.route('/users/<int:id>')
@login_required
def view_user(id):
    """View user details"""
    if not current_user.can_manage_users():
        flash('You do not have permission to view users', 'error')
        return redirect(url_for('main.dashboard'))
    
    user = User.query.get_or_404(id)
    return render_template('employees/user_view.html', user=user)

@employees_bp.route('/users/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_user(id):
    """Edit user"""
    if not current_user.can_manage_users():
        flash('You do not have permission to edit users', 'error')
        return redirect(url_for('employees.list_users'))
    
    user = User.query.get_or_404(id)
    form = UserForm(obj=user)
    
    if form.validate_on_submit():
        user.username = form.username.data
        user.email = form.email.data
        user.first_name = form.first_name.data
        user.last_name = form.last_name.data
        user.phone = form.phone.data
        user.address = form.address.data
        user.role = form.role.data
        user.status = form.status.data
        user.notes = form.notes.data
        
        db.session.commit()
        
        flash('User has been updated successfully!', 'success')
        return redirect(url_for('employees.view_user', id=user.id))
    
    return render_template('employees/user_form.html', form=form, title='Edit User', user=user)
