// TypeScript mirrors of the Gym API DTOs (Gym.Core/DTOs/*).
// ASP.NET Core serializes with camelCase property names and enums as strings.

export type UserRole = 'Member' | 'Admin'
export type ClassSessionStatus = 'Scheduled' | 'Cancelled'
export type BookingStatusValue = 'Confirmed' | 'CancelledByMember' | 'Waitlisted'

// --- Auth ---

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  expiresAtUtc: string
  memberId: number
  fullName: string
  email: string
  role: UserRole
}

// --- Class types ---

export interface ClassTypeResponse {
  id: number
  name: string
  description: string | null
  durationMinutes: number
  defaultCapacity: number
  tags: string[]
}

export interface ClassTypeInput {
  name: string
  description?: string | null
  durationMinutes: number
  defaultCapacity: number
  tags: string[]
}

// --- Instructors ---

export interface InstructorResponse {
  id: number
  fullName: string
  bio: string | null
}

export interface CreateInstructorRequest {
  fullName: string
  bio?: string | null
}

// --- Class sessions ---

export interface ClassSessionResponse {
  id: number
  classTypeId: number
  classTypeName: string
  instructorName: string
  startsAtUtc: string
  durationMinutes: number
  capacity: number
  bookedCount: number
  availableSpots: number
  status: ClassSessionStatus
  ratingCount: number
  averageStars: number | null
}

export interface CreateClassSessionRequest {
  classTypeId: number
  instructorId: number
  startsAtUtc: string
  capacity?: number | null
}

export type SessionSort = 'startsAt' | 'available'

export interface ClassSessionQuery {
  page?: number
  pageSize?: number
  search?: string
  fromUtc?: string
  onlyAvailable?: boolean
  sortBy?: SessionSort
  sortDescending?: boolean
}

// --- Bookings ---

export interface CreateBookingRequest {
  classSessionId: number
}

export interface BookingResponse {
  id: number
  classSessionId: number
  classTypeName: string
  startsAtUtc: string
  memberId: number
  memberName: string
  status: BookingStatusValue
  waitlistPosition: number | null
  createdAtUtc: string
}

// --- Waitlist ---

export interface WaitlistEntryResponse {
  position: number
  memberId: number
  memberName: string
  createdAtUtc: string
}

export interface SessionWaitlistResponse {
  classSessionId: number
  classTypeName: string
  startsAtUtc: string
  count: number
  entries: WaitlistEntryResponse[]
}

// --- Ratings ---

export interface CreateClassRatingRequest {
  stars: number
  comment?: string | null
}

export interface ClassRatingResponse {
  id: number
  classSessionId: number
  memberId: number
  memberName: string
  stars: number
  comment: string | null
  createdAtUtc: string
  updatedAtUtc: string | null
}

export interface SessionRatingsResponse {
  classSessionId: number
  classTypeName: string
  ratingCount: number
  averageStars: number | null
  ratings: ClassRatingResponse[]
}

// --- Common ---

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/** The uniform error body every failing endpoint returns (Gym.API/Contracts/ApiError). */
export interface ApiErrorBody {
  status: number
  title: string
  detail?: string | null
  correlationId?: string | null
  /** ASP.NET model-validation responses use this shape instead. */
  errors?: Record<string, string[]>
}
