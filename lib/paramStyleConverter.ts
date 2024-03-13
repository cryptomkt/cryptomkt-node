export const fromCamelCaseToSnakeCase = (obj: any): any => {
  if (isNull(obj)) {
    return obj
  }
  if (isArray(obj)) {
    return (obj as any[]).map(val => fromCamelCaseToSnakeCase(val));
  }
  if (isObject(obj)) {
    return convertObjectKeysToSnakeCase(obj)
  }
  return obj;
}

const convertObjectKeysToSnakeCase = (obj: { [x: string]: any }): { [x: string]: any } => {
  const entries = Object.entries(obj).map(([key, value]) => {
    return [camelCaseToSnakeCase(key), fromCamelCaseToSnakeCase(value)]
  });
  return Object.fromEntries(entries);
}

export const fromSnakeCaseToCamelCase = (obj: any): any => {
  if (isNull(obj)) {
    return obj
  }
  if (isArray(obj)) {
    return (obj as any[]).map(val => fromSnakeCaseToCamelCase(val));
  }
  if (isObject(obj)) {
    return convertObjectKeysToCamelCase(obj)
  }
  return obj;
}

const convertObjectKeysToCamelCase = (obj: { [x: string]: any }): { [x: string]: any } => {
  const entries = Object.entries(obj).map(([key, value]) => {
    return [snakeCaseToCamelCase(key), fromSnakeCaseToCamelCase(value)]
  });
  return Object.fromEntries(entries);
}


const camelCaseToSnakeCase = (camelCase: string) => camelCase
  .replace(/([A-Z])/g, letter => `_${letter.toLowerCase()}`)


const snakeCaseToCamelCase = (value: string) => value
  .replace(/([_][a-z])/g, _letter => _letter.replace('_', '').toUpperCase());

const isObject = (value: any) => {
  return typeof (value) == "object";
}

const isArray = (value: any) => {
  return Array.isArray(value)
}


function isNull(obj: any) {
  return obj === undefined || obj === null
}

