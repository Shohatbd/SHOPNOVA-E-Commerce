import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext.tsx';
import { initAttribution } from '../../utils/analytics.ts';

/**
 * CustomScriptsInjector
 * Injects Google Tag Manager (GTM), Google Analytics 4 (GA4), Google Ads Conversion Tracking,
 * Meta (Facebook) Pixel, TikTok Pixel, Chatbots, and Custom Header/Footer Scripts.
 */
export const CustomScriptsInjector: React.FC = () => {
  const { settings } = useSettings();

  useEffect(() => {
    // 0. Store settings on window for analytics tracker reference & init attribution
    if (typeof window !== 'undefined') {
      window._shopnova_settings = settings;
      initAttribution();
    }

    // 1. Google Tag Manager (GTM)
    if (settings.gtm_container_id) {
      const gtmId = settings.gtm_container_id.trim();
      if (gtmId && !document.getElementById('gtm-script')) {
        // GTM Head Script
        const gtmScript = document.createElement('script');
        gtmScript.id = 'gtm-script';
        gtmScript.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `;
        document.head.appendChild(gtmScript);

        // GTM Body Noscript
        if (!document.getElementById('gtm-noscript')) {
          const noscript = document.createElement('noscript');
          noscript.id = 'gtm-noscript';
          noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
          document.body.insertBefore(noscript, document.body.firstChild);
        }
      }
    }

    // 2. Google Analytics 4 (GA4) & Google Ads (gtag.js)
    const gaId = settings.google_analytics_id?.trim();
    const gadsId = settings.google_ads_conversion_id?.trim();

    if (gaId || gadsId) {
      const primaryTagId = gaId || gadsId;
      if (!document.getElementById('gtag-base-script')) {
        const script1 = document.createElement('script');
        script1.id = 'gtag-base-script';
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${primaryTagId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.id = 'gtag-init-script';
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
        `;
        document.head.appendChild(script2);
      }

      if (window.gtag) {
        if (gaId) {
          window.gtag('config', gaId, { send_page_view: false });
        }
        if (gadsId) {
          window.gtag('config', gadsId, {
            allow_enhanced_conversions: settings.google_enhanced_conversions_enabled !== '0' && settings.google_enhanced_conversions_enabled !== false
          });
        }
      }
    }

    // 3. Meta (Facebook) Pixel
    if (settings.meta_pixel_id) {
      const pixelId = settings.meta_pixel_id.trim();
      if (pixelId && !document.getElementById('fb-pixel-script')) {
        const fbScript = document.createElement('script');
        fbScript.id = 'fb-pixel-script';
        fbScript.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
        `;
        document.head.appendChild(fbScript);
      }
    }

    // 4. TikTok Pixel (Optional)
    if (settings.tiktok_pixel_id) {
      const ttId = settings.tiktok_pixel_id.trim();
      if (ttId && !document.getElementById('tt-pixel-script')) {
        const ttScript = document.createElement('script');
        ttScript.id = 'tt-pixel-script';
        ttScript.innerHTML = `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${ttId}');
            ttq.page();
          }(window, document, 'ttq');
        `;
        document.head.appendChild(ttScript);
      }
    }

    // 5. Custom Header Scripts / Code
    if (settings.custom_header_code) {
      let customHeaderEl = document.getElementById('custom-header-container');
      if (!customHeaderEl) {
        customHeaderEl = document.createElement('div');
        customHeaderEl.id = 'custom-header-container';
        customHeaderEl.style.display = 'none';
        document.head.appendChild(customHeaderEl);
      }
      if (customHeaderEl.innerHTML !== settings.custom_header_code) {
        customHeaderEl.innerHTML = settings.custom_header_code;
      }
    }

    // 6. Custom Footer / Body / Chatbot Scripts (e.g. Crisp, Tawk.to, Messenger)
    if (settings.custom_footer_code) {
      let customFooterEl = document.getElementById('custom-footer-container');
      if (!customFooterEl) {
        customFooterEl = document.createElement('div');
        customFooterEl.id = 'custom-footer-container';
        customFooterEl.style.display = 'none';
        document.body.appendChild(customFooterEl);
      }
      if (customFooterEl.innerHTML !== settings.custom_footer_code) {
        customFooterEl.innerHTML = settings.custom_footer_code;
      }
    }

    // Clean up any legacy DOM node
    const existingWa = document.getElementById('floating-wa-btn');
    if (existingWa) existingWa.remove();
  }, [settings]);

  return null;
};
