export interface TogetherTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  totalDays: number;
}

/** Разница между start и now календарными годами/месяцами/днями + часы. */
export function computeTogether(start: Date, now: Date): TogetherTime {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const ms = Math.max(0, now.getTime() - start.getTime());
  const hours = Math.floor(ms / 3_600_000);
  const totalDays = Math.floor(ms / 86_400_000);

  return { years, months, days, hours, totalDays };
}

const pluralRules = new Intl.PluralRules("ru-RU");

const FORMS: Record<string, [string, string, string]> = {
  year: ["год", "года", "лет"],
  month: ["месяц", "месяца", "месяцев"],
  day: ["день", "дня", "дней"],
  hour: ["час", "часа", "часов"],
};

export function plural(n: number, unit: keyof typeof FORMS): string {
  const forms = FORMS[unit];
  const rule = pluralRules.select(n);
  if (rule === "one") return forms[0];
  if (rule === "few") return forms[1];
  return forms[2];
}

/** 12 840 → "12 840" с тонким разделителем тысяч */
export function formatThousands(n: number): string {
  return n.toLocaleString("ru-RU").replace(/ /g, " ");
}
