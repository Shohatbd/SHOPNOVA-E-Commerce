export interface PolicyLinkItem {
  id: string;
  title: string;
  title_bn: string;
  path: string;
  icon?: string;
  is_active?: boolean;
  short_description_bn?: string;
  short_description_en?: string;
  description_bn?: string;
  description_en?: string;
}

export const countWords = (text: string = ''): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const DEFAULT_STORE_POLICIES: PolicyLinkItem[] = [
  {
    id: 'shipping-policy',
    title: 'Shipping & Delivery Policy',
    title_bn: 'ডেলিভারি ও শিপিং পলিসি',
    path: 'shipping-policy',
    icon: 'truck',
    is_active: true,
    description_bn: `১. ডেলিভারি এলাকা ও সময়সীমা:
আমরা সমগ্র বাংলাদেশে বিশ্বস্ত লজিস্টিকস পার্টনারদের (Pathao, Steadfast, RedX) মাধ্যমে দ্রুত ও নিরাপদ হোম ডেলিভারি প্রদান করে থাকি।
• ঢাকা সিটি কর্পোরেশন এলাকা: অর্ডার নিশ্চিতকরণের ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়।
• ঢাকার বাইরে (সকল ৬৪ জেলা ও উপজেলা): ৪৮ থেকে ৭২ ঘণ্টার মধ্যে সরাসরি আপনার দরজায় পার্সেল পৌঁছে দেওয়া হয়।

২. ডেলিভারি চার্জের বিবরণ:
• ঢাকা সিটির ভেতরে ডেলিভারি চার্জ মাত্র ৬০ টাকা।
• ঢাকার বাইরে সমগ্র বাংলাদেশে ডেলিভারি চার্জ ১২০ টাকা।
• বিশেষ অফার: যেকোনো ২৫০০ টাকা বা তার বেশি মূল্যের অর্ডারে সম্পূর্ণ ফ্রি হোম ডেলিভারি সুবিধা প্রযোজ্য।

৩. ক্যাশ অন ডেলিভারি (COD) ও লাইভ পার্সেল ট্র্যাকিং:
• গ্রাহকদের সর্বোচ্চ নিরাপত্তা ও আস্থার জন্য আমরা সারাদেশে ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ) সুবিধা দিচ্ছি।
• পার্সেল ডিসপ্যাচ হওয়ার সাথে সাথে গ্রাহকের মোবাইলে একটি এসএমএস এবং ট্র্যাকিং লিঙ্ক পাঠানো হয়, যার মাধ্যমে লাইভ পার্সেলের অবস্থান সহজে ট্র্যাক করা যায়।

৪. ডেলিভারি গ্রহণ ও চেকিং সংক্রান্ত নির্দেশনা:
ডেলিভারিম্যানের উপস্থিতিতে পার্সেল খুলে সঠিক পণ্য ও অক্ষত অবস্থা যাচাই করে নেওয়ার জন্য বিশেষভাবে অনুরোধ করা হচ্ছে। কোনো প্রকার অসঙ্গতি বা ত্রুটি দেখা দিলে তাৎক্ষণিকভাবে পার্সেল গ্রহণ না করে আমাদের হটলাইনে যোগাযোগ করুন।`,
    description_en: `1. Delivery Coverage & Timelines:
We provide fast, reliable door-to-door delivery across all 64 districts of Bangladesh through top-tier logistics partners (Pathao, Steadfast, RedX).
• Inside Dhaka City: Orders are delivered within 24 to 48 hours following telephone confirmation.
• Outside Dhaka (all districts and sub-districts): Doorstep delivery completed within 48 to 72 hours.

2. Shipping Charges:
• Inside Dhaka City: Standard flat delivery fee of ৳60.
• Outside Dhaka: Standard flat delivery fee of ৳120.
• Free Delivery Promotion: Automatically applied on all orders totaling ৳2,500 and above.

3. Cash on Delivery (COD) & Real-time Tracking:
• Nationwide Cash on Delivery is available across all metropolitan and rural locations, allowing you to inspect your package and pay upon arrival.
• Once your parcel is dispatched from our fulfillment hub, a consignment tracking number and live status link are sent via SMS.

4. Parcel Inspection Upon Receipt:
We strongly encourage customers to check their parcel in front of the delivery courier. Should there be any packaging damage, wrong variant, or defect, kindly notify our customer hotline immediately.`
  },
  {
    id: 'refund-policy',
    title: 'Return & Refund Policy',
    title_bn: 'রিটার্ন ও রিফান্ড নীতি',
    path: 'refund-policy',
    icon: 'rotate-ccw',
    is_active: true,
    description_bn: `১. ৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ সুবিধা:
গ্রাহক সন্তুষ্টিই আমাদের সর্বোচ্চ অঙ্গীকার। পণ্য গ্রহণের পর সাইজ সংক্রান্ত সমস্যা, ভুল পণ্য অথবা কোনো উৎপাদনজনিত ত্রুটি পরিলক্ষিত হলে ডেলিভারির তারিখ থেকে ৭ (সাত) দিনের মধ্যে রিটার্ন বা এক্সচেঞ্জের আবেদন করতে পারবেন।

২. রিটার্ন গ্রহণের প্রযোজ্য শর্তাবলী:
• পণ্যটি অবশ্যই অব্যবহৃত, অপ্রক্ষালিত এবং মূল প্যাকেজিং, ব্র্যান্ড ট্যাগ ও ইনভয়েসসহ অক্ষত অবস্থায় থাকতে হবে।
• কোনো প্রকার দাগ, ছেঁড়া, ঘ্রাণযুক্ত বা কৃত্রিমভাবে ক্ষতিগ্রস্ত পণ্য রিটার্ন হিসেবে গণ্য হবে না।
• ইলেকট্রনিক্স বা গ্যাজেটের ক্ষেত্রে আসল বক্স, ওয়ারেন্টি কার্ড এবং আনুষঙ্গিক সকল অ্যাক্সেসরিজ সাথে থাকতে হবে।

৩. এক্সচেঞ্জ ও রিপ্লেসমেন্ট প্রক্রিয়া:
আমাদের কাস্টমার কেয়ার হেল্পলাইনে (+880 1700-000000) অথবা ফেসবুক পেজে যোগাযোগ করে আপনার অর্ডার নম্বর ও সমস্যার স্পষ্ট ছবি/ভিডিও পাঠান। আমাদের টিম সর্বোচ্চ ২৪ ঘণ্টার মধ্যে রিপ্লেসমেন্ট পার্সেল প্রসেস করবে।

৪. রিফান্ড ও মূল্য ফেরত নীতি:
• রিটার্নকৃত পণ্য আমাদের ওয়্যারহাউসে পৌঁছানো ও কোয়ালিটি চেকিং সম্পন্ন হওয়ার পর ৩ থেকে ৫ কার্যদিবসের মধ্যে রিফান্ড প্রদান করা হয়।
• রিফান্ডের অর্থ আপনার বিকাশ, নগদ অথবা ব্যাংক অ্যাকাউন্টে সরাসরি পৌঁছে যাবে। ডেলিভারি চার্জ ব্যতীত পণ্যের সম্পূর্ণ মূল্য ফেরত দেওয়া হবে।`,
    description_en: `1. 7-Day Hassle-Free Return & Exchange:
Customer satisfaction is our highest priority. If you encounter sizing mismatch, manufacturing defects, or wrong item delivery, you may request an exchange or return within 7 calendar days of receipt.

2. Eligibility Criteria for Returns:
• The product must remain unused, unwashed, and in pristine original condition with all brand tags, labels, and packaging intact.
• Products with visible wear, stains, altered tags, perfumes, or cosmetic damages are not eligible for return.
• For gadgets and smart accessories, all original packaging boxes, warranty slips, and included cables must be returned complete.

3. Return & Exchange Procedure:
Reach out to our customer support team via hotline or official WhatsApp/Facebook with your Order ID and photo/video proof. We arrange hassle-free pickup and rapid replacement dispatch.

4. Refund Execution & Reimbursement:
• Once received and verified by our quality control center, approved refunds are disbursed within 3 to 5 business days.
• Funds are credited directly via bKash, Nagad, original card payment, or bank transfer as per customer preference.`
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    title_bn: 'ব্যবহারের শর্তাবলী',
    path: 'terms',
    icon: 'file-text',
    is_active: true,
    description_bn: `১. সাধারণ ব্যবহারের চুক্তি:
এই ওয়েবসাইটে প্রবেশ, ব্রাউজ করা কিংবা অর্ডার প্রদানের মাধ্যমে আপনি আমাদের সকল নিয়ম ও নীতিমালার প্রতি সম্মতি জ্ঞাপন করছেন। সকল পণ্য ও সেবামূল্য বাংলাদেশি টাকায় (BDT) নির্ধারিত এবং সরকারি ভ্যাট অন্তর্ভুক্ত।

২. অর্ডার নিশ্চিতকরণ ও স্টক প্রাপ্যতা:
সকল অর্ডার স্টকের প্রাপ্যতা এবং গ্রাহকের দেওয়া মোবাইল নম্বর ও ঠিকানার সত্যতা যাচাইকরণের সাপেক্ষে নিশ্চিত করা হয়। কোনো অনিবার্য কারণে পণ্যের স্টক শেষ হয়ে গেলে গ্রাহককে তাৎক্ষণিকভাবে অবহিত করে বিকল্প পণ্য প্রদান অথবা অর্ডার বাতিল করার অধিকার কর্তৃপক্ষ সংরক্ষণ করে।

৩. মূল্য নির্ধারণ ও বিশেষ ক্যাম্পেইন:
ওয়েবসাইটে প্রদর্শিত যেকোনো পণ্যের মূল্য বা ডিসকাউন্ট অফার পূর্ব নোটিশ ছাড়াই পরিবর্তনযোগ্য। তবে গ্রাহক কর্তৃক ইতিমধ্যে সফলভাবে নিশ্চিতকৃত অর্ডারের ক্ষেত্রে চেকআউটের সময় সম্মত মূল্যই কার্যকর থাকবে।

৪. মেধা সম্পত্তি ও ব্র্যান্ড স্বত্বাধিকার:
ওয়েবসাইটে ব্যবহৃত সকল লোগো, গ্রাফিক্স, ছবি, কন্টেন্ট এবং ডিজাইন শপনোভা-এর অনন্য স্বত্বাধিকারভুক্ত। লিখিত অনুমতি ব্যতীত কোনো বাণিজ্যিক উদ্দেশ্যে এগুলোর নকল, ডাউনলোড বা পুনঃব্যবহার আইনত দণ্ডনীয় অপরাধ।`,
    description_en: `1. General Terms of Agreement:
By accessing this website, placing an order, or utilizing our services, you agree to be bound by these legal terms. All prices are stated in Bangladeshi Taka (BDT) inclusive of statutory government taxes.

2. Order Confirmation & Stock Availability:
All orders are subject to inventory verification and fraud screening. In the rare event an item becomes unavailable post-order, our support team will promptly reach out to offer a suitable replacement or order cancellation.

3. Pricing, Campaigns & Promotions:
Prices and promotional campaigns displayed on the website are subject to modification without prior notice. Confirmed orders will honor the price agreed upon at the time of checkout.

4. Intellectual Property & Trademarks:
All brand imagery, graphics, typography, copywriting, and software systems are the exclusive intellectual property of the store and protected under applicable trademark and copyright laws.`
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    title_bn: 'সাধারণ জিজ্ঞাসা ও উত্তর',
    path: 'faq',
    icon: 'help',
    is_active: true,
    description_bn: `১. আমি কিভাবে ওয়েবসাইটে অর্ডার করব?
পছন্দের পণ্যটি নির্বাচন করুন, সাইজ ও কালার সিলেক্ট করে "Add to Cart" অথবা "Buy Now" বাটনে ক্লিক করুন। এরপর আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিয়ে ক্যাশ অন ডেলিভারি অথবা বিকাশ নির্বাচন করে অর্ডার সম্পন্ন করুন।

২. ডেলিভারি পেতে কতদিন সময় লাগবে?
ঢাকা সিটিতে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে সমগ্র বাংলাদেশের ৬৪ জেলায় ৪৮ থেকে ৭২ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়।

৩. পণ্য হাতে পেয়ে কি টাকা দেওয়া যাবে (ক্যাশ অন ডেলিভারি)?
হ্যাঁ! সমগ্র বাংলাদেশে আমাদের ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।

৪. সাইজ বা ফিটিং না মিললে কি পরিবর্তন করা যাবে?
অবশ্যই! ডেলিভারি গ্রহণের ৭ দিনের মধ্যে আপনি যেকোনো পণ্যের সাইজ বা মডেল ঝামেলামুক্তভাবে এক্সচেঞ্জ করতে পারবেন।

৫. কোনো প্রশ্ন বা সমস্যায় কিভাবে যোগাযোগ করব?
আমাদের হটলাইন নম্বরে কল করতে পারেন অথবা ফেসবুক মেসেঞ্জারে সরাসরি চ্যাট করতে পারেন। আমাদের কাস্টমার কেয়ার টিম দ্রুত সমাধান দেবে।`,
    description_en: `1. How do I place an order?
Select your preferred item, pick your required size and color, click 'Add to Cart' or 'Buy Now', provide your delivery details, and select Cash on Delivery or bKash to confirm.

2. What are the delivery timeframes?
Orders within Dhaka City are fulfilled within 24 to 48 hours. Nationwide deliveries across all 64 districts take 48 to 72 hours.

3. Is Cash on Delivery (COD) available?
Yes! 100% Cash on Delivery is available across all 64 districts in Bangladesh, enabling you to inspect your parcel before payment.

4. Can I exchange an item if the size does not fit?
Yes! We offer a straightforward 7-day exchange window for sizing and variant replacements.

5. How can I reach customer support?
Reach out to our customer care team via phone helpline or Facebook Messenger for swift assistance.`
  },
  {
    id: 'track',
    title: 'Live Order Tracking Portal',
    title_bn: 'লাইভ অর্ডার ট্র্যাকিং',
    path: 'track',
    icon: 'map-pin',
    is_active: true,
    description_bn: `আপনার অর্ডারের বর্তমান অবস্থান জানতে অর্ডার নম্বর ও ফোন নম্বর প্রদান করুন। আমাদের সিস্টেম কুরিয়ার পার্টনারদের লাইভ স্ট্যাটাস প্রদর্শন করবে।`,
    description_en: `Enter your Order ID and phone number to track your parcel status in real-time with our courier logistics partners.`
  }
];

