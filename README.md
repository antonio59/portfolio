# Antonio Smith's Portfolio

Welcome to my personal portfolio website! This project showcases my skills, experience, and projects as a Technical Project Manager based in London.

## 🚀 Features

- Responsive design
- About Me section with a brief introduction
- Experience timeline
- Project showcase with categorized sections:
  - Development Projects: Showcasing technical implementations and coding expertise
  - General Projects: Highlighting project management and organizational initiatives
- Category-specific descriptions for better context
- Certifications list
- Contact information
- Enhanced Admin dashboard for content management
- Secure authentication system

## 🛠 Technologies Used

- React.js
- Vite
- CSS3
- React Icons
- Firebase Authentication
- Firebase Realtime Database

## 🏗 Project Structure

```
├── src/
│   ├── components/
│   │   ├── About.jsx
│   │   ├── Admin.jsx
│   │   ├── Certifications.jsx
│   │   ├── Experience.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Login.jsx
│   │   └── Projects.jsx
│   ├── data/
│   │   └── content.json
│   ├── App.jsx
│   ├── firebase.js
│   ├── main.jsx
│   └── index.css
├── public/
│   └── _redirects
└── package.json
```

## 🔐 Authentication

The portfolio includes a secure admin dashboard protected by Firebase Authentication. This allows for:
- Secure login system
- Protected admin routes
- Content management capabilities

## 🚦 Running the Project

To run the project in your local environment, follow these steps:

1. Clone the repository: 
   ```
   git clone https://github.com/antonio59/portfolio.git
   ```
2. Navigate into the project directory:
   ```
   cd portfolio
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication
   - Configure Realtime Database
   - Add your Firebase configuration to `src/firebase.js`

5. Run the development server:
   ```
   npm run dev
   ```
6. Open your browser and visit `http://localhost:5173`

## 🔧 Building for Production

To create a production build, run:
```
npm run build
```

## 📤 Deployment

The project is configured for deployment on Netlify with proper routing setup:
- Automatic deployments from main branch
- Configured `_redirects` file for SPA routing
- Environment variables management through Netlify UI

## 📫 Contact

Feel free to reach out to me for any questions or opportunities!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
