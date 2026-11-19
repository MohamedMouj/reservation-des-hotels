export default function messageErreur(error, fallback) {
  const message = error?.response?.data?.message;
  if (typeof message === 'string') return message;

  const validationErrors = error?.response?.data?.errors;
  if (validationErrors && typeof validationErrors === 'object') {
    const firstError = Object.values(validationErrors)
      .flat()
      .find((value) => typeof value === 'string');
    if (firstError) return firstError;
  }

  return error instanceof Error ? error.message : fallback;
}