export const DEFAULT_PRIVACY_POLICY: PolicyLinkItem = {
  id: 'privacy',
  title: 'Privacy Policy',
  title_bn: 'গোপনীয়তা ও ডাটা পলিসি',
  path: 'privacy',
  icon: 'shield',
  is_active: true,
  short_description_en: 'We prioritize your personal data security and privacy through robust 256-bit encryption.',
  short_description_bn: 'আমরা আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা ও আধুনিক এনক্রিপশন প্রযুক্তিতে প্রতিশ্রুতিবদ্ধ।',
  description_bn: `১. ব্যক্তিগত তথ্যের সুরক্ষা:
আমরা আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা ও গোপনীয়তা রক্ষা করতে অঙ্গীকারবদ্ধ। আপনার নাম, মোবাইল নম্বর, ইমেইল এবং ডেলিভারি ঠিকানা শুধুমাত্র আপনার অর্ডার প্রসেসিং ও পার্সেল প্রেরণের উদ্দেশ্যে সংগ্রহ করা হয়।

২. পেমেন্ট ও আর্থিক তথ্যের শতভাগ নিরাপত্তা:
অনলাইন পেমেন্টের ক্ষেত্রে আমাদের প্ল্যাটফর্ম আন্তর্জাতিক মানসম্পন্ন ২৫৬-বিট SSL এনক্রিপশন প্রযুক্তি ব্যবহার করে। আপনার ক্রেডিট/ debit কার্ড নাম্বার, CVV কিংবা বিকাশ-নগদ পিন কখনোই আমাদের নিজস্ব সার্ভারে সংরক্ষিত হয় না।

৩. তথ্য তৃতীয় পক্ষের সাথে শেয়ার না করার নীতি:
কুরিয়ার ডেলিভারি পার্টনার ছাড়া কোনো অননুমোদিত তৃতীয় পক্ষের কাছে আমরা কখনোই গ্রাহকের ব্যক্তিগত তথ্য বিক্রি, ভাড়া বা বাণিজ্যিক উদ্দেশ্যে হস্তান্তর করি না।

৪. গ্রাহকের অধিকার ও তথ্য সংশোধন:
আপনার ব্যক্তিগত অ্যাকাউন্ট বা প্রোফাইল সংক্রান্ত যেকোনো তথ্য আপডেট, সংশোধন কিংবা স্থায়ীভাবে মুছে ফেলার অনুরোধের জন্য আমাদের ডেডিকেটেড সাপোর্ট টিমের সাথে যেকোনো সময় সরাসরি যোগাযোগ করতে পারেন।`,
  description_en: `1. Privacy Commitment & Personal Data Protection:
We are dedicated to safeguarding your personal data and respect your confidentiality. We collect essential information such as customer name, contact phone, delivery address, and email solely for order fulfillment and logistics tracking.

2. Financial & Payment Security:
Online payments are conducted through PCI-DSS compliant, 256-bit SSL encrypted gateways. We never store credit/debit card numbers, CVVs, or mobile banking PINs on our servers.

3. Zero Third-Party Data Selling:
Customer data is strictly never rented, sold, or disclosed to unauthorized third parties, except as required by designated logistics partners solely to complete doorstep delivery.

4. Customer Rights & Data Management:
You retain full rights to request verification, amendment, or removal of your personal information from our active databases by contacting our privacy support desk.`
};

