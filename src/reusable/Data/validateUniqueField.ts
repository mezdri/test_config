import { boolean } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

type UniqueFieldValidation = boolean;

type UniqueFieldHttpResponseBody = boolean;

export type UniqueFieldValidator = (
  value: string
) => AxiosPromise<UniqueFieldHttpResponseBody>;

const makeHttpRequest = (
  validate: UniqueFieldValidator,
  value: string
): AxiosPromise<UniqueFieldHttpResponseBody> => {
  return validate(value);
};

const getResponseData = (
  axiosResponse: AxiosResponse<UniqueFieldHttpResponseBody>
): UniqueFieldHttpResponseBody => {
  try {
    return axiosResponse.data;
  } catch {
    return;
  }
};

const schema = boolean();

const getMaybeValidRecepcion = (
  isValid: UniqueFieldHttpResponseBody
): Promise<UniqueFieldValidation> => {
  return schema
    .isValid(isValid, {
      strict: false,
      stripUnknown: true,
    })
    .then(isSchemaValid => (isSchemaValid ? isValid : null));
};

export const validateUniqueField = (
  validate: UniqueFieldValidator,
  value: string
) =>
  makeHttpRequest(validate, value)
    .then(getResponseData)
    .then(getMaybeValidRecepcion);
