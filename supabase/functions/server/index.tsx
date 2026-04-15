import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/make-server-17668ba8/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

app.post("/make-server-17668ba8/auth/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    if (!email || !password || !name || !role) return c.json({ error: "Missing required fields" }, 400);
    if (password.length < 6) return c.json({ error: "Password must be at least 6 characters" }, 400);
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) return c.json({ error: "User already exists" }, 400);
    const userId = crypto.randomUUID();
    const user = {
      id: userId, email, name, role,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop`,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`user:${email}`, { ...user, password });
    await kv.set(`user:id:${userId}`, email);
    
    if (role === 'volunteer') {
      await kv.set(`volunteer:${userId}`, {
        ...user,
        skills: ["Community Response"],
        availability: "available",
        rating: 5.0,
        totalHelps: 0,
        responsesCompleted: 0
      });
    }
    return c.json({ user });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

app.post("/make-server-17668ba8/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: "Missing email or password" }, 400);
    const userData = await kv.get(`user:${email}`);
    if (!userData || userData.password !== password) return c.json({ error: "Invalid credentials" }, 401);
    const { password: _, ...user } = userData;
    return c.json({ user });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// ==================== NGO ROUTES ====================

app.get("/make-server-17668ba8/ngos", async (c) => {
  try {
    const ngos = await kv.getByPrefix("ngo:");
    ngos.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return c.json({ ngos });
  } catch (error) {
    console.error("Get NGOs error:", error);
    return c.json({ error: "Failed to fetch NGOs" }, 500);
  }
});

app.post("/make-server-17668ba8/ngos", async (c) => {
  try {
    const ngoData = await c.req.json();
    if (!ngoData.name || !ngoData.city) return c.json({ error: "Missing required fields" }, 400);
    const ngoId = crypto.randomUUID();
    const ngo = {
      id: ngoId,
      ...ngoData,
      volunteerCount: 0,
      coverageRadius: 5000,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`ngo:${ngoId}`, ngo);
    return c.json({ ngo });
  } catch (error) {
    console.error("Create NGO error:", error);
    return c.json({ error: "Failed to create NGO" }, 500);
  }
});

// ==================== NEEDS ROUTES ====================

app.get("/make-server-17668ba8/needs", async (c) => {
  try {
    const category = c.req.query("category");
    const status = c.req.query("status");
    const userId = c.req.query("userId");
    const ngoId = c.req.query("ngoId");

    const needs = await kv.getByPrefix("need:");
    let filteredNeeds = needs;

    if (category && category !== "All") filteredNeeds = filteredNeeds.filter((n: any) => n.category === category);
    if (status) filteredNeeds = filteredNeeds.filter((n: any) => n.status === status);
    if (userId) filteredNeeds = filteredNeeds.filter((n: any) => n.userId === userId);
    if (ngoId && ngoId !== "all") filteredNeeds = filteredNeeds.filter((n: any) => n.ngoId === ngoId);

    filteredNeeds.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ needs: filteredNeeds });
  } catch (error) {
    console.error("Get needs error:", error);
    return c.json({ error: "Failed to fetch needs" }, 500);
  }
});

app.post("/make-server-17668ba8/needs", async (c) => {
  try {
    const needData = await c.req.json();
    if (!needData.title || !needData.category || !needData.location || !needData.urgency) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    const needId = crypto.randomUUID();
    const need = {
      id: needId,
      ...needData,
      status: "open",
      timestamp: new Date().toISOString(),
      responses: 0,
    };
    await kv.set(`need:${needId}`, need);
    return c.json({ need });
  } catch (error) {
    console.error("Create need error:", error);
    return c.json({ error: "Failed to create need" }, 500);
  }
});

app.put("/make-server-17668ba8/needs/:id", async (c) => {
  try {
    const needId = c.req.param("id");
    const updates = await c.req.json();
    const need = await kv.get(`need:${needId}`);
    if (!need) return c.json({ error: "Need not found" }, 404);
    const updatedNeed = { ...need, ...updates };
    await kv.set(`need:${needId}`, updatedNeed);
    return c.json({ need: updatedNeed });
  } catch (error) {
    console.error("Update need error:", error);
    return c.json({ error: "Failed to update need" }, 500);
  }
});

app.delete("/make-server-17668ba8/needs/:id", async (c) => {
  try {
    const needId = c.req.param("id");
    await kv.del(`need:${needId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete need error:", error);
    return c.json({ error: "Failed to delete need" }, 500);
  }
});

// ==================== VOLUNTEER ROUTES ====================

app.get("/make-server-17668ba8/volunteers", async (c) => {
  try {
    const ngoId = c.req.query("ngoId");
    const volunteers = await kv.getByPrefix("volunteer:");
    let filtered = volunteers;
    if (ngoId && ngoId !== "all") filtered = filtered.filter((v: any) => v.ngoId === ngoId);
    filtered.sort((a: any, b: any) => (b.responsesCompleted || 0) - (a.responsesCompleted || 0));
    return c.json({ volunteers: filtered });
  } catch (error) {
    console.error("Get volunteers error:", error);
    return c.json({ error: "Failed to fetch volunteers" }, 500);
  }
});

app.post("/make-server-17668ba8/volunteers", async (c) => {
  try {
    const volunteerData = await c.req.json();
    if (!volunteerData.id || !volunteerData.name) return c.json({ error: "Missing required fields" }, 400);
    const volunteer = { ...volunteerData, updatedAt: new Date().toISOString() };
    await kv.set(`volunteer:${volunteer.id}`, volunteer);
    return c.json({ volunteer });
  } catch (error) {
    console.error("Create/update volunteer error:", error);
    return c.json({ error: "Failed to save volunteer" }, 500);
  }
});

// ==================== CHAT ROUTES ====================

