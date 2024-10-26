export const validationRules = {
    username: {
      required: 'Username is required',
      minLength: { value: 3, message: 'Username must be at least 3 characters' },
      maxLength: { value: 20, message: 'Username must be less than 20 characters' },
      pattern: {
        value: /^[a-zA-Z0-9_-]+$/,
        message: 'Username can only contain letters, numbers, underscores and dashes'
      }
    },
    
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address'
      }
    },
    
    password: {
      required: 'Password is required',
      minLength: { value: 8, message: 'Password must be at least 8 characters' },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
      }
    }
  };
  
  export const validateImage = (file: File) => {
    const errors: string[] = [];
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please upload a JPEG, PNG or WebP image.');
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      errors.push('File size must be less than 5MB.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  export const validateAnnotation = (annotation: {
    label: string;
    description?: string;
    x: number;
    y: number;
    endX?: number;
    endY?: number;
    type: 'DOT' | 'ARROW';
  }) => {
    const errors: string[] = [];
    
    if (!annotation.label.trim()) {
      errors.push('Label is required');
    }
    
    if (annotation.label.length > 100) {
      errors.push('Label must be less than 100 characters');
    }
    
    if (annotation.description && annotation.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }
    
    if (annotation.type === 'ARROW' && (
      typeof annotation.endX !== 'number' ||
      typeof annotation.endY !== 'number'
    )) {
      errors.push('End coordinates are required for arrow annotations');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  export const validateUser = (user: {
    username: string;
    email: string;
    password?: string;
  }) => {
    const errors: Record<string, string> = {};
    
    // Username validation
    if (!user.username) {
      errors.username = validationRules.username.required;
    } else if (user.username.length < 3) {
      errors.username = validationRules.username.minLength.message;
    } else if (user.username.length > 20) {
      errors.username = validationRules.username.maxLength.message;
    } else if (!validationRules.username.pattern.value.test(user.username)) {
      errors.username = validationRules.username.pattern.message;
    }
    
    // Email validation
    if (!user.email) {
      errors.email = validationRules.email.required;
    } else if (!validationRules.email.pattern.value.test(user.email)) {
      errors.email = validationRules.email.pattern.message;
    }
    
    // Password validation (only if provided)
    if (user.password) {
      if (user.password.length < 8) {
        errors.password = validationRules.password.minLength.message;
      } else if (!validationRules.password.pattern.value.test(user.password)) {
        errors.password = validationRules.password.pattern.message;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };