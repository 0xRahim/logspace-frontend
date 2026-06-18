# LogSpace Backend Requirements & API Design

This document outlines the backend requirements, entities, attributes, and proposed API layout for the LogSpace application based on the existing frontend implementation.

---

## 1. Project Overview
LogSpace is a modern discussion forum platform where users can share content in various formats (text, images, galleries, videos), follow other users, join discussions, and save content for later.

---

## 2. Core Entities & Attributes

### 2.1 User
Represents a platform member.
- `id` (UUID): Unique identifier.
- `username` (String): Unique handle (e.g., `@sarah`).
- `name` (String): Display name.
- `email` (String): User's email address.
- `password_hash` (String): Securely hashed password.
- `avatar_url` (String): URL to profile picture.
- `banner_url` (String): URL to profile header image.
- `bio` (Text): Short user biography.
- `karma` (Integer): Total points/reputation.
- `followers_count` (Integer): Cached count of followers.
- `following_count` (Integer): Cached count of following.
- `posts_count` (Integer): Cached count of posts created.
- `created_at` (Timestamp).

### 2.2 Post
The primary content unit. Posts can be top-level discussions or replies to other posts.
- `id` (UUID): Unique identifier.
- `author_id` (UUID): Reference to the User.
- `parent_id` (UUID, optional): Reference to another Post (for replies).
- `type` (Enum): `text`, `image`, `gallery`, `video`, `preview`.
- `category` (String): Primary category (e.g., "AI", "Design").
- `title` (String, optional): Title for top-level posts.
- `content` (Text): The body of the post.
- `media_urls` (Array of Strings): URLs for images, gallery items, or video files.
- `thumbnail_url` (String, optional): Specifically for video previews.
- `likes_count` (Integer): Cached count of likes.
- `replies_count` (Integer): Cached count of direct replies.
- `created_at` (Timestamp).

### 2.3 Category / Community
- `name` (String): Unique name.
- `post_count` (Integer): Number of posts in this category.

### 2.4 Hashtag
- `name` (String): Unique tag name.
- `uses_count` (Integer): Popularity metric.

---

## 3. Features & Usecases

### 3.1 Feed & Discovery
- **Home Feed**: Paginated list of posts. Support for filtering by category (e.g., "Technology", "AI") and sorting.
- **Explore**: Discovery page with tabs for:
    - `Hot`: Posts with high engagement recently.
    - `Rising`: Posts gaining traction quickly.
    - `Latest`: Chronological feed.
- **Trending Topics**: Sidebar showing popular categories and hashtags.

### 3.2 Engagement
- **Interactions**: Users can like and bookmark (save) posts.
- **Threading**: Multi-level replies (modeled as parent-child relationships in the Post entity).
- **Following**: Users can follow other users to see their content.

### 3.3 User Management
- **Public Profile**: View user stats, bio, and their post history (Posts, Replies, Media tabs).
- **Account Settings**:
    - Profile updates (name, bio, avatar).
    - Email management.
    - Security (password changes).
    - Data Export: Download account data in JSON format.
    - Account Deletion/Deactivation.

### 3.4 Search
- Global search for posts, categories, and hashtags.
- Support for multiple active filters (e.g., searching within specific categories or tags).

---

## 4. Proposed API Layout

### 4.1 Authentication
- `POST /api/auth/register`: Create new account.
- `POST /api/auth/login`: Authenticate user.
- `POST /api/auth/logout`: Invalidate session.

### 4.2 Posts
- `GET /api/posts`: List posts (Query params: `category`, `type`, `sort`, `author_id`, `limit`, `offset`).
- `GET /api/posts/:id`: Get post details and its direct replies.
- `POST /api/posts`: Create a new post or reply.
- `PATCH /api/posts/:id`: Edit a post.
- `DELETE /api/posts/:id`: Remove a post.
- `POST /api/posts/:id/like`: Toggle like status.
- `POST /api/posts/:id/save`: Toggle saved/bookmark status.

### 4.3 Users
- `GET /api/users/:username`: Get public profile data.
- `GET /api/users/me`: Get current authenticated user details.
- `PATCH /api/users/me`: Update current user's profile.
- `POST /api/users/:id/follow`: Toggle follow status.
- `GET /api/users/:id/followers`: List followers.
- `GET /api/users/:id/following`: List following.

### 4.4 Discovery & Search
- `GET /api/explore/trending`: Get trending categories, hashtags, and suggested users.
- `GET /api/search`: Search across posts, users, and tags (Query params: `q`, `categories[]`, `tags[]`).
- `GET /api/saved`: Get the authenticated user's saved posts.

### 4.5 Miscellaneous
- `GET /api/categories`: List all categories and their stats.
- `POST /api/user/export`: Trigger account data export.

---

## 5. Technical Requirements
- **JSON-based**: All API endpoints should consume and return JSON.
- **Authentication**: Bearer Token (JWT) or Session-based.
- **Media Handling**: Support for uploading images and videos (S3 or similar storage).
- **Caching**: Recommend caching trending data and aggregate counts (likes, followers).
