import { http } from './client'
import type {
  AuthResponse,
  BookingResponse,
  ClassRatingResponse,
  ClassSessionQuery,
  ClassSessionResponse,
  ClassTypeInput,
  ClassTypeResponse,
  CreateClassRatingRequest,
  CreateClassSessionRequest,
  CreateInstructorRequest,
  InstructorResponse,
  LoginRequest,
  PagedResult,
  RegisterRequest,
  ReviewedSessionResponse,
  SessionRatingsResponse,
  SessionWaitlistResponse,
} from './types'

// --- Auth ---
export const authApi = {
  register: (body: RegisterRequest) =>
    http.post<AuthResponse>('/auth/register', body, { anonymous: true }),
  login: (body: LoginRequest) => http.post<AuthResponse>('/auth/login', body, { anonymous: true }),
}

// --- Class sessions ---
function toQueryString(query: ClassSessionQuery): string {
  const params = new URLSearchParams()
  if (query.page != null) params.set('page', String(query.page))
  if (query.pageSize != null) params.set('pageSize', String(query.pageSize))
  if (query.search) params.set('search', query.search)
  if (query.fromUtc) params.set('fromUtc', query.fromUtc)
  if (query.onlyAvailable != null) params.set('onlyAvailable', String(query.onlyAvailable))
  if (query.sortBy) params.set('sortBy', query.sortBy)
  if (query.sortDescending != null) params.set('sortDescending', String(query.sortDescending))
  const s = params.toString()
  return s ? `?${s}` : ''
}

export const sessionsApi = {
  list: (query: ClassSessionQuery, signal?: AbortSignal) =>
    http.get<PagedResult<ClassSessionResponse>>(`/classsessions${toQueryString(query)}`, signal),
  reviews: (signal?: AbortSignal) =>
    http.get<ReviewedSessionResponse[]>('/classsessions/reviews', signal),
  get: (id: number, signal?: AbortSignal) =>
    http.get<ClassSessionResponse>(`/classsessions/${id}`, signal),
  create: (body: CreateClassSessionRequest) =>
    http.post<ClassSessionResponse>('/classsessions', body),
  cancel: (id: number) => http.post<void>(`/classsessions/${id}/cancel`),
  waitlist: (id: number, signal?: AbortSignal) =>
    http.get<SessionWaitlistResponse>(`/classsessions/${id}/waitlist`, signal),
  ratings: (id: number, signal?: AbortSignal) =>
    http.get<SessionRatingsResponse>(`/classsessions/${id}/ratings`, signal),
  rate: (id: number, body: CreateClassRatingRequest) =>
    http.post<ClassRatingResponse>(`/classsessions/${id}/ratings`, body),
}

// --- Bookings ---
export const bookingsApi = {
  mine: (signal?: AbortSignal) => http.get<BookingResponse[]>('/bookings/mine', signal),
  book: (classSessionId: number) => http.post<BookingResponse>('/bookings', { classSessionId }),
  cancel: (id: number) => http.post<void>(`/bookings/${id}/cancel`),
}

// --- Class types ---
export const classTypesApi = {
  list: (signal?: AbortSignal) => http.get<ClassTypeResponse[]>('/classtypes', signal),
  create: (body: ClassTypeInput) => http.post<ClassTypeResponse>('/classtypes', body),
  update: (id: number, body: ClassTypeInput) =>
    http.put<ClassTypeResponse>(`/classtypes/${id}`, body),
  remove: (id: number) => http.del<void>(`/classtypes/${id}`),
}

// --- Instructors ---
export const instructorsApi = {
  list: (signal?: AbortSignal) => http.get<InstructorResponse[]>('/instructors', signal),
  create: (body: CreateInstructorRequest) => http.post<InstructorResponse>('/instructors', body),
}
