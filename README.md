# HuntLy - AI-Powered Talent Search Platform

HuntLy is an innovative talent search platform that leverages AI to help recruiters, founders, and teams discover qualified professionals based on skills, experience, and location. The platform provides a sleek, intuitive interface for searching candidates and visualizing talent pool data.

![HuntLy Logo](public/images/logo.png)

## 🚀 Features

### For Recruiters & Hiring Teams
- **AI-Powered Search**: Natural language search to find candidates matching complex criteria
- **Interactive Dashboard**: Visualize candidate data with interactive charts and graphs
- **Talent Pool Analytics**: Analyze distribution by location, experience level, and in-demand skills
- **Ranked Analysis**: Get AI-ranked candidate lists based on relevance to your search query

### For Candidates
- **Profile Registration**: Easily submit professional information to be discovered by top companies
- **Skills Showcase**: Highlight your unique skills and expertise

## 🛠️ Technology Stack

HuntLy is built with modern web technologies to ensure performance, scalability, and maintainability:

- **Frontend**:
  - [Next.js 15](https://nextjs.org/) - React framework with App Router
  - [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [Framer Motion](https://www.framer.com/motion/) - Animation library
  - [Tremor](https://www.tremor.so/) - React dashboards & charts

- **Backend**:
  - Next.js API routes
  - Serverless functions
  - AI integration with RAG (Retrieval-Augmented Generation)
  - Redis for caching and faster responses

- **Infrastructure**:
  - Vercel - Deployment and hosting
  - API proxy architecture for security

## 💻 Development

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/huntly.git
cd huntly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run the development server
npm run dev
```

### Environment Variables
- `API_BASE_URL`: Backend API endpoint (server-side only)



## ⚠️ Current Limitations

As this is a demonstration/MVP version:

1. **Mock Data**: The application currently uses mock data instead of a real database. The search results and analytics are based on predefined sample data.

2. **API Limitations**: The backend functionality simulates real API responses but has limited capabilities compared to a production system.

3. **Authentication**: User authentication is not fully implemented in this version.

## 🌟 Advantages

1. **User Experience**: Modern, responsive UI with smooth animations and intuitive search
2. **Visualization**: Rich data visualization for talent analysis
3. **Scalable Architecture**: Separation of concerns with Next.js App Router and API routes
4. **Performance**: Optimized for fast page loads and interactions
5. **Developer Experience**: Type-safe code and modern tooling

## 🔄 Future Improvements

1. Replace mock data with real database integration
2. Implement comprehensive authentication and authorization
3. Add more advanced search filters and sorting options
4. Expand analytics capabilities
5. Develop candidate matching algorithms
6. Add notification system for new candidate matches

## 📝 License

[MIT](LICENSE)

## 🙏 Credits

This project was created by the HuntLy team. Special thanks to all contributors who have helped make this project possible.