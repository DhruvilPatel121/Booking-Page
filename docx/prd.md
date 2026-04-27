# Requirements Document

## 1. Application Overview

### 1.1 Application Name

Sports Booking Platform

### 1.2 Application Description

A modern responsive sports booking website with admin panel that enables users to book sports venues and slots, make payments, and view leaderboards. Administrators can manage sports, venues, slots, bookings, and track revenue analytics.

## 2. Users and Usage Scenarios

### 2.1 Target Users

- End Users: Sports enthusiasts who want to book sports venues and slots
- Administrators: Staff who manage the platform, venues, slots, and bookings

### 2.2 Core Usage Scenarios

- Users browse available sports and book slots at venues
- Users make payments and receive booking confirmations
- Users view leaderboards to track top players
- Administrators manage sports, venues, slots, bookings, and analyze revenue

## 3. Page Structure and Functionality

### 3.1 Page Structure

```
├── User Pages
│   ├── Booking Page
│   ├── Payment Success Page
│   └── Leaderboard Page
└── Admin Panel
    ├── Dashboard
    ├── Sports Management
    ├── Venues Management
    ├── Slots Management
    ├── Bookings Management
    ├── Payment Status Management
    ├── Leaderboard Management
    └── Revenue Analytics
```

### 3.2 User Pages

#### 3.2.1 Booking Page

- Display booking form with fields:
  - Full name (text input)
  - Mobile number (text input)
  - Email (text input)
  - Gender (dropdown: Male, Female, Other)
  - Sports name (dropdown: populated from available sports)
  - Booking date (date picker)
  - Duration/Slot (dropdown: populated based on available slots)
- Auto-display available ground/venue based on selected sport, date, and available slots
- Auto-display booking amount based on selected slot
- Display \"Pay Now\" button
- If slot is full, display \"Slot Full\" message and disable payment button
- Modern card-based layout with clean premium UI
- Mobile responsive design

#### 3.2.2 Payment Success Page

- Display booking confirmation details:
  - Booking ID
  - Slot details (date, time, duration)
  - Venue name
  - Sport name
  - Amount paid
- Display success message

#### 3.2.3 Leaderboard Page

- Display top players in table format with columns:
  - Rank
  - Player name
  - Points
  - Wins
  - Matches played
  - Sport
- Filter leaderboard by sport
- Sort by rank (highest to lowest)

### 3.3 Admin Panel

#### 3.3.1 Dashboard

- Display analytics overview:
  - Total bookings
  - Total revenue
  - Active slots
  - Total users
- Display recent bookings list

#### 3.3.2 Sports Management

- List all sports with columns: sport name, status, actions
- Add new sport (form: sport name)
- Edit sport details
- Delete sport

#### 3.3.3 Venues Management

- List all venues (5 to 7 venues) with columns: venue name, assigned sports, status, actions
- Add new venue (form: venue name)
- Assign sports to venue (multi-select dropdown)
- Update venue status (dropdown: Open, Full, Closed)
- Edit venue details
- Delete venue

#### 3.3.4 Slots Management

- List all slots with columns: sport, venue, date, time, duration, total capacity, booked count, status, actions
- Create new slot (form: sport, venue, date, time, duration, total capacity)
- Edit slot details
- Delete slot
- View slot booking details

#### 3.3.5 Bookings Management

- List all bookings with columns: booking ID, user name, sport, venue, date, slot, amount, payment status, actions
- View booking details
- Filter bookings by date, sport, venue, payment status
- Search bookings by user name or booking ID

#### 3.3.6 Payment Status Management

- List all payments with columns: booking ID, user name, amount, payment method, status, transaction ID, date, actions
- Update payment status (dropdown: Pending, Completed, Failed, Refunded)
- View payment details

#### 3.3.7 Leaderboard Management

- List all leaderboard entries with columns: player name, sport, points, wins, matches played, rank, actions
- Add new player entry (form: player name, sport, points, wins, matches played)
- Update player points and wins
- Edit player details
- Delete player entry

