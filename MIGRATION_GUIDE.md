# Supabase to MongoDB + JWT Migration Summary

## Changes Made

### 1. **Dependencies Updated** ✅

- **Removed**: `@supabase/supabase-js`
- **Added**:
  - `axios` - HTTP client for API calls
  - `jsonwebtoken` - JWT token handling
  - `jwt-decode` - Decode JWT tokens on client
  - `mongoose` - MongoDB ODM (for backend)

### 2. **Environment Variables** ✅

**Old (.env)**:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**New (.env)**:

```env
VITE_MONGODB_URI=mongodb://localhost:27017/agricure
VITE_API_URL=http://localhost:3000/api
VITE_JWT_SECRET=your_jwt_secret_key_here
```

### 3. **Services Migrated** ✅

#### `src/services/apiClient.ts` (NEW)

- Axios instance with interceptors
- Automatic JWT token attachment
- Error handling and auto-redirect on 401

#### `src/services/authService.ts` (UPDATED)

- **Before**: Used Supabase Auth (`supabase.auth.signUp`, `signInWithPassword`)
- **After**: REST API calls to `/api/auth/signup`, `/api/auth/login`
- JWT token stored in localStorage
- User data cached in localStorage
- Token expiration checking with jwt-decode

#### `src/services/farmService.ts` (UPDATED)

- **Before**: Direct Supabase database queries
- **After**: REST API calls (`/api/farms`)
- All CRUD operations use apiClient

#### `src/services/recommendationService.ts` (UPDATED)

- **Before**: Supabase database queries
- **After**: REST API calls (`/api/recommendations`)

#### `src/services/supabaseClient.ts` (DEPRECATED)

- Now just re-exports types from `database.ts`
- Kept for backward compatibility during migration

### 4. **Type Definitions** ✅

#### `src/types/database.ts` (UPDATED)

All database types converted from snake_case to camelCase:

**Old Schema**:

```typescript
{
  user_id: string;
  full_name: string;
  farm_location: string;
  created_at: string;
}
```

**New Schema**:

```typescript
{
  userId: string;
  fullName: string;
  farmLocation: string;
  createdAt: string;
}
```

### 5. **Components Updated** ✅

#### Import Changes

All imports changed from:

```typescript
import { UserProfile } from "@/services/supabaseClient";
```

To:

```typescript
import { UserProfile } from "@/types/database";
```

**Files Updated**:

- `src/pages/Dashboard.tsx`
- `src/pages/RecommendationDetails.tsx`
- `src/pages/DetailedRecommendationsPage.tsx`
- `src/components/ProfileModal.tsx`
- `src/components/DashboardHeader.tsx`
- `src/components/EnhancedFarmOverview.tsx`
- `src/services/recommendationBuilder.ts`

#### `src/components/ProfileModal.tsx`

- Field names updated to camelCase
- Uses new authService methods

### 6. **Authentication Flow** ✅

**Old Flow (Supabase)**:

1. User signs up → Supabase creates auth.users entry
2. Profile created in user_profiles table
3. Session managed by Supabase
4. Real-time auth state changes via `onAuthStateChange`

**New Flow (JWT)**:

1. User signs up → Backend creates User document in MongoDB
2. JWT token generated and returned
3. Token stored in localStorage
4. Token sent with every API request via Authorization header
5. Token validated on backend for protected routes

### 7. **Real-time Data** ✅

#### `src/contexts/RealTimeDataContext.tsx`

- No changes needed (already using ThingSpeak polling)
- Doesn't rely on Supabase real-time subscriptions

**Note**: If you need real-time updates for farms/recommendations:

- Option 1: Implement polling
- Option 2: Add Socket.IO or Server-Sent Events

## What You Need to Do

### Step 1: Install New Dependencies

```bash
npm install axios jsonwebtoken jwt-decode
npm uninstall @supabase/supabase-js
```

### Step 2: Update Environment Variables

Copy `.env.example` to `.env` and update:

```env
VITE_API_URL=http://localhost:3000/api
VITE_JWT_SECRET=your_jwt_secret_key
```

