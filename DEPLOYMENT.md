# 🚀 Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables ✅

Ensure you have these set in your deployment platform:

```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adaptlearn
JWT_SECRET=long-random-string-minimum-32-characters
GEMINI_API_KEY=your-production-gemini-api-key
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

**Security Notes:**
- Use a **long, random JWT secret** (32+ characters)
- Use **MongoDB Atlas** for production (not local MongoDB)
- Store secrets in your platform's secret manager (not in code)

### 2. Database Setup ✅

**MongoDB Atlas (Recommended):**
1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add your deployment platform's IPs to the whitelist
3. Create a database user with read/write permissions
4. Copy the connection string to `MONGODB_URI`

### 3. Google Gemini API ✅

1. Get your API key at [Google AI Studio](https://makersuite.google.com/)
2. Verify you have credits or billing enabled
3. Set rate limits if needed
4. Add to `GEMINI_API_KEY`

---

## Deployment Options

### Option 1: Vercel (Easiest) ⭐

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/adaptlearn.git
git push -u origin main
```

**Step 2: Import to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NEXTAUTH_URL` (will be provided by Vercel)
   - `NODE_ENV=production`

**Step 3: Deploy**
- Click "Deploy"
- Vercel automatically builds and deploys
- Your app is live at `https://your-project.vercel.app`

**Benefits:**
- ✅ Zero configuration
- ✅ Auto HTTPS
- ✅ Edge network (fast globally)
- ✅ Auto-scaling
- ✅ Git integration (auto-deploy on push)

---

### Option 2: Railway

**Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

**Step 2: Create Project**
```bash
railway init
railway add
```

**Step 3: Set Environment Variables**
```bash
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set GEMINI_API_KEY="your-gemini-key"
railway variables set NODE_ENV="production"
```

**Step 4: Deploy**
```bash
railway up
```

---

### Option 3: Netlify

**Step 1: Build Settings**
- Build command: `npm run build`
- Publish directory: `.next`

**Step 2: Configure netlify.toml**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Step 3: Environment Variables**
Add all environment variables in Netlify dashboard.

**Step 4: Deploy**
```bash
git push origin main
```

---

### Option 4: DigitalOcean App Platform

**Step 1: Create App**
- Connect GitHub repo
- Select "Web Service"
- Framework: Next.js

**Step 2: Build Settings**
- Build command: `npm run build`
- Run command: `npm start`
- HTTP Port: 3000

**Step 3: Environment Variables**
Add all required variables in the dashboard.

**Step 4: Deploy**
Click "Deploy"

---

### Option 5: AWS (Advanced)

**Using AWS Amplify:**
1. Connect GitHub repo
2. Set build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
3. Add environment variables
4. Deploy

---

### Option 6: Self-Hosted (VPS)

**Requirements:**
- Ubuntu 20.04+ server
- Node.js 18+
- PM2 process manager
- Nginx (reverse proxy)

**Step 1: Install Dependencies**
```bash
# On your server
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

**Step 2: Clone and Build**
```bash
git clone https://github.com/yourusername/adaptlearn.git
cd adaptlearn
npm install
npm run build
```

**Step 3: Create .env.local**
```bash
cat > .env.local << EOF
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
EOF
```

**Step 4: Start with PM2**
```bash
pm2 start npm --name "adaptlearn" -- start
pm2 save
pm2 startup
```

**Step 5: Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Step 6: Enable HTTPS**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Post-Deployment Checklist

### 1. Test Core Functionality ✅

- [ ] Landing page loads
- [ ] Sign up works
- [ ] Sign in works
- [ ] Create course (AI quiz generation)
- [ ] Complete quiz (AI analysis)
- [ ] View roadmap
- [ ] Load module content
- [ ] AI tutor chat
- [ ] Complete module
- [ ] Dashboard shows progress

### 2. Monitor Performance ✅

**Vercel Dashboard:**
- Check build logs
- Monitor function invocations
- Check bandwidth usage

**MongoDB Atlas:**
- Monitor connection count
- Check query performance
- Set up alerts

**Gemini API:**
- Check usage quotas
- Monitor rate limits
- Review costs

### 3. Set Up Monitoring (Optional)

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs
```

**Analytics:**
- Google Analytics
- Vercel Analytics
- PostHog (open source)

---

## Environment-Specific Configurations

