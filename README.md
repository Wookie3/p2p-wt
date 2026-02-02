# P2P Walkie Talkie

A sleek, peer-to-peer voice communication app built with Next.js and WebRTC.

## Features

- 🎙️ **Push-to-Talk Voice Communication** - Hold a button to transmit, release to listen
- 🔗 **Direct P2P Connection** - No server relay for audio (uses WebRTC)
- 👥 **Contact System** - Search users, send friend requests, manage contacts
- 👤 **Anonymous Access** - Quick start with auto-generated usernames (e.g., "RunningDuck")
- 🔐 **Optional Authentication** - Persistent accounts with email/password login
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Dark mode with sleek animations

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Realtime)
- **P2P Communication**: PeerJS (WebRTC wrapper)
- **State Management**: Zustand
- **Notifications**: react-hot-toast

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create tables and set up RLS policies
5. Go to Project Settings > API
6. Copy your Project URL and Anon Public Key

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase credentials.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Quick Start (Anonymous)

1. Open the app
2. You'll be assigned a random username (e.g., "RunningDuck")
3. Click "Start Talking" to begin
4. Share your username with friends to add them as contacts

### Account Login (Optional)

1. Click "Login" tab on the login page
2. Enter your username, email, and password
3. Your contacts and data persist across sessions

### Adding Contacts

1. Go to Contacts page
2. Search for a user by their exact username
3. Send a friend request
4. Once accepted, you can call them directly

### Making Calls

1. Go to Contacts
2. Click "Call" next to a contact
3. Hold the red button to talk, release to listen
4. Visual indicators show when transmitting or receiving

## Database Schema

The app uses three main tables:

- **profiles**: User information and online status
- **contacts**: Friendship connections between users
- **friend_requests**: Pending, accepted, or rejected friend requests

See `supabase-schema.sql` for the complete schema.

## Project Structure

```
p2p-wt/
├── app/
│   ├── (auth)/login/        # Authentication pages
│   ├── (main)/              # Main app pages
│   │   ├── contacts/        # Contact list
│   │   ├── requests/        # Friend requests
│   │   ├── call/[username]/ # Call interface
│   │   └── settings/        # User settings
│   └── api/                 # API routes
├── components/ui/           # UI components (shadcn/ui)
├── lib/                     # Utilities (Supabase, PeerJS, audio)
├── store/                   # Zustand state management
├── types/                   # TypeScript types
└── public/                  # Static assets
```

## Features Coming Soon

- [ ] Full authentication implementation
- [ ] Group chats
- [ ] Audio quality settings
- [ ] Message history for authenticated users
- [ ] Push notifications
- [ ] Mobile app (React Native)

## Troubleshooting

### Microphone Access

If you can't access the microphone:
- Ensure you've granted microphone permissions in your browser
- Check that no other app is using the microphone
- Try refreshing the page and granting permissions

### Connection Issues

If P2P connection fails:
- Both users need to be online
- Check that your firewall allows WebRTC traffic
- Try refreshing the page and reconnecting

### Anonymous Session Expiration

Anonymous sessions expire after 12 hours. To persist your data:
- Create an account with email/password
- Your contacts will be saved permanently

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