### Step 3: Set Up Backend Server

Follow the `BACKEND_SETUP.md` guide to:

1. Create Node.js/Express backend
2. Set up MongoDB connection
3. Implement authentication routes
4. Implement CRUD routes for farms and recommendations

### Step 4: Data Migration

Export your data from Supabase and import to MongoDB:

**Export from Supabase**:

```sql
-- Export users
COPY (SELECT * FROM auth.users) TO '/tmp/users.csv' CSV HEADER;
COPY (SELECT * FROM user_profiles) TO '/tmp/profiles.csv' CSV HEADER;
COPY (SELECT * FROM farms) TO '/tmp/farms.csv' CSV HEADER;
COPY (SELECT * FROM fertilizer_recommendations) TO '/tmp/recommendations.csv' CSV HEADER;
```

**Import to MongoDB**:

```bash
mongoimport --db agricure --collection users --type csv --headerline --file users.csv
mongoimport --db agricure --collection farms --type csv --headerline --file farms.csv
mongoimport --db agricure --collection recommendations --type csv --headerline --file recommendations.csv
```

### Step 5: Test Everything

1. Start backend: `cd agricure-backend && npm run dev`
2. Start frontend: `npm run dev`
3. Test signup/login
4. Test farm creation
5. Test recommendations

## API Endpoints Reference

### Authentication

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Farms

- `POST /api/farms` - Create farm
- `GET /api/farms/user/:userId` - Get user's farms
- `GET /api/farms/:id` - Get farm by ID
- `PUT /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm

### Recommendations

- `POST /api/recommendations` - Create recommendation
- `GET /api/recommendations/user/:userId` - Get user's recommendations
- `GET /api/recommendations/:id` - Get recommendation by ID
- `PATCH /api/recommendations/:id` - Update recommendation status
- `DELETE /api/recommendations/:id` - Delete recommendation

## Breaking Changes

### 1. Field Name Changes (snake_case → camelCase)

```typescript
// Old
user_id → userId
full_name → fullName
farm_location → farmLocation
created_at → createdAt
```

### 2. Auth Methods

```typescript
// Old
const { user } = await authService.getCurrentUser();
// Returns async

// New
const { user } = authService.getCurrentUser();
// Returns synchronously from localStorage
```

### 3. No More Supabase Real-time

- Real-time subscriptions removed
- Use polling or implement Socket.IO for real-time features

### 4. Error Handling

```typescript
// Old
if (error) throw error;

// New
if (error) {
  // error is now a string message, not an object
  console.error(error);
}
```

## Rollback Plan

If you need to rollback:

1. Restore `package.json` to previous version
2. Run `npm install`
3. Restore `.env` with Supabase credentials
4. Restore all service files from git

## Benefits of Migration

✅ **Full Control**: Own your database and auth logic  
✅ **Cost**: No vendor lock-in, pay only for MongoDB hosting  
✅ **Flexibility**: Custom business logic in backend  
✅ **Scalability**: Scale MongoDB independently  
✅ **Performance**: Optimize queries for your use case  
✅ **Privacy**: Data stays in your infrastructure

## Potential Issues & Solutions

### Issue: CORS errors

**Solution**: Configure CORS in backend (`app.use(cors())`)

### Issue: Token expiration

**Solution**: Implement refresh token mechanism

### Issue: Large payload responses

**Solution**: Add pagination to list endpoints

### Issue: Real-time updates missing

**Solution**: Implement Socket.IO or use polling

## Next Steps

1. ✅ Complete backend implementation
2. ✅ Test all API endpoints
3. ✅ Migrate production data
4. ✅ Set up MongoDB Atlas for production
5. ✅ Deploy backend to hosting service (Heroku, DigitalOcean, AWS)
6. ✅ Update frontend `.env` with production API URL
7. ✅ Add monitoring and logging
8. ✅ Set up automated backups

## Support

For issues or questions:

1. Check `BACKEND_SETUP.md` for backend setup
2. Review API endpoint implementations
3. Check browser console for errors
4. Verify JWT token in localStorage
5. Test API endpoints with Postman/cURL
