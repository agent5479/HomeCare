// BeeMarshall - Form Validation System
// Enhanced form validation with real-time feedback and field grouping

const FormValidator = {
    // Validation rules for different field types
    rules: {
        siteName: {
            required: true,
            minLength: 3,
            maxLength: 50,
            pattern: /^[a-zA-Z0-9\s\-_]+$/,
            message: 'Site name must be 3-50 characters (letters, numbers, spaces, hyphens, underscores)'
        },
        latitude: {
            required: true,
            type: 'number',
            min: -90,
            max: 90,
            message: 'Latitude must be between -90 and 90 degrees'
        },
        longitude: {
            required: true,
            type: 'number',
            min: -180,
            max: 180,
            message: 'Longitude must be between -180 and 180 degrees'
        },
        hiveCount: {
            required: true,
            type: 'number',
            min: 0,
            max: 1000,
            message: 'Hive count must be between 0 and 1000'
        }
    },
    
    // Initialize form validation
    init: function() {
        // Add real-time validation to inputs
        this.attachValidationListeners();
        
        // Add visual indicators for required fields
        this.markRequiredFields();
        
        // Add form grouping
        this.groupFormSections();
    },
    
    // Attach real-time validation listeners
    attachValidationListeners: function() {
        // Validate on blur
        document.addEventListener('blur', function(e) {
            if (e.target.matches('input[data-validate], input[required]')) {
                FormValidator.validateField(e.target);
            }
        }, true);
        
        // Show validation on input (for some fields)
        document.addEventListener('input', function(e) {
            if (e.target.matches('input[data-validate="realtime"]')) {
                FormValidator.validateField(e.target);
            }
        }, true);
    },
    
    // Validate a single field
    validateField: function(field) {
        const fieldName = field.id || field.name;
        const value = field.value.trim();
        const rule = this.rules[fieldName];
        
        if (!rule) {
            // No specific rule, use generic validation
            if (field.required && !value) {
                this.showError(field, 'This field is required');
                return false;
            }
            this.showSuccess(field);
            return true;
        }
        
        // Check required
        if (rule.required && !value) {
            this.showError(field, 'This field is required');
            return false;
        }
        
        if (!value && !rule.required) {
            this.showSuccess(field);
            return true;
        }
        
        // Check type
        if (rule.type === 'number') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                this.showError(field, 'Please enter a valid number');
                return false;
            }
            
            if (rule.min !== undefined && numValue < rule.min) {
                this.showError(field, `Value must be at least ${rule.min}`);
                return false;
            }
            
            if (rule.max !== undefined && numValue > rule.max) {
                this.showError(field, `Value must be at most ${rule.max}`);
                return false;
            }
        }
        
        // Check min/max length
        if (rule.minLength && value.length < rule.minLength) {
            this.showError(field, `Minimum length is ${rule.minLength} characters`);
            return false;
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
            this.showError(field, `Maximum length is ${rule.maxLength} characters`);
            return false;
        }
        
        // Check pattern
        if (rule.pattern && !rule.pattern.test(value)) {
            this.showError(field, rule.message || 'Invalid format');
            return false;
        }
        
        this.showSuccess(field);
        return true;
    },
    
    // Validate entire form
    validateForm: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        const fields = form.querySelectorAll('input[required], input[data-validate], select[required], textarea[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    // Show error state
    showError: function(field, message) {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        
        // Remove existing error message
        let errorDiv = field.parentElement.querySelector('.invalid-feedback');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            field.parentElement.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    },
    
    // Show success state
    showSuccess: function(field) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        
        // Remove error message if exists
        const errorDiv = field.parentElement.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    },
    
    // Mark required fields with asterisks
    markRequiredFields: function() {
        document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
            const label = document.querySelector(`label[for="${field.id}"]`);
            if (label && !label.querySelector('.required-asterisk')) {
                const asterisk = document.createElement('span');
                asterisk.className = 'text-danger required-asterisk';
                asterisk.textContent = ' *';
                label.appendChild(asterisk);
            }
        });
    },
    
    // Group form sections
    groupFormSections: function() {
        // This will be applied to forms dynamically
        // Can be customized per form type
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    FormValidator.init();
});

// Export for use in other modules
window.FormValidator = FormValidator;
