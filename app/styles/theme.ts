// Theme configuration for the entire application
export const theme = {
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    secondary: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    },
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    danger: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    background: {
      light: '#FFFFFF',
      dark: '#111827',
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  // Border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.625rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  // Box shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 15px rgba(59, 130, 246, 0.5)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },
  
  // Transitions
  transition: {
    default: '0.2s ease-in-out',
    fast: '0.1s ease-in-out',
    slow: '0.3s ease-in-out',
  },
  
  // Buttons
  buttons: {
    // Primary button (Blue gradient)
    primary: {
      background: 'linear-gradient(45deg, var(--primary) 0%, var(--secondary) 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '0.625rem',
      fontWeight: '500',
      padding: '0.625rem 1.25rem',
      transition: '0.2s ease-in-out',
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)',
      },
      active: {
        transform: 'translateY(0)',
      }
    },
    
    // Secondary button (Neutral border)
    secondary: {
      background: 'transparent',
      color: 'var(--foreground)',
      border: '1px solid var(--border)',
      borderRadius: '0.625rem',
      fontWeight: '500',
      padding: '0.625rem 1.25rem',
      transition: '0.2s ease-in-out',
      hover: {
        background: 'var(--muted)',
        borderColor: 'var(--muted-foreground)',
      }
    },
    
    // Success button (Green gradient)
    success: {
      background: 'linear-gradient(45deg, #22C55E 0%, #10B981 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '0.625rem',
      fontWeight: '500',
      padding: '0.625rem 1.25rem',
      transition: '0.2s ease-in-out',
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)',
      }
    },
    
    // Warning button (Amber gradient)
    warning: {
      background: 'linear-gradient(45deg, #F59E0B 0%, #FBBF24 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '0.625rem',
      fontWeight: '500',
      padding: '0.625rem 1.25rem',
      transition: '0.2s ease-in-out',
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
      }
    },
    
    // Danger button (Red gradient)
    danger: {
      background: 'linear-gradient(45deg, #EF4444 0%, #F87171 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '0.625rem',
      fontWeight: '500',
      padding: '0.625rem 1.25rem',
      transition: '0.2s ease-in-out',
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  
  // Cards
  cards: {
    // Default card
    default: {
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      border: '1px solid var(--border)',
      borderRadius: '0.625rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      transition: '0.2s ease-in-out',
    },
    
    // Accent card (with colored left border)
    accent: {
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      border: '1px solid var(--border)',
      borderLeft: '4px solid var(--primary)',
      borderRadius: '0.625rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      transition: '0.2s ease-in-out',
    },
    
    // Interactive card (with hover effect)
    interactive: {
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      border: '1px solid var(--border)',
      borderRadius: '0.625rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      transition: '0.2s ease-in-out',
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        borderColor: 'var(--primary)',
      }
    }
  },
  
  // Inputs
  inputs: {
    default: {
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      border: '1px solid var(--border)',
      borderRadius: '0.625rem',
      padding: '0.5rem 0.75rem',
      transition: '0.2s ease-in-out',
      focus: {
        borderColor: 'var(--primary)',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
      },
      error: {
        borderColor: 'var(--destructive)',
        boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
      }
    }
  },
  
  // Animation styles
  animation: {
    fadeIn: {
      animation: 'fadeIn 0.3s ease-in-out',
    },
    slideInTop: {
      animation: 'slideInFromTop 0.3s ease-in-out',
    },
    slideInBottom: {
      animation: 'slideInFromBottom 0.3s ease-in-out',
    },
    slideInRight: {
      animation: 'slideInFromRight 0.3s ease-in-out',
    },
    pulse: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
  },
} as const; 