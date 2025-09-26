# Blast Energy - Vercel Deployment Guide

## ✅ Static Site Ready for Vercel

The complete Blast Energy website is now in the root directory and ready for Vercel deployment.

### What's Included:
- ✅ Complete Blast Energy website with all features
- ✅ Google Analytics (G-FPK7PEXD70) integrated
- ✅ Transparent/shrinking header
- ✅ Contact form with EmailJS integration
- ✅ Responsive design
- ✅ All images and assets
- ✅ HERA certificate integration
- ✅ Jast Design partnership section

### Vercel Deployment Steps:

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import project from GitHub: `BLAST-ENERGY/blast-energy`
   - Vercel will auto-detect the `vercel.json` configuration
   - Deploy!

3. **Configuration**:
   - The `vercel.json` file is configured to:
     - Use root directory (`.`) as the output directory
     - Serve all routes through `index.html` (SPA routing)
     - Skip build process (static files)

### Environment Variables (Optional):
If you want to add email functionality later, set these in Vercel:
- `SMTP_HOST=smtp.hostinger.com`
- `SMTP_PORT=465`
- `SMTP_USER=info@blastenergy.com.au`
- `SMTP_PASS=your-app-password`
- `OWNER_EMAIL=info@blastenergy.com.au`
- `BCCEMAIL=info@blastenergy.com.au` (optional - BCC copy of customer emails)

### Custom Domain:
- Add your custom domain in Vercel dashboard
- Update DNS records as instructed by Vercel

### Testing:
- The site has been tested locally and all features work
- Google Analytics is properly integrated
- Contact form is functional (with EmailJS)
- All responsive features work correctly

## Gatsby Build Issues:
The Gatsby build has Node.js compatibility issues (Node v23 vs Gatsby requirements). The static backup is the recommended approach for deployment.

## Next Steps:
1. Deploy to Vercel using the root directory files
2. Set up custom domain
3. Configure email server (optional)
4. Monitor Google Analytics
