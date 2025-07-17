# Mini Zipper - Thumbnail Generator

A NestJS application that processes ZIP files containing images and generates thumbnails using worker threads for parallel processing.

## Features

- **Worker Threads**: Utilizes Node.js worker threads for parallel image processing
- **Thread Safety**: Implements mutex to ensure atomic updates to shared counters
- **Sharp Integration**: Uses Sharp library for high-performance image processing
- **Concurrent Uploads**: Supports multiple simultaneous ZIP file uploads
- **Detailed Logging**: Comprehensive logging with thread IDs for debugging

## Project Setup

```bash
# Install dependencies
$ pnpm install
```

## Running the Application

```bash
# Development mode
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

The server will start on `http://localhost:3000`

## API Usage

### Upload and Process ZIP File

**Endpoint:** `POST /zip`  
**Content-Type:** `multipart/form-data`

```bash
# Upload a ZIP file containing images
curl -F "file=@your-images.zip" http://localhost:3000/zip
```

**Example Response:**

```json
{
  "processed": 5,
  "skipped": 2,
  "durationMs": 1234.56,
  "totalFiles": 7
}
```

**Response Fields:**

- `processed`: Number of images successfully converted to thumbnails
- `skipped`: Number of files skipped (non-images or processing failures)
- `durationMs`: Total processing time in milliseconds
- `totalFiles`: Total number of files in the ZIP archive

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)

Non-image files are automatically skipped and counted in the `skipped` field.

## Thread Safety & Debugging

The application implements the following thread safety measures:

1. **Mutex Protection**: Shared counters are protected by a mutex to prevent race conditions
2. **Atomic Operations**: Uses `Atomics` API for thread-safe counter updates
3. **Worker Thread Logging**: Each worker logs its thread ID for debugging:
   ```
   [Worker 2] Started processing file: /tmp/abc123/image1.jpg
   [Worker 3] Started processing file: /tmp/abc123/image2.jpg
   ```

## Monitoring Worker Threads

You can monitor active worker threads using system tools:

```bash
# View all Node.js processes and threads
ps -eLf | grep node

# Monitor CPU usage by thread
top -H -p $(pgrep node)

# Real-time process monitoring
htop
```

## Testing Concurrent Uploads

Test the server's ability to handle multiple concurrent uploads:

```bash
# Upload multiple files simultaneously
curl -F "file=@test1.zip" http://localhost:3000/zip &
curl -F "file=@test2.zip" http://localhost:3000/zip &
curl -F "file=@test3.zip" http://localhost:3000/zip &
wait
```

The server logs will show different request IDs and worker thread IDs processing in parallel.

## Architecture

- **Main Thread**: Handles HTTP requests and coordinates worker creation
- **Worker Threads**: Process individual images using Sharp library
- **Shared Memory**: Uses `SharedArrayBuffer` for thread-safe counter updates
- **Mutex**: Ensures atomic updates to prevent race conditions

## Development

```bash
# Run tests
$ pnpm run test

# Run linting
$ pnpm run lint

# Format code
$ pnpm run format
```

$ pnpm run test

# e2e tests

$ pnpm run test:e2e

# test coverage

$ pnpm run test:cov

````

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
````

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
