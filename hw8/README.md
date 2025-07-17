# Test Commands for Mini Zipper API

## Prerequisites

1. Make sure your NestJS server is running:

   ```bash
   cd mini-zipper && pnpm start:dev
   ```

2. ZIP files are located in test-files directory:
   - large_test_images_with_broken.zip
   - number_images.zip
   - test_images_with_broken.zip

## Basic Newman Commands

### 1. Run single test for each ZIP file:

```bash
newman run newman-collection.json
```

### 2. Load test - 3 iterations of each request:

```bash
newman run newman-collection.json -n 3
```
