import { CompareOperator, PagingFilter, vPagingFilter } from '../interface';
import * as _ from 'lodash';

export const queryGenerator = <T extends Record<string | keyof PagingFilter, any>>(
    tableName: string,
    input: T,
    comparator: Record<keyof Omit<T, keyof PagingFilter>, CompareOperator>,
    translator?: Record<keyof Omit<T, keyof PagingFilter>, string>,
) => {
    input = Object.keys(input).reduce((acc, key) => {
        if (
            input[key] !== undefined &&
            input[key] !== null &&
            input[key] !== '' &&
            !Object.keys(vPagingFilter).includes(key)
        ) {
            const newKey = _.get(translator, `${key}`, key);
            acc[newKey as keyof T] = input[key];
        }
        return acc;
    }, {} as T);

    const query = Object.entries(input).map(([key, value]) => {
        const operator = comparator[key] || CompareOperator.LIKE;
        if (Array.isArray(value)) {
            return `${tableName}.${key} ${operator} (:...${key})`;
        }

        return `${tableName}.${key} ${operator} (:${key})`;
    });
    return query.join(' AND ');
};
