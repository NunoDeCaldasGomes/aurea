

class FormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;
    
    this.rules = {};
    this.errors = {};
    this.setupListeners();
  }
  
  addRule(fieldName, rule, message) {
    if (!this.rules[fieldName]) this.rules[fieldName] = [];
    this.rules[fieldName].push({ rule, message });
  }
  
  setupListeners() {
 
    this.form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearFieldError(field));
    });
    

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  validateField(field) {
    const fieldName = field.name;
    if (!this.rules[fieldName]) return true;
    
    let isValid = true;
    this.errors[fieldName] = [];
    
    for (const { rule, message } of this.rules[fieldName]) {
      if (!rule(field.value)) {
        isValid = false;
        this.errors[fieldName].push(message);
      }
    }
    
    if (!isValid) {
      this.showFieldError(field, this.errors[fieldName]);
    } else {
      this.clearFieldError(field);
    }
    
    return isValid;
  }
  
  showFieldError(field, messages) {
    let errorContainer = field.nextElementSibling;
    if (!errorContainer || !errorContainer.classList.contains('field-error')) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'field-error';
      field.parentNode.insertBefore(errorContainer, field.nextSibling);
    }
    
    errorContainer.innerHTML = messages.map(msg => `<span class="error-msg">${msg}</span>`).join('');
    field.classList.add('field-invalid');
  }
  
  clearFieldError(field) {
    const errorContainer = field.nextElementSibling;
    if (errorContainer && errorContainer.classList.contains('field-error')) {
      errorContainer.remove();
    }
    field.classList.remove('field-invalid');
    delete this.errors[field.name];
  }
  
  validateAll() {
    let isValid = true;
    this.form.querySelectorAll('input, textarea, select').forEach(field => {
      if (!this.validateField(field)) isValid = false;
    });
    return isValid;
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateAll()) {
      showToast('Veuillez corriger les erreurs', 'warning');
      return;
    }
    

    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.innerHTML = '<span class="btn-loader">⟳</span>';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        showToast('Formulaire envoyé avec succès!', 'success');
        this.form.reset();
        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Envoyer';
        submitBtn.disabled = false;
      }, 1200);
    }
  }
}


const ValidationRules = {
  required: (value) => value.trim().length > 0,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  minLength: (min) => (value) => value.length >= min,
  maxLength: (max) => (value) => value.length <= max,
  strongPassword: (value) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
  },
  username: (value) => /^[a-zA-Z0-9_]{3,20}$/.test(value),
  phone: (value) => /^\+?[0-9\s\-\(\)]{10,}$/.test(value),
  notEmpty: (value) => value.trim().length > 0
};


document.addEventListener('DOMContentLoaded', () => {

  const loginForm = new FormValidator('form');
  if (document.querySelector('form') && window.location.pathname.includes('login')) {
    loginForm.addRule('username', ValidationRules.required, 'L\'identifiant est requis');
    loginForm.addRule('username', ValidationRules.username, 'Identifiant invalide (3-20 caractères alphanumériques)');
    loginForm.addRule('password', ValidationRules.required, 'Le mot de passe est requis');
  }
  

  if (window.location.pathname.includes('register')) {
    loginForm.addRule('username', ValidationRules.required, 'L\'identifiant est requis');
    loginForm.addRule('username', ValidationRules.username, 'Identifiant invalide (3-20 caractères)');
    loginForm.addRule('email', ValidationRules.required, 'L\'email est requis');
    loginForm.addRule('email', ValidationRules.email, 'Email invalide');
    loginForm.addRule('password', ValidationRules.required, 'Le mot de passe est requis');
    loginForm.addRule('password', ValidationRules.strongPassword, 'Mot de passe faible (min 8 caractères, 1 majuscule, 1 chiffre)');
    loginForm.addRule('password-confirm', ValidationRules.required, 'Confirmation requise');
  }
  

  if (window.location.pathname.includes('contact')) {
    loginForm.addRule('name', ValidationRules.required, 'Le nom est requis');
    loginForm.addRule('name', ValidationRules.minLength(2), 'Le nom doit avoir au moins 2 caractères');
    loginForm.addRule('email', ValidationRules.required, 'L\'email est requis');
    loginForm.addRule('email', ValidationRules.email, 'Email invalide');
    loginForm.addRule('subject', ValidationRules.required, 'Le sujet est requis');
    loginForm.addRule('message', ValidationRules.required, 'Le message est requis');
    loginForm.addRule('message', ValidationRules.minLength(10), 'Le message doit avoir au moins 10 caractères');
  }
});
