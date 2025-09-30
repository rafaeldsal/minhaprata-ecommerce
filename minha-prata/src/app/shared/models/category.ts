// shared/models/category.ts - CRIE ESTE ARQUIVO
export enum CategorySlug {
  ALL = 'all',
  ANEIS = 'aneis',
  BRINCOS = 'brincos',
  BRACELETES = 'braceletes',
  COLARES = 'colares'
}

export interface Category {
  name: string;
  slug: CategorySlug;
  icon: string;
}