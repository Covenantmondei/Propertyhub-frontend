export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getUrlParameter(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  if (typeof window === 'undefined') return;

  // Use the global showToast if available (alerts.js system)
  if ((window as any).showToast) {
    (window as any).showToast(message, type);
    return;
  }

  const colors = {
    success: 'rgb(34, 197, 94)',
    error: 'rgb(239, 68, 68)',
    info: 'rgb(59, 130, 246)',
    warning: 'rgb(245, 158, 11)',
  };

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 1.5rem; right: 1.5rem;
    padding: 1rem 1.5rem;
    background-color: ${colors[type] || colors.info};
    color: white; border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    z-index: 9999; max-width: 400px; font-size: 0.875rem;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}