export const DEFAULT_ABOUT_POLICY: PolicyLinkItem = {
  id: 'about',
  title: 'About Us Company Story',
  title_bn: 'আমাদের সম্পর্কে',
  path: 'about',
  icon: 'sparkles',
  is_active: true,
  short_description_en: 'Discover the story, values, and dedication to authentic quality driving SHOPNOVA across Bangladesh.',
  short_description_bn: 'SHOPNOVA-এর লক্ষ্য, প্রতিশ্রুতি ও দেশজুড়ে প্রিমিয়াম লাইফস্টাইল পণ্য পৌঁছে দেওয়ার গল্প জানুন।',
  description_bn: `আমাদের গল্প ও অঙ্গীকার:
শপনোভা বাংলাদেশের একটি শীর্ষস্থানীয় আধুনিক ফ্যাশন ও স্মার্ট টেকনোলজি ই-কমার্স প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো দেশের প্রতিটি প্রান্তে মানুষের কাছে ১০০% অরিজিনাল, প্রিমিয়াম কোয়ালিটির লাইফস্টাইল পণ্য ও গ্যাজেট দ্রুততম সময়ে পৌঁছে দেওয়া।

আমরা বিশ্বাস করি শুধুমাত্র পণ্য বিক্রয় করাই আমাদের শেষ কথা নয়; বরং সততা, বিশ্বস্ত কোয়ালিটি এবং অতুলনীয় আন্তরিক গ্রাহক সেবার মাধ্যমে একটি দীর্ঘমেয়াদী পারিবারিক আস্থার সম্পর্ক গড়ে তোলাই আমাদের সার্থকতা। ৬৪ জেলার প্রতিটি গ্রাহকের মুখে সন্তুষ্টির হাসি ফোটানোই শপনোভা টিমের প্রতিটি সদস্যের নিরন্তর প্রচেষ্টা।`,
  description_en: `Our Story & Purpose:
We are a premier lifestyle and tech destination in Bangladesh, committed to curating 100% authentic apparel, modern accessories, and smart gadgets with seamless nationwide doorstep fulfillment.

Beyond commerce, our purpose is defined by uncompromising quality, honest pricing, and responsive customer care that builds enduring relationships with families across all 64 districts.`
};

