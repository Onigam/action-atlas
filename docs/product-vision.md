# Product Vision: Action Atlas

## Problem Statement

People struggle to discover meaningful volunteering activities that match their interests, skills, and location. Non-profit organizations offering volunteering activities lack visibility, creating friction for both volunteers and organizers:

- **Discovery gap**: Volunteering activities are scattered across disconnected channels, websites, and platforms
- **Search inefficiency**: Traditional keyword search fails to capture semantic intent (searching "help kids" won't find "youth mentoring")
- **Time waste**: Volunteers spend hours browsing multiple sites to find relevant activities
- **Missed connections**: Great volunteering activities go unfilled due to lack of visibility
- **Location mismatch**: Finding activities near you requires manual filtering across platforms

## Target Users

### Primary: Individual Volunteers
- People seeking meaningful ways to contribute to their communities
- Individuals with specific skills or interests looking for matching activities
- Students fulfilling volunteer hour requirements
- Professionals seeking pro-bono or skill-based volunteering
- Retirees looking to stay engaged and give back

**Characteristics**: Time-conscious, want to find activities that align with their values and location, prefer intuitive search over browsing multiple sites.

### Secondary: Event Organizers
- Corporate event planners organizing team-building or CSR initiatives
- Community organizers planning volunteer events
- Educational institutions organizing student volunteer programs

**Characteristics**: Time-constrained, need to find group volunteering activities, want reliable contacts.

### Tertiary: Non-Profit Organizations
- Small to medium non-profit organizations offering volunteering activities
- Organizations seeking volunteers and visibility
- Teams with limited marketing resources

**Characteristics**: Need exposure, have valuable volunteering activities to offer, struggle with discoverability.

## Value Proposition

**For volunteers**: An AI-powered semantic search engine that understands what you're looking for and finds volunteering activities that truly match your interests, skills, and location — transforming hours of browsing into seconds of searching.

**For event organizers**: A centralized platform to discover volunteering activities for groups and teams, with instant access to verified contacts — making it easy to organize meaningful team volunteering experiences.

**For non-profits**: A channel to showcase volunteering activities and connect with motivated volunteers — turning passive waiting into active visibility through intelligent search.

## MVP Scope

### Core Feature: Semantic Search Engine

The heart of Action Atlas is an AI-powered semantic search that understands natural language queries and returns relevant volunteering activities based on meaning, not just keywords.

**Technical Approach** (inspired by thegoodsearch):
- Vector embeddings using OpenAI's text-embedding models
- ChromaDB for efficient vector similarity search
- Location-aware search with geocoding and geospatial sorting
- Hybrid search: semantic relevance + geographic proximity
- Query intent analysis for better result accuracy

### In-Scope Features

1. **AI-Powered Semantic Search**
   - Natural language search (e.g., "teach kids math on weekends", "environmental cleanup near me")
   - Vector-based similarity matching for semantic understanding
   - Location-aware search with automatic geocoding
   - Geospatial sorting for proximity-based results
   - Fast, scalable search over thousands of activities

2. **Activity Discovery**
   - Browse volunteering activities with basic filtering (category, skills, location)
   - View activity details (description, time commitment, requirements)
   - See organization information and mission
   - View location on map and distance from user

3. **Contact Information**
   - Display verified contact details for each activity
   - Show primary contact person and role
   - Provide email and phone contact methods
   - Direct links to organization websites

4. **Organization Profiles**
   - Basic non-profit profile (name, mission, location)
   - List of volunteering activities offered
   - Simple activity submission form

5. **Basic Admin Tools**
   - Manual review/approval workflow for new activities
   - Activity embedding generation and vector storage
   - Basic content moderation capabilities

### Explicitly Out-of-Scope (for MVP)

- **Donation activities or fundraising**: Focus exclusively on volunteering activities (time-based), not monetary donations or fundraising campaigns
- User authentication or volunteer accounts
- Booking/reservation/scheduling system
- Application or signup flows for activities
- Payment processing
- Direct messaging between volunteers and organizations
- Reviews, ratings, or testimonials
- Volunteer hour tracking or verification
- Advanced filtering (availability calendars, capacity matching)
- Multi-language support
- Mobile applications
- Integration with external calendars or CRM tools
- Analytics dashboard for non-profits or volunteers
- Automated matching or AI-based recommendations (beyond search)

## Key Assumptions

1. **Volunteer demand**: Individuals actively seek volunteering activities and face discovery challenges with traditional search
2. **Semantic search value**: Users will find value in natural language search over traditional keyword search
3. **Supply willingness**: Non-profits will voluntarily submit their volunteering activities to gain visibility
4. **Contact sufficiency**: Providing contact information is sufficient for MVP; volunteers will handle outreach themselves
5. **Manual curation**: Early-stage manual moderation is acceptable and adds quality control
6. **Public access**: An open, no-authentication platform will drive initial adoption and reduce barriers
7. **Simple onboarding**: Non-profits can describe their volunteering activities via a basic form
8. **Data availability**: Sufficient volunteering activity data exists or can be acquired to populate the search engine
9. **Location relevance**: Geographic proximity matters to most volunteers when selecting activities

## Non-Goals

- **Not a donation platform**: We don't handle monetary donations, fundraising, or financial transactions
- **Not a volunteer management system**: We don't handle volunteer applications, scheduling, hour tracking, or verification
- **Not a CRM**: We don't manage ongoing relationships between volunteers and organizations
- **Not an event management tool**: We don't handle event logistics, ticketing, or attendee management
- **Not a social network**: No profiles, following, or social features for users
- **Not a review platform**: No rating system or user-generated reviews (at MVP stage)
- **Not a matching service**: We provide search, not automated volunteer-opportunity matching algorithms

## Success Metrics

### Primary Metrics
- **Activity catalog size**: Number of verified volunteering activities listed
- **Search usage**: Number of searches per month
- **Platform usage**: Unique visitors per month
- **Contact access rate**: Percentage of visitors who view contact details
- **Search quality**: Average number of results per search, percentage of zero-result searches

### Secondary Metrics
- **Non-profit acquisition**: Number of organizations with profiles
- **Geographic coverage**: Number of regions/cities represented
- **Search effectiveness**: Semantic search accuracy (qualitative assessment)
- **Return visits**: Percentage of users returning within 30 days

### Validation Metrics (Post-Launch)
- **Volunteer engagement**: Qualitative feedback from volunteers about activity quality and follow-through
- **Non-profit satisfaction**: Feedback on volunteer inquiries received
- **Search satisfaction**: User feedback on search relevance and result quality
- **Time-to-find**: User-reported time to find suitable activities vs. other methods

## Guiding Principles

1. **Search-first experience**: Semantic search is the core feature; optimize for search speed, relevance, and user delight
2. **Volunteer-centric**: Optimize for the volunteer discovery flow — from query to activity details to contact
3. **Pragmatic AI**: Use AI where it provides clear value (semantic search, location detection), not for the sake of AI
4. **Quality over quantity**: Better to have 100 well-documented activities with accurate embeddings than 1000 unclear ones
5. **Low barrier to entry**: Non-profits should be able to list volunteering activities in minutes
6. **Transparency**: All information public and accessible without authentication friction
7. **Volunteering, not donations**: Focus exclusively on time-based contributions, keeping the platform simple and focused

---

**Document Status**: Living document, updated as product evolves
**Last Updated**: 2026-01-07
**Version**: 2.0 - Pivoted to semantic search for volunteering activities
