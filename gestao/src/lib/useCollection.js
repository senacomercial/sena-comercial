import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import { useAuth } from '../auth/AuthProvider'

// Hook genérico de CRUD para qualquer tabela isolada por organização.
// Uso: const { rows, create, update, remove, isLoading } = useCollection('transactions', { order: 'date' })
export function useCollection(table, { order = 'created_at', ascending = false, select = '*' } = {}) {
  const { org, user } = useAuth()
  const qc = useQueryClient()
  const orgId = org?.id
  const key = [table, orgId]

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(orgId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq('org_id', orgId)
        .order(order, { ascending })
      if (error) throw error
      return data ?? []
    },
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: key })

  const create = useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from(table)
        .insert({ ...payload, org_id: orgId, owner_id: user?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, ...patch }) => {
      const { data, error } = await supabase
        .from(table)
        .update(patch)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id).eq('org_id', orgId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return {
    rows: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    remove,
    invalidate,
  }
}
