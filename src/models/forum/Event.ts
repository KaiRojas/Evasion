import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventAttendee {
  user: mongoose.Types.ObjectId;
  status: 'going' | 'maybe' | 'not-going';
  vehicle?: mongoose.Types.ObjectId;
  joinedAt: Date;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: 'meet' | 'cruise' | 'race' | 'show' | 'track-day' | 'other';
  startDate: Date;
  endDate?: Date;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  host: mongoose.Types.ObjectId;
  coHosts: mongoose.Types.ObjectId[];
  attendees: IEventAttendee[];
  maxAttendees?: number;
  isPrivate: boolean;
  requiresApproval: boolean;
  vehicleRequirements?: {
    minYear?: number;
    maxYear?: number;
    types?: string[];
    restrictions?: string;
  };
  tags: string[];
  coverImage?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EventAttendeeSchema = new Schema<IEventAttendee>({
  user: { type: Schema.Types.ObjectId, ref: 'ForumUser', required: true },
  status: {
    type: String,
    enum: ['going', 'maybe', 'not-going'],
    default: 'going'
  },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  joinedAt: { type: Date, default: Date.now },
});

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 2000 },
    eventType: {
      type: String,
      enum: ['meet', 'cruise', 'race', 'show', 'track-day', 'other'],
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    host: { type: Schema.Types.ObjectId, ref: 'ForumUser', required: true },
    coHosts: [{ type: Schema.Types.ObjectId, ref: 'ForumUser' }],
    attendees: [EventAttendeeSchema],
    maxAttendees: { type: Number },
    isPrivate: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: false },
    vehicleRequirements: {
      minYear: { type: Number },
      maxYear: { type: Number },
      types: [{ type: String }],
      restrictions: { type: String },
    },
    tags: [{ type: String }],
    coverImage: { type: String },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EventSchema.index({ startDate: 1, status: 1 });
EventSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ host: 1 });

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
