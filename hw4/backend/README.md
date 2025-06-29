# Backend Scripts

- **Run Development Server**
  ```bash
  npm run dev
  ```
- **Run Linter Server**
  ```bash
  npm run lint
  ```
- **Run build Server**
  ```bash
  npm run build
  ```
- **Run start Server**
  ```bash
  npm run start
  ```

# Docker Scripts

- **Build Docker Image**

  ```bash
  docker build -t brew-api .

  ```

- **Run Docker Image**
  ```bash
  docker run --name brew-api -p 3000:3000 brew-api
  ```
