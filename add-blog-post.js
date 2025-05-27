import http from "http";

async function createRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.headers["Content-Length"] = Buffer.byteLength(
        JSON.stringify(data),
      );
    }

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, body: parsedData });
        } catch (error) {
          console.log(
            "Error parsing response:",
            responseData.substring(0, 100) + "...",
          );
          resolve({ statusCode: res.statusCode, body: responseData });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

const categoryData = {
  name: "Self-Hosting",
  slug: "self-hosting",
  description:
    "Articles about self-hosted services, home servers, and DIY tech solutions.",
};

const blogPostData = {
  title:
    "Building a Home Media Server with Synology NAS, Docker, and Self-Hosted Services",
  slug: "home-media-server-synology-nas-docker",
  excerpt:
    "A comprehensive guide to setting up a powerful home media and productivity ecosystem using a Synology NAS, Docker containers, and various self-hosted services.",
  content: `
# Building a Home Media Server with Synology NAS, Docker, and Self-Hosted Services

In this detailed guide, I'll share my experience setting up a complete home media server and productivity ecosystem using a Synology NAS as the foundation, enhanced with Docker containers for various services.

## Why Self-Host?

Before diving into the technical details, let's consider why self-hosting might be right for you:

- **Privacy**: Keep your data on hardware you own and control
- **Cost efficiency**: One-time hardware purchases versus ongoing subscription fees
- **Customization**: Configure services exactly to your needs
- **Learning opportunity**: Gain practical experience with networking, Linux, and containers
- **Reliability**: No dependency on third-party service availability

## Hardware Setup

My self-hosting journey began with a Synology DS920+ NAS, which offers an excellent balance of performance, expandability, and power efficiency. Key specifications:

- Intel Celeron J4125 quad-core processor
- 8GB RAM (upgraded from the stock 4GB)
- 4 drive bays in RAID 5 configuration using 4TB WD Red Plus drives
- 2 NVMe cache slots with 500GB Samsung 970 EVO Plus drives
- Gigabit Ethernet with Link Aggregation to my UniFi network

## Base Configuration

Before adding services, I configured these fundamental aspects of the Synology:

1. **Network setup**: Static IP assignment, port forwarding for remote access
2. **User accounts**: Creating limited-privilege accounts for different service access
3. **Shared folders**: Organized structure for media, backups, and configuration files
4. **Snapshots and backup**: Regular local snapshots and offsite backups to protect data

## Docker Implementation

Docker transformed how I deploy services on the Synology. Using Docker Compose files for service orchestration provides:

- Isolation between services
- Simplified updates and rollbacks
- Standardized configuration via environment variables
- Easy resource limitation

I use Portainer for Docker management, which provides a clean web interface for monitoring and managing containers.

## Media Services

The core of my home server is a comprehensive media solution:

### Plex Media Server

Plex serves as the primary interface for my media library, offering:

- Automatic metadata fetching for movies and TV shows
- Transcoding for different devices and network conditions
- Watch history synchronization across devices
- Live TV and DVR functionality with an HDHomeRun tuner

### *Arr Suite for Media Management

The automation stack includes:

- **Sonarr**: TV show library management and downloading
- **Radarr**: Movie library management and downloading
- **Lidarr**: Music library management
- **Prowlarr**: Unified indexer management for the other services
- **Bazarr**: Automatic subtitle downloading

### Additional Media Tools

- **Tdarr**: Media transcoding and optimization
- **Jellyfin**: Open-source alternative to Plex with no premium features
- **Audiobookshelf**: Dedicated audiobook server with progress tracking

## Productivity Services

Beyond media, I run several productivity services:

### NextCloud

A self-hosted alternative to services like Dropbox and Google Drive, providing:

- File synchronization across devices
- Calendar and contacts syncing
- Collaborative document editing
- Photo backup and management

### Home Assistant

For home automation, I use Home Assistant to:

- Control smart home devices from various ecosystems
- Create automation routines
- Monitor energy usage
- Integrate with other self-hosted services

### Other Productivity Tools

- **Vaultwarden**: Self-hosted password manager compatible with Bitwarden clients
- **Paperless-ngx**: Document scanning and organization with OCR and tagging
- **Uptime Kuma**: Service monitoring and notifications
- **Gitea**: Self-hosted Git repositories

## Networking and Security

Security is paramount for any self-hosted setup:

- **Reverse proxy**: NGINX Proxy Manager for secure external access
- **Let's Encrypt**: Automatic SSL certificate management
- **Tailscale**: Mesh VPN for secure remote access without opening ports
- **Fail2Ban**: Protection against brute force attempts
- **Automatic updates**: Watchtower container for keeping Docker images updated

## Lessons Learned

Throughout this journey, I've learned several valuable lessons:

1. **Start small**: Begin with one or two services and expand gradually
2. **Document everything**: Keep detailed notes on configurations and changes
3. **Backup configurations**: Store Docker Compose files and environment variables securely
4. **Monitor resources**: Watch CPU, RAM, and disk usage to avoid performance issues
5. **Join communities**: Forums like r/selfhosted and r/homelab provide invaluable support

## Conclusion

Building a self-hosted environment has been both challenging and rewarding. While the initial setup required significant effort, the result is a customized, private, and powerful system that meets my exact needs without ongoing subscription costs.

Whether you're looking to create a simple media server or a comprehensive home cloud, I hope this overview helps you on your self-hosting journey. Feel free to reach out with questions or share your own self-hosting experiences!
  `,
  categoryId: 1,
  featuredImage:
    "https://images.unsplash.com/photo-1586772002345-339f8042a777?q=80&w=1200",
  tags: ["synology", "nas", "docker", "self-hosting", "plex", "home-server"],
  status: "published",
  userId: 1,
};

async function run() {
  try {
    // Login first
    console.log("Logging in...");
    const loginResponse = await createRequest("POST", "/api/login", {
      username: "admin",
      password: "password123",
    });
    console.log("Login response:", loginResponse);

    if (loginResponse.statusCode !== 200) {
      console.error("Login failed");
      return;
    }

    // Create category
    console.log("Creating blog category...");
    const categoryResponse = await createRequest(
      "POST",
      "/api/admin/blog/categories",
      categoryData,
    );
    console.log("Category response:", categoryResponse);

    // Create blog post
    console.log("Creating blog post...");
    const postResponse = await createRequest(
      "POST",
      "/api/admin/blog/posts",
      blogPostData,
    );
    console.log("Post response:", postResponse);

    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
