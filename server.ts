import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { initDatabase, query, queryOne } from './server/db/db.ts';

import authRoutes from './server/routes/authRoutes.ts';
import productRoutes from './server/routes/productRoutes.ts';
import categoryRoutes from './server/routes/categoryRoutes.ts';
import orderRoutes from './server/routes/orderRoutes.ts';
import paymentRoutes from './server/routes/paymentRoutes.ts';
import courierRoutes from './server/routes/courierRoutes.ts';
import couponRoutes from './server/routes/couponRoutes.ts';
import reviewRoutes from './server/routes/reviewRoutes.ts';
import analyticsRoutes from './server/routes/analyticsRoutes.ts';
import settingsRoutes from './server/routes/settingsRoutes.ts';
import bannerRoutes from './server/routes/bannerRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import smsRoutes from './server/routes/smsRoutes.ts';
import contactRoutes from './server/routes/contactRoutes.ts';
import aiChatRoutes from './server/routes/aiChatRoutes.ts';
import subscribersRoutes from './server/routes/subscribersRoutes.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Gzip Compression for fast server responses
  app.use(compression());

  // JSON Body Parser with size allowance
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize SQLite Relational Database & Seed Data
  await initDatabase();

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SHOPNOVA Full-Stack E-Commerce API',
      timestamp: new Date().toISOString()
    });
  });

  // Dynamic XML Sitemap for Google Search Console & SEO Crawlers
  app.get('/sitemap.xml', (req, res) => {
    try {
      const canonicalBase =
        queryOne<any>('SELECT value FROM site_settings WHERE key = "canonical_base_url"')?.value ||
        queryOne<any>('SELECT value FROM site_settings WHERE key = "canonical_url"')?.value ||
        process.env.APP_URL ||
        `${req.protocol}://${req.get('host')}`;

      const baseUrl = canonicalBase.replace(/\/+$/, '');

      const products = query<any>('SELECT id, slug, name_en, thumbnail, updated_at FROM products WHERE is_published = 1');
      const categories = query<any>('SELECT id, slug, name_en, updated_at FROM categories WHERE is_active = 1');

      const staticPages = [
        { path: '', priority: '1.0', changefreq: 'daily' },
        { path: '/shop', priority: '0.9', changefreq: 'daily' },
        { path: '/about', priority: '0.6', changefreq: 'monthly' },
        { path: '/contact', priority: '0.7', changefreq: 'monthly' },
        { path: '/shipping-policy', priority: '0.5', changefreq: 'monthly' },
        { path: '/refund-policy', priority: '0.5', changefreq: 'monthly' },
        { path: '/terms', priority: '0.4', changefreq: 'yearly' },
        { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
        { path: '/faq', priority: '0.6', changefreq: 'monthly' }
      ];

      const now = new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

      // 1. Static Pages
      for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
      }

      // 2. Categories
      for (const cat of categories) {
        const catLastMod = cat.updated_at ? cat.updated_at.split(' ')[0] : now;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/shop?category=${encodeURIComponent(cat.slug || cat.id)}</loc>\n`;
        xml += `    <lastmod>${catLastMod}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }

      // 3. Products with Images
      for (const prod of products) {
        const prodLastMod = prod.updated_at ? prod.updated_at.split(' ')[0] : now;
        const prodSlug = prod.slug || prod.id;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/product/${encodeURIComponent(prodSlug)}</loc>\n`;
        xml += `    <lastmod>${prodLastMod}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        if (prod.thumbnail) {
          const imgUrl = prod.thumbnail.startsWith('http') ? prod.thumbnail : `${baseUrl}${prod.thumbnail.startsWith('/') ? '' : '/'}${prod.thumbnail}`;
          xml += `    <image:image>\n`;
          xml += `      <image:loc>${imgUrl.replace(/&/g, '&amp;')}</image:loc>\n`;
          xml += `      <image:title>${(prod.name_en || '').replace(/[<>&'"]/g, '')}</image:title>\n`;
          xml += `    </image:image>\n`;
        }
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(xml);
    } catch (err) {
      console.error('Sitemap generation error:', err);
      res.status(500).setHeader('Content-Type', 'text/plain').send('Error generating sitemap');
    }
  });

  // Dynamic Robots.txt
  app.get('/robots.txt', (req, res) => {
    try {
      const isIndexingEnabled = queryOne<any>('SELECT value FROM site_settings WHERE key = "google_index_enabled"')?.value !== '0';
      const canonicalBase =
        queryOne<any>('SELECT value FROM site_settings WHERE key = "canonical_base_url"')?.value ||
        queryOne<any>('SELECT value FROM site_settings WHERE key = "canonical_url"')?.value ||
        process.env.APP_URL ||
        `${req.protocol}://${req.get('host')}`;

      const baseUrl = canonicalBase.replace(/\/+$/, '');

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      if (!isIndexingEnabled) {
        res.send(`User-agent: *\nDisallow: /\n`);
        return;
      }

      const robots = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`
      ].join('\n');

      res.status(200).send(robots);
    } catch (err) {
      res.status(200).setHeader('Content-Type', 'text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n');
    }
  });

  // Mount API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/couriers', courierRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/sms', smsRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/chat', aiChatRoutes);
  app.use('/api/subscribers', subscribersRoutes);

  // Vite middleware for development vs Static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        etag: true
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SHOPNOVA server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SHOPNOVA server:', err);
});
