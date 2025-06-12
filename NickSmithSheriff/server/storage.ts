import { 
  users, 
  volunteers, 
  yardSignRequests, 
  donations, 
  newsletterSubscriptions,
  type User, 
  type InsertUser,
  type Volunteer,
  type InsertVolunteer,
  type YardSignRequest,
  type InsertYardSignRequest,
  type Donation,
  type InsertDonation,
  type NewsletterSubscription,
  type InsertNewsletterSubscription
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  createYardSignRequest(request: InsertYardSignRequest): Promise<YardSignRequest>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonationStatus(id: number, status: string, stripePaymentIntentId?: string): Promise<Donation>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getAllVolunteers(): Promise<Volunteer[]>;
  getAllYardSignRequests(): Promise<YardSignRequest[]>;
  getAllDonations(): Promise<Donation[]>;
  getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  deleteVolunteer(id: number): Promise<void>;
  deleteYardSignRequest(id: number): Promise<void>;
  deleteNewsletterSubscription(id: number): Promise<void>;
  updateVolunteer(id: number, updates: Partial<InsertVolunteer>): Promise<Volunteer>;
  updateYardSignRequest(id: number, updates: Partial<InsertYardSignRequest>): Promise<YardSignRequest>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createVolunteer(insertVolunteer: InsertVolunteer): Promise<Volunteer> {
    const [volunteer] = await db
      .insert(volunteers)
      .values(insertVolunteer)
      .returning();
    return volunteer;
  }

  async createYardSignRequest(insertYardSignRequest: InsertYardSignRequest): Promise<YardSignRequest> {
    const [request] = await db
      .insert(yardSignRequests)
      .values(insertYardSignRequest)
      .returning();
    return request;
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const [donation] = await db
      .insert(donations)
      .values(insertDonation)
      .returning();
    return donation;
  }

  async updateDonationStatus(id: number, status: string, stripePaymentIntentId?: string): Promise<Donation> {
    const [donation] = await db
      .update(donations)
      .set({ 
        status, 
        stripePaymentIntentId: stripePaymentIntentId || undefined 
      })
      .where(eq(donations.id, id))
      .returning();
    
    if (!donation) {
      throw new Error("Donation not found");
    }
    
    return donation;
  }

  async createNewsletterSubscription(insertNewsletterSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values(insertNewsletterSubscription)
      .returning();
    return subscription;
  }

  async getAllVolunteers(): Promise<Volunteer[]> {
    return await db.select().from(volunteers);
  }

  async getAllYardSignRequests(): Promise<YardSignRequest[]> {
    return await db.select().from(yardSignRequests);
  }

  async getAllDonations(): Promise<Donation[]> {
    return await db.select().from(donations);
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db.select().from(newsletterSubscriptions);
  }

  async deleteVolunteer(id: number): Promise<void> {
    await db.delete(volunteers).where(eq(volunteers.id, id));
  }

  async deleteYardSignRequest(id: number): Promise<void> {
    await db.delete(yardSignRequests).where(eq(yardSignRequests.id, id));
  }

  async deleteNewsletterSubscription(id: number): Promise<void> {
    await db.delete(newsletterSubscriptions).where(eq(newsletterSubscriptions.id, id));
  }

  async updateVolunteer(id: number, updates: Partial<InsertVolunteer>): Promise<Volunteer> {
    const [volunteer] = await db
      .update(volunteers)
      .set(updates)
      .where(eq(volunteers.id, id))
      .returning();
    
    if (!volunteer) {
      throw new Error("Volunteer not found");
    }
    
    return volunteer;
  }

  async updateYardSignRequest(id: number, updates: Partial<InsertYardSignRequest>): Promise<YardSignRequest> {
    const [request] = await db
      .update(yardSignRequests)
      .set(updates)
      .where(eq(yardSignRequests.id, id))
      .returning();
    
    if (!request) {
      throw new Error("Yard sign request not found");
    }
    
    return request;
  }
}

export const storage = new DatabaseStorage();
