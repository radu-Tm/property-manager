export const formatNumber = (number) => {
  if (number === null || number === undefined) return '';
  return typeof number === 'number' ? number.toFixed(2) : number;
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  return `${Number(amount).toFixed(2)} RON`;
};