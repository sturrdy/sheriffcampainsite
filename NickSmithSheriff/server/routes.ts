import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  insertVolunteerSchema, 
  insertYardSignRequestSchema, 
  insertDonationSchema,
  insertNewsletterSubscriptionSchema 
} from "@shared/schema";

// Use test key for development, will be replaced with live key in production
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51RUE0iQBABaPIPClgv6vYQzb8gVQ6wCLkUOV5DNIpsyWMva5gfVBD2dfCUMCyOdaZ6y8YdmH4moqcSBhd2tEVYoq00ccRyT6v4';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Stripe payment route for one-time donations
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, email } = req.body;
      
      if (!amount || !email) {
        return res.status(400).json({ message: "Amount and email are required" });
      }

      // Create donation record
      const donation = await storage.createDonation({ 
        amount: Math.round(amount * 100), // Convert to cents
        email 
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          donationId: donation.id.toString(),
          email: email,
        },
      });

      // Update donation with payment intent ID
      await storage.updateDonationStatus(donation.id, "pending", paymentIntent.id);

      // Send notification for donation attempt
      const notificationData = {
        type: "donation",
        data: {
          email: email,
          amount: Math.round(amount * 100),
          status: "pending",
          paymentIntentId: paymentIntent.id,
          createdAt: new Date().toISOString()
        }
      };
      
      console.log(`📧 New Donation Attempt: $${amount.toFixed(2)} from ${email}`);
      console.log("Notification Data:", JSON.stringify(notificationData, null, 2));

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Volunteer signup
  app.post("/api/volunteers", async (req, res) => {
    try {
      const validatedData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(validatedData);
      
      // Send notification
      const notificationData = {
        type: "volunteer",
        data: {
          name: volunteer.name,
          email: volunteer.email,
          interests: volunteer.interests,
          phone: volunteer.phone,
          createdAt: volunteer.createdAt
        }
      };
      
      // Log notification (email service integration would go here)
      console.log(`📧 New Volunteer: ${volunteer.name} (${volunteer.email}) - Interests: ${volunteer.interests?.join(", ")}`);
      console.log("Notification Data:", JSON.stringify(notificationData, null, 2));
      
      res.json({ success: true, volunteer });
    } catch (error: any) {
      res.status(400).json({ message: "Error creating volunteer: " + error.message });
    }
  });

  // Yard sign request
  app.post("/api/yard-sign-requests", async (req, res) => {
    try {
      const validatedData = insertYardSignRequestSchema.parse(req.body);
      const request = await storage.createYardSignRequest(validatedData);
      
      // Send notification
      const notificationData = {
        type: "yard-sign",
        data: {
          name: request.name,
          email: request.email,
          address: request.address,
          quantity: request.quantity,
          phone: request.phone,
          createdAt: request.createdAt
        }
      };
      
      console.log(`📧 New Yard Sign Request: ${request.name} (${request.email}) - ${request.quantity} sign(s) for ${request.address}`);
      console.log("Notification Data:", JSON.stringify(notificationData, null, 2));
      
      res.json({ success: true, request });
    } catch (error: any) {
      res.status(400).json({ message: "Error creating yard sign request: " + error.message });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);
      const subscription = await storage.createNewsletterSubscription(validatedData);
      
      // Send notification
      const notificationData = {
        type: "newsletter",
        data: {
          email: subscription.email,
          createdAt: subscription.createdAt
        }
      };
      
      console.log(`📧 New Newsletter Subscriber: ${subscription.email}`);
      console.log("Notification Data:", JSON.stringify(notificationData, null, 2));
      
      res.json({ success: true, subscription });
    } catch (error: any) {
      res.status(400).json({ message: "Error creating newsletter subscription: " + error.message });
    }
  });

  // Get all volunteers (admin endpoint)
  app.get("/api/volunteers", async (req, res) => {
    try {
      const volunteers = await storage.getAllVolunteers();
      res.json(volunteers);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching volunteers: " + error.message });
    }
  });

  // Get all yard sign requests (admin endpoint)
  app.get("/api/yard-sign-requests", async (req, res) => {
    try {
      const requests = await storage.getAllYardSignRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching yard sign requests: " + error.message });
    }
  });

  // Get all donations (admin endpoint)
  app.get("/api/donations", async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      res.json(donations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching donations: " + error.message });
    }
  });

  // Get all newsletter subscriptions (admin endpoint)
  app.get("/api/newsletter", async (req, res) => {
    try {
      const subscriptions = await storage.getAllNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching newsletter subscriptions: " + error.message });
    }
  });

  // Delete volunteer
  app.delete("/api/volunteers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVolunteer(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting volunteer: " + error.message });
    }
  });

  // Update volunteer
  app.put("/api/volunteers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const volunteer = await storage.updateVolunteer(id, updates);
      res.json(volunteer);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating volunteer: " + error.message });
    }
  });

  // Delete yard sign request
  app.delete("/api/yard-sign-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteYardSignRequest(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting yard sign request: " + error.message });
    }
  });

  // Update yard sign request
  app.put("/api/yard-sign-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const request = await storage.updateYardSignRequest(id, updates);
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating yard sign request: " + error.message });
    }
  });

  // Delete newsletter subscription
  app.delete("/api/newsletter/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNewsletterSubscription(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting newsletter subscription: " + error.message });
    }
  });

  // Send email notification (placeholder for email service integration)
  app.post("/api/send-notification", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      // Here you would integrate with an email service like SendGrid, Mailgun, or AWS SES
      // For now, we'll log the notification
      console.log(`📧 Campaign Notification - ${type}:`, data);
      
      // Example email content based on type
      let subject = "";
      let content = "";
      
      switch (type) {
        case "volunteer":
          subject = `New Volunteer: ${data.name}`;
          content = `${data.name} (${data.email}) signed up to volunteer for: ${data.interests?.join(", ")}`;
          break;
        case "yard-sign":
          subject = `New Yard Sign Request: ${data.name}`;
          content = `${data.name} (${data.email}) requested ${data.quantity} yard sign(s) for: ${data.address}`;
          break;
        case "donation":
          subject = `New Donation: $${(data.amount / 100).toFixed(2)}`;
          content = `Donation of $${(data.amount / 100).toFixed(2)} from ${data.email}`;
          break;
        case "newsletter":
          subject = `New Newsletter Subscriber`;
          content = `${data.email} subscribed to campaign updates`;
          break;
      }

      res.json({ 
        success: true, 
        message: "Notification logged", 
        subject, 
        content 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error sending notification: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
