# Full Stack Next.js with AI Integration - Complete Documentation

### Project Details

- **Project Name**: trueFeed
- **Tech Stack**: Next.js, MongoDB, Mongoose, TypeScript, Tailwind CSS, shadcn/ui
- **Features**: Anonymous messaging, AI-powered message suggestions, OTP verification, Custom authentication

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Database Modeling](#database-modeling)
3. [Schema Validation with Zod](#schema-validation-with-zod)
4. [Database Connection](#database-connection)
5. [Authentication Setup](#authentication-setup)
6. [API Routes](#api-routes)
7. [AI Integration](#ai-integration)
8. [Frontend Components](#frontend-components)

---

## 1. Project Setup

### Creating a New Next.js Project

```bash
npx create-next-app@latest
```

### Configuration Options

When prompted during installation:

- **Project name**: `mystery-message` (or your preferred name)
- **TypeScript**: Yes ✅
- **ESLint**: Yes ✅
- **Tailwind CSS**: Yes ✅
- **src/ directory**: Yes ✅
- **App Router**: Yes ✅ (NOT Pages Router)
- **Customize default import alias**: No

### Important Notes

- We are using **TypeScript** throughout this project
- We are using the **App Router** (not Pages Router)
- The `src/` directory helps keep everything organized

### Running the Project

```bash
npm run dev
```

The application will start on `http://localhost:3000`

---

## 2. Database Modeling

### Why Model-First Approach?

Professor's explanation: Before building any application, the most important step is to design your database models. You need to know what data you're storing, how it's structured, and how different entities relate to each other.

### Directory Structure

Create the following folder structure in your `src/` directory:

```
src/
├── models/
│   └── User.ts
├── schemas/
│   ├── signUpSchema.ts
│   ├── verifySchema.ts
│   ├── signInSchema.ts
│   ├── acceptMessageSchema.ts
│   └── messageSchema.ts
└── lib/
    └── dbConnect.ts
```

### Installing Dependencies

```bash
npm install mongoose
npm install zod
```

---

## 3. Schema Validation with Zod

### What is Zod?

Zod is a TypeScript-first schema validation library. It helps validate data before it reaches your database.

**Professor's explanation**: "Mongoose provides database-level validation, but Zod provides validation at the application level. For example, when a user signs up, we want to check if the username is valid, if the email format is correct, etc., before even touching the database."

### Why Use Zod?

1. **Early validation** - Catch errors before database operations
2. **Type safety** - Works seamlessly with TypeScript
3. **Better error messages** - Provides customizable validation messages
4. **Chainable validations** - Easy to add multiple validation rules

### Username Validation Example

**File**: `src/schemas/signUpSchema.ts`

```typescript
import { z } from "zod";

// Username validation
export const usernameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");
```

**Professor's explanation of the code**:

- `z.string()` - First check that it's a string
- `.min(2, "message")` - Minimum length with custom error message
- `.max(20, "message")` - Maximum length with custom error message
- `.regex()` - Pattern matching to disallow special characters

### Sign Up Schema

```typescript
export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
```

### Verify Schema

**File**: `src/schemas/verifySchema.ts`

```typescript
import { z } from "zod";

export const verifySchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});
```

### Sign In Schema

**File**: `src/schemas/signInSchema.ts`

```typescript
import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string(), // Can be username or email
  password: z.string(),
});
```

### Accept Message Schema

**File**: `src/schemas/acceptMessageSchema.ts`

```typescript
import { z } from "zod";

export const acceptMessageSchema = z.object({
  acceptMessages: z.boolean(),
});
```

### Message Schema

**File**: `src/schemas/messageSchema.ts`

```typescript
import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(300, "Content must be no longer than 300 characters"),
});
```

### How to Find Regex Patterns

**Professor's recommendation**:

1. Use ChatGPT to generate regex patterns
2. Use **regex101.com** - A community site with many pre-made patterns
3. Search for "email validation regex" or "username validation regex"

**Important**: "Don't waste time learning regex deeply unless needed. Use existing patterns from the community or generate them using AI."

---

## 4. Database Models with Mongoose

### Understanding TypeScript + Mongoose

**Professor's key explanation**: "When using TypeScript with Mongoose, we need to define two things:

1. **Interface** - TypeScript type definition
2. **Schema** - Mongoose database structure

The interface is for TypeScript type safety, and the schema is for MongoDB structure."

### Message Model

**File**: `src/models/User.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

// Message Interface
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

// Message Schema
const MessageSchema: Schema<Message> = new Schema({
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
```

**Professor's explanation**:

- `extends Document` - This makes it a Mongoose document
- `Schema<Message>` - TypeScript generic to ensure type safety
- `type: String` - Note: Mongoose uses capital S in String
- `type: string` - TypeScript(interface) uses lowercase s in string (don't confuse!)

### User Model

```typescript
// User Interface
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
}

// User Schema
const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});
```

**Professor's detailed explanation**:

- `required: [true, "message"]` - Array format allows custom error message
- `trim: true` - Removes whitespace from username
- `unique: true` - Ensures no duplicate usernames or emails
- `match: [regex, "message"]` - Email validation with regex
- `messages: [MessageSchema]` - Array of Message documents embedded in User

### Exporting the Model (Next.js Specific)

**Professor's critical explanation**:

"In Next.js, things are different from a normal Express backend. In Express, your server starts once and keeps running. In Next.js, functions run on-demand (edge runtime). This means:

- Your code might run multiple times
- Database connection might already exist
- You need to check if the model already exists before creating it"

```typescript
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
```

**Line-by-line explanation**:

1. `mongoose.models.User` - Check if User model already exists
2. `as mongoose.Model<User>` - TypeScript assertion for type safety
3. `||` - OR operator: if model doesn't exist, create it
4. `mongoose.model<User>("User", UserSchema)` - Create new model with TypeScript generic

---

## 5. Database Connection

### Why Next.js Database Connection is Different

**Professor's important explanation**:

"This is THE most important concept for Next.js database work:

**Normal Backend (Express)**:

- Server starts once
- Connects to database once
- Stays connected continuously
- Uses cloud instances to keep running 24/7

**Next.js Backend**:

- Functions run on-demand (edge runtime)
- Not always running
- Database connection is NOT always active
- Connection happens when request comes in

**The Problem**: If you create a new database connection on every request, you'll choke your application with too many connections.

**The Solution**: Always check if a connection already exists. If yes, reuse it. If no, create a new one."

### Database Connection File

**File**: `src/lib/dbConnect.ts`

```typescript
import mongoose from "mongoose";

// Connection object type
type ConnectionObject = {
  isConnected?: number;
};

// Initialize connection object
const connection: ConnectionObject = {};

// Database connection function
async function dbConnect(): Promise<void> {
  // Check if already connected
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    // Attempt database connection
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

    connection.isConnected = db.connections[0].readyState;

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

export default dbConnect;
```

**Professor's code explanation**:

**Connection Object**:

```typescript
type ConnectionObject = {
  isConnected?: number; // Optional property
};
```

- `?` means optional - might or might not exist
- `number` because readyState returns a number

**The Check**:

```typescript
if (connection.isConnected) {
  console.log("Already connected to database");
  return;
}
```

- First thing: check if we already have a connection
- If yes, don't create a new one, just return
- This prevents connection overload

**Making Connection**:

```typescript
const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
connection.isConnected = db.connections[0].readyState;
```

- `await` because database is on different continent (takes time)
- Store the connection state
- `readyState` is a number indicating connection status

### Environment Variables

Create `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
```

**Professor's note**: "Never commit `.env.local` to Git. Add it to `.gitignore`."

---

## 6. Authentication Setup

### Installing Next-Auth

**Professor's introduction**: "Next-Auth is now called Auth.js. It's the industry standard for authentication in Next.js applications. It handles OAuth, credentials, sessions, everything."

```bash
npm install next-auth
```

### Next-Auth Configuration

**File**: `src/app/api/auth/[...nextauth]/route.ts`

**Professor's explanation**: "The `[...nextauth]` folder name is special. The `...` means catch-all route. Next-Auth needs this specific structure to handle all authentication routes like /api/auth/signin, /api/auth/signout, etc."

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Professor's detailed explanation of key parts**:

**CredentialsProvider**:
"This allows username/password login. We could also add Google, GitHub, etc., but we're doing custom authentication."

**authorize function**:
"This is where the magic happens. When someone tries to log in:

1. Connect to database
2. Find user by email or username (`$or` operator)
3. Check if user is verified
4. Compare passwords using bcrypt
5. Return user if everything is correct"

**Callbacks**:
"Callbacks are functions that Next-Auth calls at specific times:

- `jwt` callback: Runs when creating JWT token
- `session` callback: Runs when creating session

We inject our custom data (user ID, username, etc.) into the token and session."

**Session Strategy**:

```typescript
session: {
  strategy: "jwt";
}
```

"We use JWT (JSON Web Tokens) instead of database sessions. JWTs are faster and work better with edge runtime."

### Environment Variables for Auth

Add to `.env.local`:

```env
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

**Professor's tip**: "Generate NEXTAUTH_SECRET using `openssl rand -base64 32` in terminal."

---

## 7. API Routes

### API Route Structure in App Router

**Professor's explanation**: "In the App Router, API routes are defined using `route.ts` files. Each route.ts file exports functions named after HTTP methods: GET, POST, PUT, DELETE, etc."

### Sign Up API Route

**File**: `src/app/api/sign-up/route.ts`

```typescript
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // Check if username already exists and is verified
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      } else {
        // Update existing unverified user
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
```

**Professor's step-by-step explanation**:

**Step 1**: Connect to database

```typescript
await dbConnect();
```

**Step 2**: Extract data from request

```typescript
const { username, email, password } = await request.json();
```

"In App Router, we use `request.json()` to get body data, not `req.body`."

**Step 3**: Check if username exists

```typescript
const existingUserVerifiedByUsername = await UserModel.findOne({
  username,
  isVerified: true,
});
```

"We only care if a VERIFIED user has this username. Unverified users can be overwritten."

**Step 4**: Generate 6-digit verification code

```typescript
const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
```

"This generates a random number between 100000 and 999999."

**Step 5**: Handle existing email
"Two scenarios:

1. Email exists and is verified → Reject (user already registered)
2. Email exists but not verified → Update their password and send new code"

**Step 6**: Hash password

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

"NEVER store plain text passwords! Always hash with bcrypt. The 10 is the salt rounds."

**Step 7**: Set expiry time

```typescript
const expiryDate = new Date();
expiryDate.setHours(expiryDate.getHours() + 1);
```

"Verification code expires in 1 hour."

### Verify Code API Route

**File**: `src/app/api/verify-code/route.ts`

```typescript
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification code has expired. Please sign up again",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying user",
      },
      { status: 500 }
    );
  }
}
```

**Professor's explanation**:

"Verification is simple:

1. Find user by username
2. Check if code matches
3. Check if code hasn't expired
4. If both true, mark user as verified"

**Key check**:

```typescript
const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
```

"Compare expiry date with current date. If expiry is in future, code is still valid."

---

## 8. AI Integration (OpenAI)

### Installing AI SDK

**Professor's introduction**: "We're integrating OpenAI's ChatGPT to generate message suggestions. This is production-level AI integration."

```bash
npm install ai openai
```

### OpenAI API Route

**File**: `src/app/api/suggest-messages/route.ts`

```typescript
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

// Edge runtime for better performance
export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      max_tokens: 400,
      stream: true,
      prompt,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      console.error("An unexpected error occurred:", error);
      throw error;
    }
  }
}
```

**Professor's detailed explanation**:

**Edge Runtime**:

```typescript
export const runtime = "edge";
```

"Edge runtime is crucial for AI integration in Next.js. It prevents timeouts and handles streaming responses better."

**The Prompt**:
"The entire magic is in the prompt. We tell ChatGPT EXACTLY what we want:

- Create 3 questions
- Separate them with ||
- Make them engaging but safe
- Suitable for anonymous messaging

This is called prompt engineering. The better your prompt, the better the results."

**Streaming Response**:

```typescript
stream: true;
```

"Instead of waiting for the complete response, we stream it word-by-word. This gives users immediate feedback."

**Error Handling**:
"OpenAI can fail for many reasons:

- Invalid API key
- Rate limits exceeded
- Network issues
- Model unavailable

We check if error is OpenAI-specific and extract useful information like status, headers, message."

### Environment Variables for OpenAI

Add to `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Professor's note**: "You need to create an account on OpenAI and get an API key. Note: This costs money based on usage."

---

## 9. Email Verification with Resend

### Installing Resend

**Professor's explanation**: "Resend is one of the latest and most popular email services. It's much easier than traditional services and has a great UI."

```bash
npm i resend
npm i react-email
```

### Email Template

**File**: `emails/VerificationEmail.tsx`

```typescript
import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here&apos;s your verification code: {otp}</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            Thank you for registering. Please use the following verification
            code to complete your registration:
          </Text>
        </Row>
        <Row>
          <Text>{otp}</Text>
        </Row>
        <Row>
          <Text>
            If you did not request this code, please ignore this email.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
```

**Professor's explanation**: "This is a React component for email! React-email allows us to build beautiful emails using React components instead of plain HTML."

### Send Email Helper

**File**: `src/helpers/sendVerificationEmail.ts`

```typescript
import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Mystery Message | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (emailError) {
    console.error("Error sending verification email", emailError);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
```

### Resend Configuration

**File**: `src/lib/resend.ts`

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### Environment Variables

Add to `.env.local`:

```env
RESEND_API_KEY=your_resend_api_key_here
```

---

## 10. Frontend Components

### Navbar Component

**Professor's note**: "The navbar shows different options based on whether user is logged in or not."

**File**: `src/components/Navbar.tsx`

```typescript
"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="text-xl font-bold mb-4 md:mb-0">
          Mystery Message
        </a>
        {session ? (
          <>
            <span className="mr-4">
              Welcome, {user?.username || user?.email}
            </span>
            <Button onClick={() => signOut()} className="w-full md:w-auto">
              Logout
            </Button>
          </>
        ) : (
          <Link href="/sign-in">
            <Button className="w-full md:w-auto">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
```

**Professor's code explanation**:

**'use client' directive**:

```typescript
"use client";
```

"This MUST be at the top because we're using `useSession` hook which only works on client side."

**useSession hook**:

```typescript
const { data: session } = useSession();
```

"This hook comes from next-auth/react. It gives us the current session data."

**Type assertion**:

```typescript
const user: User = session?.user as User;
```

"TypeScript doesn't know the exact type of session.user, so we tell it explicitly."

**Conditional rendering**:

```typescript
{session ? (
  // Show logout button
) : (
  // Show login button
)}
```

"If session exists, user is logged in. If not, show login option."

### Layout Integration

**File**: `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mystery Message",
  description: "Anonymous messaging platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={inter.className}>
          <Navbar />
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
}
```

**Professor's explanation**: "The Navbar is placed in the layout so it appears on every page. The AuthProvider wraps everything to provide session context."

---

## 11. Important Concepts Explained

### TypeScript Integration

**Professor's philosophy**: "TypeScript might seem scary at first, but you don't need to know everything. Learn these basics and you'll be fine for 90% of projects."

**Key TypeScript Concepts Used**:

1. **Interfaces**

```typescript
interface Message {
  content: string;
  createdAt: Date;
}
```

"Like a blueprint. Defines what properties an object should have."

2. **Type Assertions**

```typescript
const user = session?.user as User;
```

"Telling TypeScript: 'Trust me, I know this is a User type.'"

3. **Optional Properties**

```typescript
type ConnectionObject = {
  isConnected?: number;
};
```

"The `?` means this property might or might not exist."

4. **Generics**

```typescript
Schema<Message>;
mongoose.Model<User>;
```

"Like variables for types. Tells TypeScript what kind of data to expect."

### Next.js App Router vs Pages Router

**Professor's important distinction**:

**Pages Router** (Old):

- Files in `pages/` directory
- API routes in `pages/api/`
- `getServerSideProps`, `getStaticProps`

**App Router** (New - What we're using):

- Files in `app/` directory
- API routes in `app/api/.../route.ts`
- Server Components by default
- `'use client'` for client components
- Better performance
- Better developer experience

"We're using App Router because it's the future of Next.js. Pages Router is legacy."

### Server vs Client Components

**Professor's explanation**:

**Server Components** (Default):

- Render on server
- Can directly access database
- Cannot use useState, useEffect, onClick
- Better for SEO
- Faster initial load

**Client Components** ('use client'):

- Render on browser
- Can use hooks (useState, useEffect)
- Can use event handlers (onClick)
- Interactive features
- Use when needed

"By default, everything in App Router is a Server Component. Add 'use client' only when you need interactivity or hooks."

### Edge Runtime

**Professor's explanation**: "Edge runtime is special for Next.js. It's:

- Faster than Node.js runtime
- Better for streaming responses (like AI)
- Has some limitations (can't use all Node.js features)
- Perfect for API routes that need to be fast

We use it for the AI route because ChatGPT streaming works better with edge runtime."

---

## 12. Best Practices from the Professor

### 1. Database Modeling First

"Always design your database models before writing any code. If your data structure is wrong, everything else will be wrong."

### 2. Validation at Multiple Levels

"Validate data at multiple stages:

1. Client-side (form validation)
2. Zod schemas (before API)
3. Mongoose schemas (before database)

This is called defense in depth."

### 3. Environment Variables

"NEVER commit secrets to Git:

- API keys
- Database URLs
- Secret keys

Always use environment variables and add `.env.local` to `.gitignore`."

### 4. Error Handling

"Always wrap database operations in try-catch. Always return meaningful error messages. Production apps never crash silently."

### 5. TypeScript Usage

"You don't need to be a TypeScript expert. Learn:

- Basic types (string, number, boolean)
- Interfaces
- Type assertions (as)
- Generics (basic understanding)

That's 90% of what you'll use."

### 6. Don't Reinvent the Wheel

"Use existing libraries:

- Zod for validation
- Next-Auth for authentication
- Resend for emails
- Mongoose for MongoDB
- shadcn/ui for UI components

Don't waste time building what already exists."

### 7. Production-Level Code

"Production code means:

- Proper error handling
- Input validation
- Type safety
- Environment variables
- Security (hashing passwords, etc.)
- Scalability (connection pooling, etc.)"

---

## 13. Project Structure Overview

```
mystery-message/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── sign-up/
│   │   │   │   └── route.ts
│   │   │   ├── verify-code/
│   │   │   │   └── route.ts
│   │   │   ├── suggest-messages/
│   │   │   │   └── route.ts
│   │   │   └── send-message/
│   │   │       └── route.ts
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx
│   │   │   └── sign-up/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── Navbar.tsx
│   ├── context/
│   │   └── AuthProvider.tsx
│   ├── emails/
│   │   └── VerificationEmail.tsx
│   ├── helpers/
│   │   └── sendVerificationEmail.ts
│   ├── lib/
│   │   ├── dbConnect.ts
│   │   └── resend.ts
│   ├── models/
│   │   └── User.ts
│   ├── schemas/
│   │   ├── signUpSchema.ts
│   │   ├── verifySchema.ts
│   │   ├── signInSchema.ts
│   │   ├── acceptMessageSchema.ts
│   │   └── messageSchema.ts
│   └── types/
│       └── ApiResponse.ts
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 14. Common Issues and Solutions

### Issue 1: Mongoose Connection Errors

**Problem**: "Connection to database keeps failing"

**Solution**:

```typescript
// Always check if connection already exists
if (connection.isConnected) {
  return;
}
```

**Professor's advice**: "This is THE most common Next.js + MongoDB issue. Never forget to check existing connections."

### Issue 2: TypeScript Errors with Session

**Problem**: "Property 'username' does not exist on type 'User'"

**Solution**: Create custom types for Next-Auth

```typescript
// next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }

  interface Session {
    user: User;
  }
}
```

### Issue 3: API Routes Not Working

**Problem**: "API route returns 404"

**Solution**:

- Check file is named `route.ts` (not `route.tsx`)
- Check it's inside `app/api/` directory
- Export functions named GET, POST, etc.

### Issue 4: Environment Variables Not Loading

**Problem**: "process.env.VARIABLE_NAME is undefined"

**Solution**:

- Restart development server after adding new variables
- Check file is named `.env.local` exactly
- Variables in `.env.local` don't need NEXT*PUBLIC* prefix for server-side

---

## 15. Testing the Application

### Testing Sign Up Flow

1. **Navigate** to `/sign-up`
2. **Enter** username, email, password
3. **Submit** form
4. **Check** email for verification code
5. **Enter** code on verification page
6. **Should** redirect to sign-in

### Testing AI Integration

1. **Navigate** to public message page
2. **Click** "Suggest Messages" button
3. **Should** see AI-generated messages streaming in
4. **Click** again for different messages

### Testing Message Flow

1. **Copy** your unique URL from dashboard
2. **Open** URL in incognito/private window
3. **Send** anonymous message
4. **Check** dashboard - message should appear
5. **Test** delete functionality

---

## 16. Deployment Considerations

### Environment Variables in Production

**Professor's checklist**:

- [ ] MONGODB_URI (production database)
- [ ] NEXTAUTH_SECRET (generate new one)
- [ ] NEXTAUTH_URL (your production domain)
- [ ] OPENAI_API_KEY
- [ ] RESEND_API_KEY

### Database Configuration

"For production, use MongoDB Atlas:

- Set up proper indexes
- Enable authentication
- Whitelist deployment platform IPs
- Use connection pooling"

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Professor's note**: "Vercel is made by the Next.js team. It's the easiest way to deploy Next.js apps."

---

## 17. Further Learning

### Topics to Explore Next

**Professor's recommendations**:

1. **React Hook Form** - Better form handling
2. **React Query/TanStack Query** - Data fetching
3. **Zustand/Redux** - Global state management
4. **Prisma** - Alternative to Mongoose
5. **tRPC** - End-to-end type safety
6. **Serverless Functions** - Deep dive
7. **Edge Middleware** - Advanced routing
8. **Testing** - Jest, Playwright

### Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Next-Auth Docs**: https://next-auth.js.org
- **Zod Docs**: https://zod.dev
- **Mongoose Docs**: https://mongoosejs.com
- **TypeScript Handbook**: https://www.typescriptlang.org/docs

---

## 18. Professor's Final Words

"This project covers everything you need to build production-level full-stack applications:

✅ **Database**: MongoDB with Mongoose  
✅ **Backend**: Next.js API Routes  
✅ **Authentication**: Next-Auth with JWT  
✅ **Validation**: Zod schemas  
✅ **Email**: Resend with React Email  
✅ **AI**: OpenAI integration  
✅ **TypeScript**: Type-safe code  
✅ **UI**: Tailwind + shadcn/ui

After completing this, you are **freelance-ready**. You can build real applications for real clients.

The key is not to memorize everything, but to understand:

- How pieces fit together
- Where to find information
- How to debug issues
- Best practices

Keep building. Keep learning. The only way to get better at coding is to code more.

Remember: Production-level code is not about being perfect. It's about being:

- **Maintainable** - Others can understand it
- **Scalable** - Can handle growth
- **Secure** - Protects user data
- **Robust** - Handles errors gracefully

Good luck with your development journey!"

---

## 19. Quick Reference

### Essential Commands

```bash
# Create Next.js app
npx create-next-app@latest

# Install dependencies
npm install mongoose zod next-auth bcryptjs resend react-email

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Common Imports

```typescript
// Database
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";

// Validation
import { z } from "zod";

// Auth
import { useSession, signOut } from "next-auth/react";
import { getServerSession } from "next-auth";

// Next.js
import Link from "next/link";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
```

### Useful Code Snippets

**API Route Template**:

```typescript
import dbConnect from "@/lib/dbConnect";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const data = await request.json();
    // Your logic here

    return Response.json(
      { success: true, message: "Success" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ success: false, message: "Error" }, { status: 500 });
  }
}
```

**Protected Page Template**:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  return <div>Protected Content</div>;
}
```

---

## Appendix: Complete Code Examples

### A. Complete User Model

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
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

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
```

### B. Complete Database Connection

```typescript
import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

export default dbConnect;
```

### C. Complete Zod Schemas

```typescript
// signUpSchema.ts
import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// verifySchema.ts
export const verifySchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

// signInSchema.ts
export const signInSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

// messageSchema.ts
export const messageSchema = z.object({
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(300, "Content must be no longer than 300 characters"),
});

// acceptMessageSchema.ts
export const acceptMessageSchema = z.object({
  acceptMessages: z.boolean(),
});
```

---

## Conclusion

This documentation contains everything the professor taught in the full stack Next.js with AI integration class. Every concept, every code example, every explanation has been preserved.

**Key Takeaways**:

1. Production-level applications require proper architecture
2. Validation should happen at multiple levels
3. Next.js App Router is different from traditional backends
4. TypeScript adds safety without complexity
5. Use existing libraries instead of building from scratch
6. Error handling is crucial for production apps

This knowledge forms a solid foundation for building any full-stack application with Next.js. Practice by building similar projects and experimenting with the concepts taught here.

**Happy Coding! 🚀**
