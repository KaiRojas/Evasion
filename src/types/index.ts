/**
 * Evasion V2 - Core Type Definitions
 */

// Re-export Prisma types
export type {
  User,
  Vehicle,
  VehicleStats,
  Friendship,
  Route,
  RoutePoint,
  RouteRating,
  Event,
  EventParticipant,
  Forum,
  ForumPost,
  ForumComment,
  UserLocation,
  PoliceReport,
  PolicePrediction,
  CarSpotting,
} from '@prisma/client';

// Enums
export {
  FriendshipStatus,
  RoutePointType,
  Difficulty,
  EventStatus,
  ParticipantStatus,
  ReportType,
} from '@prisma/client';

/**
 * API Response Types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Auth Types
 */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface Session {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Location Types
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationUpdate extends Coordinates {
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Real-time Event Types
 */
export interface LiveUserPin {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  location: Coordinates;
  heading?: number;
  speed?: number;
  vehicleId?: string;
  vehicleName?: string;
  lastUpdated: number;
}

export interface PoliceAlert {
  id: string;
  reporterId: string;
  location: Coordinates;
  reportType: string;
  description?: string;
  confirmations: number;
  reportedAt: number;
  expiresAt: number;
}

/**
 * Route Types
 */
export interface RouteCoordinate {
  lng: number;
  lat: number;
  elevation?: number;
}

export interface RoutePreview {
  id: string;
  name: string;
  description: string | null;
  distanceMiles: number;
  difficulty: string;
  avgRating: number;
  driveCount: number;
  creatorUsername: string;
  thumbnailUrl?: string;
}

/**
 * Event Types
 */
export interface EventPreview {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  meetingAddress: string | null;
  participantCount: number;
  maxParticipants: number | null;
  organizerUsername: string;
  coverImage: string | null;
  tags: string[];
}

/**
 * Vehicle Display Types
 */
export interface VehicleCard {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  nickname: string | null;
  primaryPhoto: string | null;
  ownerUsername: string;
}

/**
 * Forum Types
 */
export interface ForumPostPreview {
  id: string;
  title: string;
  authorUsername: string;
  authorAvatar: string | null;
  forumName: string;
  commentCount: number;
  likeCount: number;
  createdAt: string;
  tags: string[];
}
