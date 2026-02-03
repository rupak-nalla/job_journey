// Color Palette Configuration
export const colors = {
  primaryDark: '#03045e',
  primary: '#0077b6',
  primaryLight: '#00b4d8',
  accent: '#90e0ef',
  accentLight: '#caf0f8',
  
  // Semantic colors based on palette
  success: '#00b4d8',
  warning: '#90e0ef',
  error: '#dc2626',
  info: '#0077b6',
  
  // Status colors
  status: {
    applied: '#0077b6',
    ghosted: '#6b7280',
    interviewing: '#f59e0b',
    assessment: '#8b5cf6',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)',
    light: 'linear-gradient(135deg, #00b4d8 0%, #90e0ef 50%, #caf0f8 100%)',
    background: 'linear-gradient(to bottom right, #caf0f8 0%, #90e0ef 50%, #e0f2fe 100%)',
  },
};

export const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'applied':
      return colors.status.applied;
    case 'ghosted':
      return colors.status.ghosted;
    case 'interviewing':
      return colors.status.interviewing;
    case 'assessment':
      return colors.status.assessment;
    default:
      return colors.primary;
  }
};

export const getStatusBgColor = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'applied':
      return 'bg-[#0077b6]';
    case 'ghosted':
      return 'bg-[#6b7280]';
    case 'interviewing':
      return 'bg-[#f59e0b]';
    case 'assessment':
      return 'bg-[#8b5cf6]';
    default:
      return 'bg-[#0077b6]';
  }
};

export const getStatusTextColor = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'applied':
      return 'text-[#0077b6]';
    case 'ghosted':
      return 'text-[#6b7280]';
    case 'interviewing':
      return 'text-[#f59e0b]';
    case 'assessment':
      return 'text-[#8b5cf6]';
    default:
      return 'text-[#0077b6]';
  }
};

export const getStatusBadgeClass = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'applied':
      return 'px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700';
    case 'ghosted':
      return 'px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700';
    case 'interviewing':
      return 'px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700';
    case 'assessment':
      return 'px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700';
    default:
      return 'px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700';
  }
};
