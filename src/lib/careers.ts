export function getDeadlineDate(applicationDeadline?: string | null) {
  if (!applicationDeadline) return null;

  const deadline = new Date(applicationDeadline);
  if (Number.isNaN(deadline.getTime())) return null;

  deadline.setHours(23, 59, 59, 999);
  return deadline;
}

export function isDeadlineExpired(applicationDeadline?: string | null, now = new Date()) {
  const deadline = getDeadlineDate(applicationDeadline);
  if (!deadline) return false;
  return now.getTime() > deadline.getTime();
}

export function getApplicationAvailabilityLabel(applicationDeadline?: string | null) {
  const deadline = getDeadlineDate(applicationDeadline);
  if (!deadline) return 'Open until filled';

  return isDeadlineExpired(applicationDeadline)
    ? `Closed on ${deadline.toLocaleDateString()}`
    : `Apply by ${deadline.toLocaleDateString()}`;
}
