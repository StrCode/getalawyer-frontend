// Page SEO Configuration for GetALawyer Application

export const PAGE_SEO_CONFIG = {
  home: {
    title: 'Find Your Perfect Lawyer',
    description: 'Connect with qualified lawyers across the country. Search by specialization, location, and experience to find the right legal representation for your needs.',
    keywords: 'find lawyer, legal services, attorney search, qualified lawyers, legal representation',
  },
  login: {
    title: 'Login',
    description: 'Sign in to your GetALawyer account to connect with lawyers, manage your profile, and access legal services.',
  },
  register: {
    title: 'Create Account',
    description: 'Join GetALawyer to find qualified lawyers or offer your legal services. Create your free account in minutes.',
  },
  forgotPassword: {
    title: 'Reset Password',
    description: 'Forgot your password? Enter your email to receive a password reset link for your GetALawyer account.',
  },
  verifyOtp: {
    title: 'Verify Account',
    description: 'Enter the verification code sent to your email to complete your GetALawyer account setup.',
  },
  newPassword: {
    title: 'Set New Password',
    description: 'Create a new secure password for your GetALawyer account.',
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Manage your GetALawyer account, view your connections, and access legal services.',
  },
  plans: {
    title: 'Subscription Plans',
    description: 'Choose the right subscription plan for your needs. Compare features and pricing for GetALawyer premium services.',
  },
  dashboardSearch: {
    title: 'Find a Lawyer',
    description: 'Search and connect with qualified lawyers. Browse by specialization, experience, and location.',
  },
  settings: {
    title: 'Settings',
    description: 'Manage your account settings, preferences, and profile information.',
  },
  subscriptionSuccess: {
    title: 'Subscription Confirmed',
    description: 'Your subscription has been successfully activated. Welcome to GetALawyer premium services.',
  },
  onboarding: {
    clientLocation: {
      step: 'Location',
      description: 'Set your location to find lawyers in your area.',
    },
    clientSpecializations: {
      step: 'Legal Needs',
      description: 'Select the legal specializations you need help with.',
    },
    lawyerBasics: {
      step: 'Basic Information',
      description: 'Provide your basic professional information to create your lawyer profile.',
    },
    lawyerCredentials: {
      step: 'Credentials',
      description: 'Add your bar license and professional credentials.',
    },
    lawyerSpecializations: {
      step: 'Specializations',
      description: 'Select your areas of legal expertise and specialization.',
    },
    lawyerReview: {
      step: 'Review Profile',
      description: 'Review your profile information before submission.',
    },
    lawyerStatus: {
      step: 'Application Status',
      description: 'Check the status of your lawyer application.',
    },
  },
} as const;
