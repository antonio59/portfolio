# My Portfolio

A modern, responsive portfolio website built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🚀 Blazing fast performance with Vite
- 🎨 Beautiful UI with Tailwind CSS and Radix UI
- 🔒 Secure authentication with Supabase
- 📱 Fully responsive design
- 📝 Content management with Supabase
- 🌍 Deployed on Netlify

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Supabase account
- Netlify account
- Git

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/my-portfolio.git
   cd my-portfolio
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**

   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials

   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   The app will be available at `http://localhost:3000`

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Deployment

### Netlify Deployment

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Connect your repository to Netlify
3. Set up the following build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18
4. Add your environment variables in the Netlify dashboard
5. Deploy!

### Manual Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. The built files will be in the `dist` directory

## Project Structure

```
my-portfolio/
├── client/                 # Frontend source code
│   ├── components/         # Reusable components
│   ├── lib/                # Utility functions and configurations
│   ├── pages/              # Page components
│   └── styles/             # Global styles
├── server/                 # Backend server code
├── public/                 # Static files
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── netlify.toml            # Netlify configuration
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
└── tsconfig.json           # TypeScript configuration
```

## Technologies Used

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Netlify](https://www.netlify.com/) - Cloud hosting and serverless backend

## License

This project is open source and available under the [MIT License](LICENSE).