app.get("/make-server-17668ba8/chat/:conversationId", async (c) => {
  try {
    const conversationId = c.req.param("conversationId");
    const messages = await kv.getByPrefix(`chat:${conversationId}:`);
    messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return c.json({ messages });
  } catch (error) {
    console.error("Get chat messages error:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

app.post("/make-server-17668ba8/chat", async (c) => {
  try {
    const { conversationId, senderId, text } = await c.req.json();
    if (!conversationId || !senderId || !text) return c.json({ error: "Missing required fields" }, 400);
    const messageId = crypto.randomUUID();
    const message = { id: messageId, conversationId, senderId, text, timestamp: new Date().toISOString(), read: false };
    await kv.set(`chat:${conversationId}:${messageId}`, message);
    return c.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// ==================== ANALYTICS ROUTES ====================

app.get("/make-server-17668ba8/analytics/dashboard", async (c) => {
  try {
    const needs = await kv.getByPrefix("need:");
    const volunteers = await kv.getByPrefix("volunteer:");
    const totalNeeds = needs.length;
    const activeNeeds = needs.filter((n: any) => n.status === "open").length;
    const completedNeeds = needs.filter((n: any) => n.status === "fulfilled").length;
    const criticalNeeds = needs.filter((n: any) => n.urgency === "critical").length;
    const totalVolunteers = volunteers.length;
    const activeVolunteers = volunteers.filter((v: any) => v.availability === "available").length;
    const categoryData = needs.reduce((acc: any, need: any) => {
      acc[need.category] = (acc[need.category] || 0) + 1;
      return acc;
    }, {});
    const urgencyData = needs.reduce((acc: any, need: any) => {
      acc[need.urgency] = (acc[need.urgency] || 0) + 1;
      return acc;
    }, {});
    return c.json({
      metrics: { totalNeeds, activeNeeds, completedNeeds, criticalNeeds, totalVolunteers, activeVolunteers, responseRate: totalNeeds > 0 ? ((completedNeeds / totalNeeds) * 100).toFixed(1) : 0 },
      categoryData, urgencyData,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

app.get("/make-server-17668ba8/analytics/leaderboard", async (c) => {
  try {
    const volunteers = await kv.getByPrefix("volunteer:");
    const leaderboard = volunteers
      .map((v: any) => ({ id: v.id, name: v.name, avatar: v.avatar, points: v.points || 0, responsesCompleted: v.responsesCompleted || 0, badge: v.badge || "Volunteer", ngoId: v.ngoId, ngoName: v.ngoName }))
      .sort((a: any, b: any) => b.points - a.points);
    return c.json({ leaderboard });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return c.json({ error: "Failed to fetch leaderboard" }, 500);
  }
});

// ==================== INIT DEMO DATA ====================

app.post("/make-server-17668ba8/init-demo-data", async (c) => {
  try {
    let body: any = {};
    try { body = await c.req.json(); } catch (_) {}
    const force = body?.force === true;

    const initialized = await kv.get("system:initialized:v3");
    if (initialized && !force) {
      return c.json({ message: "Already initialized" });
    }
    // If forcing, delete OLD needs/volunteers/ngos so stale data doesn't persist
    if (force) {
      const oldNeeds = await kv.getByPrefix("need:");
      for (const need of oldNeeds) {
        if (need?.id) await kv.del(`need:${need.id}`);
      }
      const oldVols = await kv.getByPrefix("volunteer:");
      for (const vol of oldVols) {
        if (vol?.id) await kv.del(`volunteer:${vol.id}`);
      }
      const oldNgos = await kv.getByPrefix("ngo:");
      for (const ngo of oldNgos) {
        if (ngo?.id) await kv.del(`ngo:${ngo.id}`);
      }
    }


    const demoUsers = [
      { id: "sys-admin", email: "admin@crisisconnect.com", password: "demo123", name: "System Admin", role: "admin", avatar: "https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff" },
      { id: "vol-1", email: "volunteer@crisisconnect.com", password: "demo123", name: "Demo Volunteer", role: "volunteer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
      { id: "user-demo", email: "user@crisisconnect.com", password: "demo123", name: "Demo User", role: "user", avatar: "https://ui-avatars.com/api/?name=Demo&background=3b82f6&color=fff" },
    ];
    for (const user of demoUsers) {
      await kv.set(`user:${user.email}`, user);
      await kv.set(`user:id:${user.id}`, user.email);
    }

    const ngos = [
      { id: 'ngo-1', name: 'Prayas Foundation', city: 'Delhi', state: 'Delhi', color: '#a855f7', hq: { lat: 28.6139, lng: 77.2090 }, description: 'Flood & Drought relief in Northern India', phone: '+91-11-4567-8901', email: 'contact@prayas.org', established: '2010', volunteerCount: 4 },
      { id: 'ngo-2', name: 'Sahyog Relief Trust', city: 'Mumbai', state: 'Maharashtra', color: '#3b82f6', hq: { lat: 19.0760, lng: 72.8777 }, description: 'Coastal disaster response & urban shelter', phone: '+91-22-4567-8902', email: 'info@sahyog.org', established: '2008', volunteerCount: 3 },
      { id: 'ngo-3', name: 'Seva Samithi', city: 'Bangalore', state: 'Karnataka', color: '#10b981', hq: { lat: 12.9716, lng: 77.5946 }, description: 'Medical aid & rescue operations South India', phone: '+91-80-4567-8903', email: 'help@sevasamithi.org', established: '2015', volunteerCount: 3 },
      { id: 'ngo-4', name: 'Aasra Welfare Society', city: 'Noida', state: 'Uttar Pradesh', color: '#f59e0b', hq: { lat: 28.5355, lng: 77.3910 }, description: 'Community relief & logistics support NCR', phone: '+91-120-4567-9001', email: 'aasra@welfare.org', established: '2012', volunteerCount: 2 },
      { id: 'ngo-5', name: 'Kolkata Aid', city: 'Kolkata', state: 'West Bengal', color: '#ef4444', hq: { lat: 22.5726, lng: 88.3639 }, description: 'Cyclone relief & urban poverty', phone: '+91-33-4567-8901', email: 'hello@kolkataaid.org', established: '2014', volunteerCount: 2 }
    ];
    for (const ngo of ngos) {
      await kv.set(`ngo:${ngo.id}`, ngo);
    }

    // ---- Volunteers ----
    const volunteers = [
      { id: 'vol-1', name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', skills: ['Medical', 'First Aid', 'Emergency Response'], badges: ['Top Responder', 'Medical Expert'], rating: 4.9, totalHelps: 187, availability: 'available', location: 'Connaught Place, Delhi', phone: '+91-98110-12301', joinedDate: '2024-01-15', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', lat: 28.6329, lng: 77.2195 },
      { id: 'vol-2', name: 'Deepika Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', skills: ['Rescue Operations', 'Water Safety'], badges: ['Rescue Expert'], rating: 4.8, totalHelps: 164, availability: 'available', location: 'Rohini, Delhi', phone: '+91-98110-12302', joinedDate: '2024-02-20', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', lat: 28.7041, lng: 77.1025 },
      { id: 'vol-3', name: 'Rajesh Gupta', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', skills: ['Logistics', 'Transport'], badges: ['Logistics Hero'], rating: 4.7, totalHelps: 143, availability: 'busy', location: 'Lajpat Nagar, Delhi', phone: '+91-98110-12303', joinedDate: '2024-03-10', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', lat: 28.5665, lng: 77.2431 },
      { id: 'vol-4', name: 'Kavita Nair', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', skills: ['Food', 'Community'], badges: ['Leader'], rating: 4.9, totalHelps: 221, availability: 'available', location: 'Dwarka, Delhi', phone: '+91-98110-12304', joinedDate: '2023-11-05', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', lat: 28.5823, lng: 77.0388 },
      { id: 'vol-5', name: 'Vikram Patil', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', skills: ['Rescue', 'Emergency'], badges: ['Specialist'], rating: 4.8, totalHelps: 156, availability: 'available', location: 'Andheri, Mumbai', phone: '+91-98200-45601', joinedDate: '2024-01-10', ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', lat: 19.1197, lng: 72.8468 }
    ];
    for (const v of volunteers) {
      await kv.set(`volunteer:${v.id}`, v);
    }

    // ---- Needs ----
    const now = new Date();
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

    const needs = [
      { id: 'need-1', title: 'Insulin & Diabetes Medicines Needed', location: 'Yamuna Khadar, Delhi', description: 'Flash flood in low-lying area. Elderly diabetic patient trapped.', urgency: 'critical', category: 'Medical', tags: ['Diabetes', 'Flood'], timestamp: hoursAgo(2), lat: 28.6600, lng: 77.2620, contact: '+91-98110-99001', status: 'open', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', city: 'Delhi', userId: 'user-1', userName: "Sunita Rao" },
      { id: 'need-2', title: 'Rescue - Family Trapped in Flooded Building', location: 'Kalindi Kunj, Delhi', description: 'Family of 5 stranded on rooftop, water level at 8 feet.', urgency: 'critical', category: 'Rescue', tags: ['Flood', 'Family'], timestamp: hoursAgo(1), lat: 28.5350, lng: 77.3100, contact: '+91-98110-99002', status: 'open', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', city: 'Delhi' },
      { id: 'need-3', title: 'Food Packets for Flood Relief Camp', location: 'Burari Relief Camp, Delhi', description: '750+ displaced persons at relief camp. Running out of cooked meals.', urgency: 'high', category: 'Food', tags: ['Relief Food', 'Mass Feeding'], timestamp: hoursAgo(5), lat: 28.7270, lng: 77.1877, contact: '+91-98110-99003', status: 'in-progress', ngoId: 'ngo-1', ngoName: 'Prayas Foundation', city: 'Delhi' },
      { id: 'need-6', title: 'Cyclone Evacuation - Dharavi Residents', location: 'Dharavi, Mumbai', description: 'Pre-cyclone warning issued. 400+ residents need evacuation.', urgency: 'critical', category: 'Rescue', tags: ['Cyclone', 'Evacuation'], timestamp: hoursAgo(3), lat: 19.0414, lng: 72.8543, contact: '+91-98200-55001', status: 'open', ngoId: 'ngo-2', ngoName: 'Sahyog Relief Trust', city: 'Mumbai' },
      { id: 'need-10', title: 'Dengue Outbreak - Medical Aid', location: 'Rajajinagar, Bangalore', description: 'Dengue fever outbreak post heavy rains. 30+ confirmed cases.', urgency: 'high', category: 'Medical', tags: ['Dengue', 'Epidemic'], timestamp: hoursAgo(10), lat: 12.9884, lng: 77.5551, contact: '+91-98440-77001', status: 'open', ngoId: 'ngo-3', ngoName: 'Seva Samithi', city: 'Bangalore' }
    ];
    for (const need of needs) {
      await kv.set(`need:${need.id}`, need);
    }

    await kv.set("system:initialized:v3", true);
    return c.json({ message: "Indian demo data initialized successfully", ngos: ngos.length, volunteers: volunteers.length, needs: needs.length });
  } catch (error) {
    console.error("Init demo data error:", error);
    return c.json({ error: "Failed to initialize demo data" }, 500);
  }
});

Deno.serve(app.fetch);