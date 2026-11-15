# Sakib Top Up Shop – সেটআপ গাইড

## ১. Firebase সেটআপ (একবারই)
1. Firebase Console → **Authentication → Sign-in method** → *Email/Password* ও *Google* চালু করুন।
   **Settings → Authorized domains** এ আপনার Render ডোমেইন (`xxx.onrender.com`) যোগ করুন।
2. **Realtime Database** → **Rules** ট্যাবে `database.rules.json` এর পুরো লেখা পেস্ট করে **Publish** করুন।
   (এতে ইউজার নিজে ব্যালেন্স বাড়াতে পারবে না, শুধু অ্যাডমিন পারবে।)
3. সাইটে নিজের অ্যাকাউন্টে Register করুন → `/admin` এ যান → "অ্যাক্সেস নেই" পেজে আপনার **UID** দেখাবে।
4. Realtime Database → Data → রুটে `admins` নোড বানিয়ে তার ভিতরে `UID : true` বসান। রিফ্রেশ দিলেই অ্যাডমিন চালু।
5. `/admin` → **Settings** এ bKash/Nagad/Rocket নম্বর বসান।

## ২. GitHub + Render
- সব ফাইল GitHub রিপোতে আপলোড করুন (`.apk` লাগবে না)। Render এ *New Web Service* → রিপো সিলেক্ট → Start Command: `node server.js`।
- Environment: `FFX-PASS` = সাইট কন্টেন্ট প্যানেলের পাসওয়ার্ড। (ঐচ্ছিক) `FFX-G`, `FFX-REPO` = GitHub টোকেন/রিপো, যাতে প্যাকেজ/ব্যানার পরিবর্তন রিস্টার্টের পরেও থাকে।

## ৩. ব্যবহার
| URL | কাজ |
|---|---|
| `/` | ইউজার সাইট |
| `/admin` | অর্ডার, Add Money অ্যাপ্রুভ, ইউজার/ব্যালেন্স, সেটিংস (Firebase) |
| `/admin/site` | প্যাকেজ, দাম, ব্যানার, ছবি, টেক্সট (আগের CMS) |

## ৪. অর্ডার প্রসেস
ইউজার ওয়ালেট থেকে পে করে অর্ডার দেয় (Pending) → আপনি টপ-আপ করে `/admin → Orders → Complete` চাপেন।
বাতিল করলে **Cancel+Refund** এ টাকা ওয়ালেটে ফেরত যায়।
Add Money: ইউজার Send Money করে TrxID জমা দেয় → আপনি মিলিয়ে **Approve** করলে ব্যালেন্স যোগ হয়।

## ৫. UID Checker
আগের API (`auraffxserverinfocheckerapi.onrender.com`) যেমন ছিল তেমনই আছে।
