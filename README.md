1. Pre-requisites
Install node.js, git, PostgreSQL, Docker (if reproducing using the provided Docker configuration)


2. Clone repository
git clone https://github.com/ybchai/tmessenger.git


3. Install frontend dependencies
cd tmessenger
cd frontend
npm install (install dependencies from package.json)


4. Install Backend Dependencies
cd ..
cd backend
npm install


5.  Configure Environment Variables
Configure environment variables for external services and database:
inside backend/ create .env file and .gitignore (.gitignore should contain .env and node modules)

Inside .env:

PORT=3000
DATABASE_URL=<YOUR_POSTGRES_CONNECTION_STRING>
CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>
DEEPL_API_KEY=<YOUR_DEEPL_API_KEY>
NODE_ENV=development
FRONTEND_URL=<http://localhost:5173 || {frontend_url from where your app is deployed}>

*The app is deployed on Render, so these environment variables also have to be configured on the render dashboard if you’re planning on deploying this app online*
*To deploy the app on Render, upload the docker file and set up your environment variables and deploy it.*


6. Configure Frontend Environment Variables
inside frontend/

create:
.env

add:
VITE_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
*Also set this up in Render environment variables if deploying on Render


7. Set up PostgreSQL
Option A - Hosted PostgreSQL (NEON DB)
Create a PostgreSQL database using the selected provider and obtain connection string

place connection string in:
DATABASE_URL=<POSTGRES_CONNECTION_STRING>

Option B - Local PostgreSQL
Create a PostgreSQL database:

CREATE DATABASE messenger;
configure backend: 
DATABASE_URL=<YOUR_LOCAL_POSTGRESQL_CONNECTION>


8. Run database migrations
*Migration scripts are automatically ran when the app is deployed on Render

Otherwise:
cd backend
npm run migrate


// only for local deployment
9. Start backend
from backend/ run: npm run dev (backend should start on http://localhost:3000


10. Start frontend
navigate to frontend 
(new terminal): 
cd tmessenger 
cd frontend
npm run dev


frontend should be on http://localhost:5173


// otherwise, if using Render
after creating and configuring .env variables just commit and sync the repository, Render will automatically retrieve the latest updates and rebuild and deploy the app. 
