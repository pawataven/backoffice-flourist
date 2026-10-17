import type { EntityConfig } from '../types'
import orders from './orders'
import menu from './menu'
import categories from './categories'
import promotions from './promotions'
import members from './members'
import reviews from './reviews'
import branches from './branches'
import staff from './staff'
import stock from './stock'

/**
 * Every entity the Back Office manages, in sidebar order: sales, menu, customers, then the
 * shops themselves. Add one here to get its pages.
 */
export const entities = [
  orders,
  menu,
  categories,
  promotions,
  members,
  reviews,
  branches,
  staff,
  stock,
] as unknown as EntityConfig[]

export function findEntity(key: string): EntityConfig | undefined {
  return entities.find((e) => e.key === key)
}
