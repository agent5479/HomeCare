"""
HomeCare Management System - Routes Package
Professional Care Coordination Platform
"""

from .main import main_bp
from .auth import auth_bp
from .clients import clients_bp
from .actions import actions_bp
from .tasks import tasks_bp
from .employees import employees_bp

__all__ = ['main_bp', 'auth_bp', 'clients_bp', 'actions_bp', 'tasks_bp', 'employees_bp']