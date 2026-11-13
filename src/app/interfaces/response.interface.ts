export interface ResponseInteface<T> {
  status: boolean;
  code: number;
  errors: string[] | Record<string, string[]>;
  data: T;
  message: string | null;
  identifier: string;
  last_activity: string | null;
}

export interface ErrorResponseInterface {
  status: boolean;
  code: number;
  errors: string[];
  data: never[];
  message: string | null;
  identifier: string;
  last_activity: string | null;
}

export interface ResponsePaginado<T> {
  status: boolean;
  code: number;
  errors: string[];
  data: Paginado<T>;
  message: string | null;
  identifier: string;
  last_activity: string | null;
}

export interface Paginado<T>{
  current_page:number;
  data:Array<T>;
  first_page_url:string;
  from:number;
  last_page:number;
  last_page_url:string;
  links:Array<Links>;
  next_page_url:string;
  path:string|null;
  per_page:number;
  prev_page_url:string|null;
  to:number;
  total:number;
}

export interface Links{
  url:null|string;
  label:string;
  active:boolean;
}
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}
