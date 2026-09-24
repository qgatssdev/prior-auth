// Payer prefix is the first 4 letters of the slug: acme-health -> ACME.
export const payerPrefix = (slug: string) => slug.slice(0, 4).toUpperCase();

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// For example ACME-88412.
export const generatePayerReference = (slug: string) =>
  `${payerPrefix(slug)}-${randomInt(10000, 99999)}`;

// YYYY-MM-DD in local time, the format Postgres "date" columns use.
export const toDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