### Development
```env
MONGODB_URI=mongodb://localhost:27017/adaptlearn
JWT_SECRET=dev-secret-key
GEMINI_API_KEY=your-dev-key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### Staging
```env
MONGODB_URI=mongodb+srv://staging-cluster...
JWT_SECRET=staging-secret-key
GEMINI_API_KEY=your-staging-key
NEXTAUTH_URL=https://staging.yourdomain.com
NODE_ENV=production
```

### Production
```env
MONGODB_URI=mongodb+srv://prod-cluster...
JWT_SECRET=super-secure-production-key
GEMINI_API_KEY=your-prod-key
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Troubleshooting

### Build Fails

**Error: Cannot find module**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: Type errors**
- Check `tsconfig.json` is correct
- Run `npm run lint` locally first

### Runtime Errors

**MongoDB connection failed**
- Verify `MONGODB_URI` is correct
- Check IP whitelist in Atlas
- Ensure database user has permissions

**Gemini API errors**
- Verify API key is valid
- Check quota limits
- Review rate limiting

**Authentication issues**
- Ensure `JWT_SECRET` is set
- Check `NEXTAUTH_URL` matches deployment URL
- Verify cookies are enabled

---

## Scaling Considerations

### Database Scaling
- **Sharding**: For 100k+ users
- **Read Replicas**: For read-heavy workloads
- **Indexes**: On `userId`, `courseId` fields

### AI API Scaling
- **Caching**: Cache generated content
- **Rate Limiting**: Implement user-level limits
- **Queue System**: For background processing

### Application Scaling
- **CDN**: For static assets
- **Redis**: For session storage
- **WebSockets**: For real-time features

---

## Backup Strategy

### MongoDB Backups
```bash
# Manual backup
mongodump --uri="your-mongodb-uri" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="your-mongodb-uri" /backup/20240101
```

**Atlas Automatic Backups:**
- Enable in Atlas dashboard
- Set retention policy (7-365 days)
- Test restore procedure

### Code Backups
- Git repository (primary)
- GitHub (remote backup)
- Local clones (developer machines)

---

## Security Checklist

### Pre-Launch
- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS enabled
- [ ] Environment variables not in code
- [ ] MongoDB user has minimal permissions
- [ ] Rate limiting enabled (optional)
- [ ] CORS configured correctly
- [ ] XSS protection enabled
- [ ] SQL injection protection (Mongoose handles this)

### Post-Launch
- [ ] Monitor error logs
- [ ] Review API usage
- [ ] Check for suspicious activity
- [ ] Regular security updates
- [ ] Backup verification

---

## Cost Estimation

### Free Tier (Hobby Projects)
- **Vercel**: Free for personal projects
- **MongoDB Atlas**: 512 MB free tier
- **Gemini API**: Free tier (limited requests)
- **Total**: $0/month

### Starter (Small App)
- **Vercel Pro**: $20/month
- **MongoDB Atlas M10**: $57/month
- **Gemini API**: ~$10-50/month
- **Total**: ~$100/month

### Production (1000+ users)
- **Vercel Enterprise**: Custom
- **MongoDB Atlas M30**: $300+/month
- **Gemini API**: $100-500/month
- **CDN/Caching**: $50/month
- **Total**: ~$500-1000/month

---

## Domain & DNS Setup

### Custom Domain

**Vercel:**
1. Go to project settings → Domains
2. Add your domain (e.g., `adaptlearn.ai`)
3. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

**Cloudflare (Recommended):**
- Free SSL
- DDoS protection
- CDN included
- Analytics

---

## Continuous Deployment

### Auto-Deploy on Git Push

**main branch → Production**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/actions@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

**develop branch → Staging**
- Same workflow, different environment

---

## Support & Maintenance

### Monitoring
- Set up uptime monitoring (e.g., UptimeRobot)
- Configure error alerts (Sentry)
- Monitor API quotas

### Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Major version updates
npm install package@latest
```

### Logs
```bash
# Vercel
vercel logs

# PM2
pm2 logs adaptlearn

# MongoDB Atlas
# Check in dashboard
```

---

## 🎉 You're Ready to Deploy!

Choose your platform, follow the steps, and your AdaptLearn AI platform will be live.

**Recommended for beginners:** Start with Vercel (easiest, free tier available)

**Questions?** Check the troubleshooting section or review the main README.md