export const DEFAULT_CONTACT_POLICY: PolicyLinkItem = {
  id: 'contact',
  title: 'Contact Customer Support',
  title_bn: 'যোগাযোগ ও সাপোর্ট',
  path: 'contact',
  icon: 'phone',
  is_active: true,
  short_description_en: 'Reach out to our customer care team anytime for orders, product assistance, and inquiries.',
  short_description_bn: 'যেকোনো জিজ্ঞাসা, অর্ডার ট্র্যাকিং ও তাৎক্ষণিক সহায়তায় আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।',
  description_bn: `আমাদের কাস্টমার কেয়ার টিম সপ্তাহের ৭ দিন সকাল ৯:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত আপনার যেকোনো প্রশ্ন, অর্ডার ট্র্যাকিং কিংবা সেবামূলক সহায়তার জন্য সর্বদা প্রস্তুত রয়েছে। ফোন, ইমেইল কিংবা ফেসবুক পেজে সরাসরি আমাদের সাথে সংযুক্ত হতে পারেন।`,
  description_en: `Our customer care department operates 7 days a week from 9:00 AM to 10:00 PM to assist with inquiries, custom requests, and real-time order tracking. Contact us via phone, email, or official social channels.`
};

export const DEFAULT_FOOTER_SERVICE_LINKS = [
  {
    id: '1',
    label: 'About Us',
    label_bn: 'আমাদের সম্পর্কে',
    page: 'about',
    is_active: true,
    short_description: DEFAULT_ABOUT_POLICY.short_description_en,
    short_description_bn: DEFAULT_ABOUT_POLICY.short_description_bn,
    description_en: DEFAULT_ABOUT_POLICY.description_en,
    description_bn: DEFAULT_ABOUT_POLICY.description_bn
  },
  {
    id: '2',
    label: 'Contact & Support',
    label_bn: 'যোগাযোগ ও সাপোর্ট',
    page: 'contact',
    is_active: true,
    short_description: DEFAULT_CONTACT_POLICY.short_description_en,
    short_description_bn: DEFAULT_CONTACT_POLICY.short_description_bn,
    description_en: DEFAULT_CONTACT_POLICY.description_en,
    description_bn: DEFAULT_CONTACT_POLICY.description_bn
  },
  {
    id: '3',
    label: 'Privacy Policy',
    label_bn: 'গোপনীয়তা ও ডাটা পলিসি',
    page: 'privacy',
    is_active: true,
    short_description: DEFAULT_PRIVACY_POLICY.short_description_en,
    short_description_bn: DEFAULT_PRIVACY_POLICY.short_description_bn,
    description_en: DEFAULT_PRIVACY_POLICY.description_en,
    description_bn: DEFAULT_PRIVACY_POLICY.description_bn
  }
];
