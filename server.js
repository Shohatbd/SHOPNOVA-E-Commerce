// SHOPHATBD Native CPanel Production Server
const express = require('express');
const path = require('path');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SHOPHATBD Production Live Server',
    node_version: process.version,
    timestamp: new Date().toISOString()
  });
});

// Serve frontend assets if available
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'public');

app.use(express.static(distPath, { maxAge: '1d' }));
app.use(express.static(publicPath, { maxAge: '1d' }));

// On-demand SPA Fallback with full SHOPHATBD Web Engine
app.get('*', (req, res) => {
  const fs = require('fs');
  const distIndex = path.join(distPath, 'index.html');
  
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  
  // High-performance direct renderer if dist is not compiled
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SHOPHATBD | বাংলাদেশের বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>body { font-family: 'Hind Siliguri', sans-serif; }</style>
</head>
<body class="bg-gray-50 text-gray-800">
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-emerald-700 text-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-2xl font-black tracking-wider text-amber-300">SHOPHATBD</span>
        </div>
        <div class="flex-1 max-w-lg mx-6 hidden md:block">
          <input type="text" placeholder="পণ্য খুঁজুন (যেমন: টি-শার্ট, জুতো, ওয়াচ)..." class="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none" />
        </div>
        <div class="flex items-center space-x-4">
          <a href="/login" class="bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded-lg font-medium text-sm">লগইন</a>
          <a href="/cart" class="bg-amber-400 hover:bg-amber-500 text-emerald-950 px-4 py-2 rounded-lg font-bold text-sm">কার্ট (০)</a>
        </div>
      </div>
    </header>

    <!-- Hero Banner -->
    <main class="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
      <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 md:p-12 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <span class="bg-amber-400 text-emerald-950 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 inline-block">সেরা অফার ও ডিসকাউন্ট</span>
          <h1 class="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">শপহ্যাটবিডিতে আপনাকে স্বাগতম!</h1>
          <p class="text-emerald-100 text-lg mb-6 max-w-xl">সেরা কোয়ালিটির লাইফস্টাইল, ফ্যাশন ও গ্যাজেট সামগ্রী কিনুন ক্যাশ অন ডেলিভারিতে সবচেয়ে দ্রুততম সময়ে।</p>
          <a href="#products" class="bg-white text-emerald-800 font-bold px-6 py-3 rounded-xl shadow hover:bg-gray-100 transition inline-block">কেনাকাটা শুরু করুন &rarr;</a>
        </div>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
          <div class="text-2xl mb-2">🚚</div>
          <h3 class="font-bold text-gray-800">সারা দেশে হোম ডেলিভারি</h3>
          <p class="text-xs text-gray-500 mt-1">সবচেয়ে দ্রুততম ডেলিভারি</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
          <div class="text-2xl mb-2">💵</div>
          <h3 class="font-bold text-gray-800">ক্যাশ অন ডেলিভারি</h3>
          <p class="text-xs text-gray-500 mt-1">পণ্য হাতে পেয়ে পেমেন্ট</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
          <div class="text-2xl mb-2">🔄</div>
          <h3 class="font-bold text-gray-800">সহজ রিটার্ন পলিসি</h3>
          <p class="text-xs text-gray-500 mt-1">৭ দিনের মানি-ব্যাক গ্যারান্টি</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
          <div class="text-2xl mb-2">🛡️</div>
          <h3 class="font-bold text-gray-800">১০০% অরিজিনাল পণ্য</h3>
          <p class="text-xs text-gray-500 mt-1">কোয়ালিটি নিশ্চিতকৃত</p>
        </div>
      </div>

      <!-- Products Section -->
      <div id="products">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">জনপ্রিয় পণ্যসমূহ</h2>
          <span class="text-emerald-700 font-semibold text-sm cursor-pointer">সবগুলো দেখুন &rarr;</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div class="h-48 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60" alt="T-Shirt" class="h-full w-full object-cover" />
            </div>
            <div class="p-4">
              <h4 class="font-bold text-gray-800 line-clamp-1">প্রিমিয়াম কটন ক্যাজুয়াল টি-শার্ট</h4>
              <div class="flex items-center justify-between mt-3">
                <span class="text-emerald-700 font-black text-lg">৳ ৪৯০</span>
                <button class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">অর্ডার করুন</button>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div class="h-48 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" alt="Watch" class="h-full w-full object-cover" />
            </div>
            <div class="p-4">
              <h4 class="font-bold text-gray-800 line-clamp-1">স্মার্ট ওয়াটারপ্রুফ ব্লুটুথ ওয়াচ</h4>
              <div class="flex items-center justify-between mt-3">
                <span class="text-emerald-700 font-black text-lg">৳ ১,৪৫০</span>
                <button class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">অর্ডার করুন</button>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div class="h-48 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" alt="Headphone" class="h-full w-full object-cover" />
            </div>
            <div class="p-4">
              <h4 class="font-bold text-gray-800 line-clamp-1">ওয়্যারলেস ডিপ ব্যাস হেডফোন</h4>
              <div class="flex items-center justify-between mt-3">
                <span class="text-emerald-700 font-black text-lg">৳ ৯৯০</span>
                <button class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">অর্ডার করুন</button>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div class="h-48 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60" alt="Shoes" class="h-full w-full object-cover" />
            </div>
            <div class="p-4">
              <h4 class="font-bold text-gray-800 line-clamp-1">স্টাইলিশ স্পোর্টস রানিং স্নিকার্স</h4>
              <div class="flex items-center justify-between mt-3">
                <span class="text-emerald-700 font-black text-lg">৳ ১,৭৫০</span>
                <button class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">অর্ডার করুন</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-8 mt-auto border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-white font-bold text-lg mb-2">SHOPHATBD.COM</p>
        <p class="text-sm">সর্বস্বত্ব সংরক্ষিত &copy; ${new Date().getFullYear()} - শপহ্যাটবিডি</p>
      </div>
    </footer>
  </div>
</body>
</html>`);
});

// Important: cPanel Phusion Passenger hook
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}

// Start server
app.listen(PORT, () => {
  console.log('SHOPHATBD Live on port', PORT);
});

module.exports = app;
