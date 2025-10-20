import mongoose, { Schema, Document, mongo } from "mongoose";

// Message Interface
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

// Message Schema
export const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
