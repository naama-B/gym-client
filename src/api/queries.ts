import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  bookingsApi,
  classTypesApi,
  instructorsApi,
  sessionsApi,
} from './endpoints'
import type {
  ClassSessionQuery,
  ClassTypeInput,
  CreateClassSessionRequest,
  CreateClassRatingRequest,
  CreateInstructorRequest,
} from './types'

export const qk = {
  sessions: (q: ClassSessionQuery) => ['sessions', q] as const,
  reviews: ['reviews'] as const,
  session: (id: number) => ['session', id] as const,
  waitlist: (id: number) => ['waitlist', id] as const,
  ratings: (id: number) => ['ratings', id] as const,
  myBookings: ['bookings', 'mine'] as const,
  classTypes: ['classTypes'] as const,
  instructors: ['instructors'] as const,
}

/* ---------------- Sessions ---------------- */

export function useSessions(query: ClassSessionQuery) {
  return useQuery({
    queryKey: qk.sessions(query),
    queryFn: ({ signal }) => sessionsApi.list(query, signal),
    placeholderData: keepPreviousData,
  })
}

export function useReviewedSessions() {
  return useQuery({
    queryKey: qk.reviews,
    queryFn: ({ signal }) => sessionsApi.reviews(signal),
  })
}

export function useSession(id: number) {
  return useQuery({
    queryKey: qk.session(id),
    queryFn: ({ signal }) => sessionsApi.get(id, signal),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useWaitlist(id: number, enabled = true) {
  return useQuery({
    queryKey: qk.waitlist(id),
    queryFn: ({ signal }) => sessionsApi.waitlist(id, signal),
    enabled: enabled && Number.isFinite(id) && id > 0,
  })
}

export function useRatings(id: number) {
  return useQuery({
    queryKey: qk.ratings(id),
    queryFn: ({ signal }) => sessionsApi.ratings(id, signal),
    enabled: Number.isFinite(id) && id > 0,
  })
}

/* ---------------- Bookings ---------------- */

export function useMyBookings() {
  return useQuery({
    queryKey: qk.myBookings,
    queryFn: ({ signal }) => bookingsApi.mine(signal),
  })
}

function invalidateBookingWorld(qc: ReturnType<typeof useQueryClient>, sessionId?: number) {
  qc.invalidateQueries({ queryKey: ['sessions'] })
  qc.invalidateQueries({ queryKey: qk.myBookings })
  if (sessionId) {
    qc.invalidateQueries({ queryKey: qk.session(sessionId) })
    qc.invalidateQueries({ queryKey: qk.waitlist(sessionId) })
  }
}

export function useBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (classSessionId: number) => bookingsApi.book(classSessionId),
    onSuccess: (booking) => invalidateBookingWorld(qc, booking.classSessionId),
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { bookingId: number; sessionId?: number }) =>
      bookingsApi.cancel(vars.bookingId),
    onSuccess: (_data, vars) => invalidateBookingWorld(qc, vars.sessionId),
  })
}

/* ---------------- Ratings ---------------- */

export function useRate(sessionId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClassRatingRequest) => sessionsApi.rate(sessionId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.ratings(sessionId) })
      qc.invalidateQueries({ queryKey: qk.session(sessionId) })
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: qk.reviews })
    },
  })
}

/* ---------------- Admin: sessions ---------------- */

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateClassSessionRequest) => sessionsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export function useCancelSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => sessionsApi.cancel(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: qk.session(id) })
    },
  })
}

/* ---------------- Admin: class types ---------------- */

export function useClassTypes() {
  return useQuery({
    queryKey: qk.classTypes,
    queryFn: ({ signal }) => classTypesApi.list(signal),
  })
}

export function useCreateClassType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ClassTypeInput) => classTypesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.classTypes }),
  })
}

export function useUpdateClassType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; body: ClassTypeInput }) =>
      classTypesApi.update(vars.id, vars.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.classTypes }),
  })
}

export function useDeleteClassType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => classTypesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.classTypes }),
  })
}

/* ---------------- Admin: instructors ---------------- */

export function useInstructors() {
  return useQuery({
    queryKey: qk.instructors,
    queryFn: ({ signal }) => instructorsApi.list(signal),
  })
}

export function useCreateInstructor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateInstructorRequest) => instructorsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.instructors }),
  })
}
