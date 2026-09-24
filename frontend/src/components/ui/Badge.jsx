const VARIANT_MAP = {
  // Status
  Compliant: 'badge-success',
  'Non-Compliant': 'badge-danger',
  'In Progress': 'badge-warning',
  'Not Assessed': 'bg-gray-100 text-gray-600 badge',
  Exempt: 'badge-primary',
  Complete: 'badge-success',
  Open: 'badge-danger',
  Resolved: 'badge-success',
  Waived: 'bg-gray-100 text-gray-500 badge',
  Investigating: 'badge-warning',
  // Priority
  Critical: 'badge-danger',
  High: 'bg-orange-100 text-orange-700 badge',
  Medium: 'badge-warning',
  Low: 'badge-primary',
  // Approval
  Approved: 'badge-success',
  Pending: 'badge-warning',
  'Under Review': 'badge-primary',
  Rejected: 'badge-danger',
  // Sensitivity
  'Low': 'badge-success',
  'High': 'bg-orange-100 text-orange-700 badge',
  'Critical': 'badge-danger',
  // Risk
  Unacceptable: 'badge-danger',
  Minimal: 'badge-success',
  Limited: 'badge-warning',
};

export default function Badge({ label, variant }) {
  const cls = variant ? VARIANT_MAP[variant] || 'badge-primary' : VARIANT_MAP[label] || 'badge-primary';
  return <span className={cls || 'badge badge-primary'}>{label}</span>;
}
