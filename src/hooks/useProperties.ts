import { useQuery } from '@tanstack/react-query'
import { propertiesApi } from '../services/api'
import type { PropertyFilters } from '../types'

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.getAll(filters),
  })
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getById(id),
    enabled: !!id,
  })
}

export function useFeaturedProperties() {
  return useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => propertiesApi.getFeatured(),
  })
}

export function useRelatedProperties(id: number) {
  return useQuery({
    queryKey: ['properties', 'related', id],
    queryFn: () => propertiesApi.getRelated(id),
    enabled: !!id,
  })
}
