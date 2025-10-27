// BeeMarshall - Employee Management Module

function showEmployees() {
    // Check permission
    if (!canManageEmployees()) {
        showPermissionDeniedAlert('access employee management');
        return;
    }
    hideAllViews();
    document.getElementById('employeesView').classList.remove('hidden');
    if (typeof updateActiveNav === 'function') {
        updateActiveNav('Team');
    }
    renderEmployees();
}

function handleAddEmployee(e) {
    e.preventDefault();
    
    // Check permission
    if (!canManageEmployees()) {
        showPermissionDeniedAlert('add employees');
        return;
    }
    
    const name = document.getElementById('newEmployeeName').value.trim();
    const password = document.getElementById('newEmployeePassword').value;
    
    if (!name || !password) {
        alert('Please enter both name and password');
        return;
    }
    
    const employeeId = 'emp_' + Date.now();
    const employee = {
        id: employeeId,
        username: name,
        passwordHash: simpleHash(password),
        role: 'employee',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.username
    };
    
    // Use tenant-specific path for data isolation
    const tenantPath = currentTenantId ? `tenants/${currentTenantId}/employees` : 'employees';
    database.ref(`${tenantPath}/${employeeId}`).set(employee)
        .then(() => {
            beeMarshallAlert(`✅ Employee "${name}" added successfully!\n\nThey can login with:\nUsername: ${name}\nPassword: [the password you set]`, 'success');
            document.getElementById('addEmployeeForm').reset();
            loadEmployees();
        });
}

function renderEmployees() {
    const html = employees.length > 0
        ? `<div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Added</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => `
                        <tr>
                            <td><i class="bi bi-person"></i> ${emp.username}</td>
                            <td><span class="badge bg-info">${emp.role}</span></td>
                            <td><small>${new Date(emp.createdAt).toLocaleDateString()}</small></td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" onclick="removeEmployee('${emp.id}')">
                                    <i class="bi bi-trash"></i> Remove
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`
        : '<p class="text-muted">No employees yet. Add your first employee above!</p>';
    
    document.getElementById('employeesList').innerHTML = html;
}

function removeEmployee(id) {
    // Check permission
    if (!canManageEmployees()) {
        showPermissionDeniedAlert('remove employees');
        return;
    }
    
    if (confirm('Remove this employee? They will no longer be able to login.')) {
        // Use tenant-specific path for data isolation
        const tenantPath = currentTenantId ? `tenants/${currentTenantId}/employees` : 'employees';
        database.ref(`${tenantPath}/${id}`).remove();
    }
}

// Password visibility toggles
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const icon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}

function toggleEmployeePasswordVisibility() {
    const passwordInput = document.getElementById('newEmployeePassword');
    const icon = document.getElementById('employeePasswordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}
