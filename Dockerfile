FROM node:22-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy backend package files if needed (usually handled by root install if workspace, but here it seems separate)
# Assuming single repo structure where root package.json manages everything or we need to install backend deps too.
# Let's check if we need to install backend deps specifically. 
# The root package.json has dependencies, but backend/package.json also exists.
# To be safe, let's copy everything and install.
# Since user was running `npm install` in backend folder too.

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
