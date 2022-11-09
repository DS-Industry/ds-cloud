export const dateToDefaultTimeZone = (
  date: number,
  timeZone = 'Europe/Moscow',
): Date => {
  return new Date(
    new Date(date).toLocaleString('en-US', {
      timeZone,
    }),
  );
};
