/**
 * Product data for Al Majd eCommerce
 * Images from /public/products
 */
const PRODUCTS = [
  {
    id: 1,
    name: "Giftology Stainless Steel Double Wall Tumbler",
    price: 45,
    category: "Water Bottles & Mugs",
    rating: 4.8,
    image: "public/products/Water Bottles & Mugs/MOSS - Giftology Stainless Steel Double Wall Tumbler - Navy Blue.jpg",
    description: "Premium double-wall insulated tumbler keeps drinks hot or cold for hours. Navy blue finish with leak-proof lid. Perfect for office or travel."
  },
  {
    id: 2,
    name: "Recycled Stainless Steel Vacuum Bottle with Loop",
    price: 55,
    category: "Water Bottles & Mugs",
    rating: 4.6,
    image: "public/products/Water Bottles & Mugs/R-NEBRA - CHANGE Collection Recycled Stainless Steel Vacuum Bottle with Loop - Grey.jpg",
    description: "Eco-friendly recycled stainless steel vacuum bottle. Grey finish with convenient carry loop. Sustainable choice for corporate gifting."
  },
  {
    id: 3,
    name: "Hans Larsen Insulated Tumbler with Grip Sleeve",
    price: 38,
    category: "Water Bottles & Mugs",
    rating: 4.5,
    image: "public/products/Water Bottles & Mugs/BOLIN - Hans Larsen Insulated Tumbler with Grip Sleeve 530ml - White.jpg",
    description: "530ml insulated tumbler with ergonomic grip sleeve. White finish. Ideal for coffee or cold beverages."
  },
  {
    id: 4,
    name: "Giftology Laptop Backpack",
    price: 89,
    category: "Bags & Pouches",
    rating: 4.7,
    image: "public/products/Bags & Pouches/RESEN - Giftology Laptop Backpack - Black.jpg",
    description: "Sleek laptop backpack in black. Multiple compartments, padded laptop sleeve. Professional design for daily commute."
  },
  {
    id: 5,
    name: "XDDESIGN Bobby Sling Bag in rPET material",
    price: 65,
    category: "Bags & Pouches",
    rating: 4.4,
    image: "public/products/Bags & Pouches/[BGXD 691] XDDESIGN Bobby Sling Bag in rPET material - Black.jpg",
    description: "Sustainable rPET sling bag. Compact design, anti-theft features. Black finish."
  },
  {
    id: 6,
    name: "Giftology Reflective RPET Drawstring Bag",
    price: 22,
    category: "Tote Bags",
    rating: 4.3,
    image: "public/products/Tote Bags/[BPDS 2220] MODRA - Giftology Reflective RPET Drawstring Bag.jpg",
    description: "Eco-friendly recycled drawstring bag with reflective details. Lightweight and durable."
  },
  {
    id: 7,
    name: "eco-neutral Recycled Cotton-Cork Shopping Bag",
    price: 28,
    category: "Tote Bags",
    rating: 4.6,
    image: "public/products/Tote Bags/[BPEN 2179] TILLEY - eco-neutral Recycled Cotton-Cork Shopping Bag.jpg",
    description: "Sustainable cotton-cork blend shopping bag. Natural aesthetic, reusable and eco-conscious."
  },
  {
    id: 8,
    name: "Santhome RPET 6 Panel DryNCool Sport Cap",
    price: 24,
    category: "Cap",
    rating: 4.5,
    image: "public/products/Cap/ULTRA - Santhome RPET 6 Panel DryNCool® Sport Cap - Royal Blue.jpg",
    description: "Sport cap with DryNCool technology. RPET recycled material. Royal blue."
  },
  {
    id: 9,
    name: "Santhome DryNCool Polo Shirt with UV protection",
    price: 42,
    category: "T-shirts",
    rating: 4.7,
    image: "public/products/T-shirts/[TROPIKANA Grey-Small] TROPIKANA - SANTHOME DryNCool Polo Shirt with UV protection (Small, Grey - Navy - White).jpg",
    description: "Premium polo with UV protection and moisture-wicking. Grey with navy and white accents."
  },
  {
    id: 10,
    name: "CROSS Pebble Leather 8CC Classic Fold Wallet",
    price: 95,
    category: "Wallets",
    rating: 4.9,
    image: "public/products/Wallets/[LACR 2041] CROSS Pebble Leather 8CC Classic Fold Wallet - Black.jpg",
    description: "Classic pebble leather wallet. 8 card slots, bill compartment. Black."
  },
  {
    id: 11,
    name: "Santhome Recycled Canvas A5 Hard Cover Notebook",
    price: 18,
    category: "Note Books",
    rating: 4.4,
    image: "public/products/Note Books/ADANA - Santhome Recycled Canvas A5 Hard Cover Notebook with PU Pocket - Black.jpg",
    description: "A5 hard cover notebook with recycled canvas. PU pocket. Black. Sustainable stationery."
  },
  {
    id: 12,
    name: "Giftology 10000mAh Mag Wireless Powerbank",
    price: 72,
    category: "Technolog gifts",
    rating: 4.6,
    image: "public/products/Technolog gifts/SOLANO - @memorii 10000mAh Mag Wireless Powerbank with Inbuilt Cables.jpg",
    description: "10000mAh magnetic wireless powerbank with inbuilt cables. Fast charging for phones and devices."
  },
  {
    id: 13,
    name: "CHANGE ZERO Sustainable 5pc Gratitude Gift Set",
    price: 125,
    category: "Gifts Sets",
    rating: 4.8,
    image: "public/products/Gifts Sets/[GSSN 9611] AVEIRO - CHANGE ZERO Sustainable 5pc Gratitude Gift Set - Navy Blue.jpg",
    description: "Premium 5-piece sustainable gift set. Navy blue. Perfect for corporate gratitude gifting."
  },
  {
    id: 14,
    name: "Giftology Ceramic Cup with Wide Grip",
    price: 32,
    category: "Water Bottles & Mugs",
    rating: 4.2,
    image: "public/products/Water Bottles & Mugs/FALLO - Giftology Ceramic Cup with Wide Grip 400 ml - Blue.jpg",
    description: "400ml ceramic cup with comfortable wide grip. Blue finish. Microwave safe."
  },
  {
    id: 15,
    name: "Giftology Magnetic Phone Holder Water Bottle",
    price: 48,
    category: "Water Bottles & Mugs",
    rating: 4.5,
    image: "public/products/Water Bottles & Mugs/FERRO - Giftology Magnetic Phone Holder Water Bottle 760ml - Navy Blue.jpg",
    description: "760ml water bottle with built-in magnetic phone holder. Navy blue. Stay hydrated and connected."
  },
  {
    id: 16,
    name: "Giftology Beach Towel in Drawstring Bag",
    price: 35,
    category: "Tote Bags",
    rating: 4.3,
    image: "public/products/Tote Bags/[APGL 7125] AMARA - Giftology Beach Towel in Drawstring Bag.jpg",
    description: "Beach towel with convenient drawstring bag. Soft and absorbent. Great for events."
  }
];
