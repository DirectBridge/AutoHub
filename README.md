# AutoHub

**Software Engineering Project**

## Getting Started

When you clone the repository or pull it for the first time, follow these steps:

### 1. Install Dependencies

Install the dependencies for both the frontend and backend:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in both the `frontend` and `backend` directories.

Add the required credentials and configuration variables to the corresponding files.

For example:
- Database credentials
- Cloudinary credentials for image storage
- Other required application credentials

**Important:** Never upload your `.env` files or expose your credentials in the repository.

---

## Project Structure

### Backend

The `backend` folder contains the server-side code.

- **config:** Contains the configuration files, including the database connection configuration.
- **controller:** Contains the functions that implement the backend application logic.
- **middleware:** Contains the middleware functions used in the application.
- **router:** Contains all application routes, such as `GET`, `POST`, `PUT`, and `DELETE`.

### Frontend

The `frontend` folder contains the client-side code.

- **src:** Contains the main source code of the frontend application.
- **assets:** Contains project images and other static assets.
- **pages:** Contains the files related to the different pages of the website.
- **component:** Contains the reusable components used throughout the project.

---

## Important Notes

1. Whenever you create a new page or component, create a separate folder using its name.
2. Inside that folder, include:
   - A `.jsx` file for the component or page.
   - A `.css` file for its styling.
3. Store all credentials and sensitive configuration values in the appropriate `.env` files, including:
   - Database credentials.
   - Cloudinary credentials used for image storage.
   - Any other application credentials.

**Always keep sensitive credentials out of the source code and never commit `.env` files to GitHub.**
