import moment from 'moment';

export type BooleanAsNumber = 0 | 1;

export const makeNullableMoment = (...args: any): moment.Moment | null => {
  // Usualmente tipo "string". Ver: https://momentjs.com/docs/#/parsing/
  const firstArg = args[0];
  return firstArg === null ? firstArg : moment(...args);
};

export const makeNullableDuration = (...args: any): moment.Duration | null => {
  // Usualmente tipo "string".
  // Ver: https://momentjs.com/docs/#/durations/creating/
  const firstArg = args[0];
  return firstArg === null ? firstArg : moment.duration(...args);
};