#### 3.3.8 Revenue Analytics

- Display revenue charts:
  - Total revenue over time (line chart)
  - Revenue by sport (bar chart)
  - Revenue by venue (pie chart)
- Display revenue summary:
  - Total revenue
  - Revenue this month
  - Revenue this week
  - Average booking amount
- Filter analytics by date range

## 4. Business Rules and Logic

### 4.1 Slot Booking Logic

- Admin creates slots with total capacity (e.g., 50 slots)
- Each booking reduces available capacity by 1
- When booked count equals total capacity, slot status changes to \"Full\"
- Users cannot book full slots
- Payment button is disabled for full slots

### 4.2 Venue Assignment Logic

- Admin assigns sports to venues
- Admin sets venue status: Open, Full, or Closed
- Users do not manually select venue
- Venue is automatically displayed based on:
  - Selected sport
  - Selected date
  - Available slot capacity
  - Venue status is \"Open\"
- If no venue matches criteria, display \"No available venue\" message

### 4.3 Payment Integration

- Integrate Razorpay payment gateway
- After user clicks \"Pay Now\", redirect to Razorpay payment page
- On successful payment:
  - Create booking record with status \"Confirmed\"
  - Reduce slot available capacity
  - Redirect to Payment Success Page
- On failed payment:
  - Display error message
  - Do not create booking record

### 4.4 Leaderboard Update Logic

- Admin can manually update player points and wins
- Rank is automatically calculated based on points (highest to lowest)
- Leaderboard is filtered by sport

## 5. Exception and Boundary Cases

| Scenario                                                   | Handling                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| User submits booking form with missing fields              | Display validation error messages for required fields                           |
| User selects date in the past                              | Display error message \"Please select a future date\"                           |
| No slots available for selected sport and date             | Display \"No available slots\" message and disable booking                      |
| Payment fails during transaction                           | Display error message and allow user to retry payment                           |
| Admin deletes sport that has active bookings               | Display confirmation warning before deletion                                    |
| Admin creates slot with capacity less than 1               | Display validation error \"Capacity must be at least 1\"                        |
| Multiple users book the last available slot simultaneously | First successful payment confirms booking, others receive \"Slot Full\" message |
| User enters invalid email format                           | Display validation error \"Please enter a valid email address\"                 |
| User enters invalid mobile number format                   | Display validation error \"Please enter a valid mobile number\"                 |
| Admin sets venue status to \"Closed\" with active bookings | Existing bookings remain valid, new bookings are blocked                        |

## 6. Acceptance Criteria

1. User can successfully complete booking flow from form submission to payment
2. Booking amount is automatically calculated and displayed based on selected slot
3. Venue is automatically assigned based on sport, date, and availability
4. Payment button is disabled when slot is full
5. Slot capacity decreases after successful booking
6. Payment Success Page displays correct booking details including booking ID, venue, and amount
7. Leaderboard displays top players with correct ranking based on points
8. Leaderboard can be filtered by sport
9. Admin can create, edit, and delete sports, venues, and slots
10. Admin can assign multiple sports to a venue
11. Admin can update venue status (Open, Full, Closed)
12. Admin can view all bookings with filtering and search capabilities
13. Admin can update payment status
14. Admin can update leaderboard player points and wins
15. Dashboard displays accurate analytics data
16. Revenue Analytics displays charts and summary with correct data
17. All pages are mobile responsive
18. UI follows modern card-based layout with clean premium design
19. Razorpay payment integration works correctly
20. Data is persisted in Supabase PostgreSQL database

## 7. Features Not Included in This Release

- User registration and login system
- User profile management
- Booking history for users
- Email or SMS notifications
- Booking cancellation and refund
- Multi-language support
- Dark mode
- Social sharing features
- Advanced analytics with custom date ranges
- Export data to CSV or PDF
- Automated slot creation based on recurring schedules
- Waitlist functionality for full slots
- Discount codes or promotional offers
- User reviews and ratings for venues
