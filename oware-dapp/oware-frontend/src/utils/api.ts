// api.ts
import { QUERY_URL } from '../constants';

import axios from 'axios';  
import { GraphQLResponse } from './types';

export const fetchGraphQLData = async <T>(query: string) => {
  const response = await 
  axios.post<GraphQLResponse<T>>(QUERY_URL, {
    query,
  });
  return response.data.data;
};