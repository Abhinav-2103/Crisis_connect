# 🗺️ Mappls (MapmyIndia) Integration Setup Guide

## Overview

Your CrisisConnect platform now uses **Mappls** (formerly MapmyIndia), India's leading mapping and location intelligence platform. The interactive map displays emergency needs with real-time markers showing location and urgency levels across Indian cities.

## 🇮🇳 Why Mappls?

- **Made in India**: India's most accurate and detailed maps
- **Better Coverage**: Superior coverage of Indian roads, localities, and landmarks
- **Faster Loading**: Optimized for Indian networks and infrastructure
- **Cost Effective**: Generous free tier for Indian developers
- **Government Approved**: Used by major government and enterprise applications

## 🔑 Getting Your Mappls API Keys

### Step 1: Create a Mappls Account
1. Go to [Mappls API Console](https://apis.mappls.com/console/)
2. Click **"Sign Up"** (free registration)
3. Fill in your details:
   - Name
   - Email
   - Phone number
   - Company/Organization name
4. Verify your email address

### Step 2: Create a New Project
1. After logging in, click **"Create New Project"**
2. Enter project details:
   - **Project Name**: "CrisisConnect" (or any name you prefer)
   - **Project Type**: Select "Web"
   - **Description**: "Emergency disaster management platform"
3. Click **"Create"**

### Step 3: Get Your API Keys
1. Once your project is created, go to the **"Credentials"** tab
2. You'll see two important keys:
   - ✅ **Map API Key** (for displaying maps)
   - ✅ **REST API Key** (for geocoding and other services)
3. Copy both keys

### Step 4: Add Your API Keys to the Project
1. Open the file: `/src/config/env.ts`
2. Replace the placeholder values with your actual API keys:

```typescript
export const MAPPLS_MAP_KEY = 'your-actual-map-api-key-here';
export const MAPPLS_REST_KEY = 'your-actual-rest-api-key-here';
```

3. Save the file

### Step 5: Configure Domain Restrictions (Recommended)
For security, restrict your API keys to your domain:

1. In the Mappls Console, go to **"Credentials"**
2. Click on your API key
3. Under **"Domain Restrictions"**, add:
   - `localhost:*` (for development)
   - `yourdomain.com` (for production)
4. Click **"Save"**

## 🎨 Map Features

Once configured, your map will show:

- **📍 Interactive Markers**: Color-coded by urgency level
  - 🔴 Red = Critical
  - 🟠 Orange = High
  - 🟡 Yellow = Medium
  - 🟢 Green = Low

- **🗺️ Dark Theme**: Custom styled map matching your platform design
- **🇮🇳 Indian Cities**: Demo data shows needs across major Indian cities:
  - Delhi, Mumbai, Chennai, Kolkata
  - Bangalore, Hyderabad, Ahmedabad, Jaipur

- **ℹ️ Info Cards**: Click markers to see detailed need information
- **🔍 Category Filters**: Filter needs by type (Medical, Food, Water, etc.)
- **📊 Real-time Stats**: Live count of active and critical needs
- **📍 Location Control**: Built-in geolocation support

## 💰 Pricing & Free Tier

Mappls offers a generous free tier:

### Free Tier Includes:
- **250,000 map loads per month** (FREE)
- **25,000 API calls per month** for geocoding and other services
- Perfect for startups and small to medium applications
- No credit card required for free tier

### Paid Plans (if you exceed free tier):
- Very affordable compared to international alternatives
- Pay-as-you-go or monthly plans available
- Enterprise plans with custom pricing

## 🔧 Customization Options

You can customize the map in `/src/config/env.ts`:

### Change Default Map Center
```typescript
export const DEFAULT_MAP_CENTER = {
  lat: 28.6139,  // New Delhi
  lng: 77.2090,
};
```

**Popular Indian Cities Coordinates:**
- **Mumbai**: `{ lat: 19.0760, lng: 72.8777 }`
- **Bangalore**: `{ lat: 12.9716, lng: 77.5946 }`
- **Chennai**: `{ lat: 13.0827, lng: 80.2707 }`
- **Kolkata**: `{ lat: 22.5726, lng: 88.3639 }`
- **Hyderabad**: `{ lat: 17.3850, lng: 78.4867 }`

### Change Default Zoom Level
```typescript
export const DEFAULT_MAP_ZOOM = 12; // 1-20, higher = more zoomed in
```

## 🐛 Troubleshooting

### "API Key Required" Warning
- Make sure you've replaced both placeholders in `/src/config/env.ts`
- Check that you've copied the keys correctly (no extra spaces)
- Verify your keys are from the "Credentials" section

### Map Not Loading
- Check browser console for specific error messages
- Ensure your domain is whitelisted in Mappls Console
- Verify your API keys are active (check Mappls Console)
- Clear browser cache and refresh

### Markers Not Showing
- Ensure your needs have valid `lat` and `lng` coordinates
- Check that coordinates are within India (Mappls is optimized for India)
- Verify the `MAPPLS_MAP_KEY` is correctly imported

### Script Loading Issues
- Check your internet connection
- Ensure Mappls CDN is not blocked by firewall
- Try clearing browser cache

## 🌐 Additional Features

### Geocoding (Coming Soon)
Convert addresses to coordinates using Mappls REST API:
```typescript
// Example: Convert "Connaught Place, Delhi" to coordinates
```

### Routing & Directions (Coming Soon)
Calculate routes between emergency locations

### Place Search (Coming Soon)
Search for nearby hospitals, shelters, and resources

## 📚 Additional Resources

- [Mappls Documentation](https://about.mappls.com/api/)
- [Mappls API Console](https://apis.mappls.com/console/)
- [Mappls Developer Portal](https://www.mapmyindia.com/api/)
- [GitHub Examples](https://github.com/mappls-api)
- [Support Email](mailto:apisupport@mappls.com)

## 🎉 You're All Set!

Once you add your API keys:
1. Save the `/src/config/env.ts` file
2. Refresh your browser
3. Navigate to the **Map** screen
4. See your interactive emergency response map with Indian cities!

## 🚀 Pro Tips

1. **Use Real Geocoding**: In production, use Mappls Geocoding API to convert actual addresses to coordinates
2. **Enable Clustering**: For better performance with many markers
3. **Add Heatmaps**: Visualize emergency density
4. **Integrate ELocation**: Use Mappls' unique 6-character eLoc codes for precise Indian locations
5. **Mobile Optimization**: Mappls works great on mobile browsers

---

**Need Help?** Contact Mappls support at [apisupport@mappls.com](mailto:apisupport@mappls.com)
