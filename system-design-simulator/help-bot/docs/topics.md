# System Design Topics

## Available Interview Topics

### Social Media Systems

#### Design Twitter / X
- **Difficulty**: Medium to Hard
- **Key Concepts**:
  - Timeline generation (fan-out on write vs fan-out on read)
  - Tweet storage and retrieval
  - Following/Follower relationships
  - Real-time notifications
  - Trending topics algorithm

#### Design Instagram
- **Difficulty**: Medium
- **Key Concepts**:
  - Image upload and storage
  - News feed generation
  - CDN for media delivery
  - User engagement (likes, comments)
  - Explore/Discovery features

#### Design Facebook News Feed
- **Difficulty**: Hard
- **Key Concepts**:
  - Feed ranking algorithms
  - Content aggregation
  - Real-time updates
  - Privacy controls
  - Multi-device sync

### Messaging Systems

#### Design WhatsApp
- **Difficulty**: Medium
- **Key Concepts**:
  - Real-time messaging (WebSockets)
  - Message delivery guarantees
  - End-to-end encryption
  - Group chat architecture
  - Message acknowledgment (delivered, read)

#### Design Slack
- **Difficulty**: Medium to Hard
- **Key Concepts**:
  - Channel-based communication
  - Search functionality
  - File sharing
  - Notifications
  - Integrations/Bots

### Video Streaming

#### Design YouTube
- **Difficulty**: Hard
- **Key Concepts**:
  - Video upload and transcoding
  - CDN and edge caching
  - Recommendation engine
  - Live streaming
  - Comments and engagement

#### Design Netflix
- **Difficulty**: Hard
- **Key Concepts**:
  - Video streaming protocols (HLS, DASH)
  - Content recommendation
  - Global CDN distribution
  - Device compatibility
  - Offline viewing

### Transportation/Location

#### Design Uber
- **Difficulty**: Hard
- **Key Concepts**:
  - Real-time location tracking
  - Driver-rider matching
  - Surge pricing
  - Route optimization
  - Payment processing

#### Design Google Maps
- **Difficulty**: Hard
- **Key Concepts**:
  - Map tile serving
  - Route calculation (Dijkstra, A*)
  - Real-time traffic
  - Points of Interest
  - Offline maps

### E-Commerce

#### Design Amazon
- **Difficulty**: Hard
- **Key Concepts**:
  - Product catalog
  - Search and recommendations
  - Shopping cart
  - Order processing
  - Inventory management

### Storage/Infrastructure

#### Design Dropbox
- **Difficulty**: Medium to Hard
- **Key Concepts**:
  - File synchronization
  - Chunking and deduplication
  - Version control
  - Sharing permissions
  - Conflict resolution

#### Design a URL Shortener (TinyURL)
- **Difficulty**: Easy to Medium
- **Key Concepts**:
  - ID generation strategies
  - Base62 encoding
  - Redirection
  - Analytics tracking
  - Expiration handling

### Search

#### Design Google Search
- **Difficulty**: Hard
- **Key Concepts**:
  - Web crawling
  - Inverted index
  - PageRank algorithm
  - Query processing
  - Spell correction

### Real-Time Systems

#### Design a Chat System
- **Difficulty**: Medium
- **Key Concepts**:
  - WebSocket connections
  - Message persistence
  - Presence detection
  - Push notifications

#### Design a Notification System
- **Difficulty**: Medium
- **Key Concepts**:
  - Multi-channel delivery (push, email, SMS)
  - Priority queuing
  - Rate limiting
  - User preferences

## Topic Selection Tips

1. **Start with easier topics** if you're new to system design
2. **Practice variety** - don't just focus on one type of system
3. **Understand common patterns** that apply across topics
4. **Focus on your weak areas** identified in analytics
5. **Target company-specific topics** if preparing for specific interviews
