export const fmt = (n) => Number(n || 0).toLocaleString('fr-FR') + ' F';

export const fmtCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'K';
  return v.toLocaleString('fr-FR');
};

export const pct = (n, total) => total ? ((n / total) * 100).toFixed(1) : '0';

export const getMonthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const today = () => new Date().toISOString().slice(0, 10);

export const parseMonthKey = (key) => {
  const [y, m] = key.split('-');
  return { year: parseInt(y), month: parseInt(m) };
};

export const getLastNMonths = (n) => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(getMonthKey(d));
  }
  return months;
};
