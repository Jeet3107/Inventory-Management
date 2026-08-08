# Setup Guide — Inventory Management (SP Engineering Co.)

## Maine kya check kiya
Poora backend + frontend code padha, `npm install` chalaya, backend ko run
karke try kiya, aur frontend ka production build bhi run karke dekha.
Code khud mostly theek hai — build clean pass hua, koi syntax/import error
nahi mila. Sirf ek real bug mila (fix kar diya hai):

- `backend/models/User.js` mein `role` field schema mein define hi nahi tha
  (jabki register/login isko use kar rahe the, aur README mein "role-based
  access" feature bhi likha hai). Ab `role: { admin | manager | staff }`
  add kar diya, default `admin`.

Sabse badi wajah jo mujhe laga project "chal nahi raha" — **`backend/.env`
file thi hi nahi**, sirf `.env.example` tha. Bina `.env` ke, `MONGO_URI`
undefined hota hai aur Mongoose crash ho jata hai (maine yahi error khud
reproduce karke confirm kiya). Maine ek working `.env` bana diya hai (naya
random JWT secret ke saath) — lekin `MONGO_URI` abhi local MongoDB ko point
kar raha hai, jo tumhare PC par installed hona chahiye ya Atlas ka URI dena
padega (neeche steps hain).

## Run karne ke steps

### 1. MongoDB ready karo (in dono mein se ek chuno)

**Option A — MongoDB Atlas (recommended, free, sabse easy):**
1. https://www.mongodb.com/cloud/atlas/register par free account banao
2. Free "M0" cluster create karo
3. Database Access mein ek user banao (username/password)
4. Network Access mein "Allow access from anywhere" (0.0.0.0/0) add karo
5. "Connect" → "Drivers" se connection string copy karo, jaise:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/inventory_db`
6. `backend/.env` mein `MONGO_URI` isse replace kar do

**Option B — Local MongoDB:**
- Windows/Mac par MongoDB Community Server install karo:
  https://www.mongodb.com/try/download/community
- Install ke baad `.env` ka `MONGO_URI=mongodb://127.0.0.1:27017/inventory_db`
  waisa hi rehne do — already set hai.

### 2. Backend chalao
```
cd backend
npm install
npm run dev
```
Terminal mein "MongoDB Connected" aur "Server running on port 5000" dikhna
chahiye. Agar error aaye, wahi paste kar dena — exact fix bata dunga.

### 3. Frontend chalao (naya terminal)
```
cd frontend
npm install
npm start
```
Browser mein `http://localhost:3000` khulega. Register karke pehla account
bana lena (wahi admin ban jayega).

## Next step — SP Engineering ke liye customize
Abhi ye generic "Product" schema hai (name, SKU, price, costPrice, quantity,
category). Tumhare washers/anchors/patta ke liye main isko revamp kar sakta
hoon jaise tumne pehle production tracker mein banaya tha — jaise:
- Washer: size (6mm–40mm), unit (kg/bags)
- Anchor: type/size, unit (pcs/bags)
- Patta: free-text description

Bata do agar ye customization abhi karni hai, main schema + forms + dashboard
sab update kar dunga.
