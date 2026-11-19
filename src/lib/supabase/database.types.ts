/**
 * Database types for the Supabase client.
 *
 * Hand-written to match supabase/migrations until the Supabase CLI is linked.
 * Replace with generated types once it is:
 *   npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type OrganizationType = "agency" | "landlord" | "developer";
type ListingType = "sale" | "rent";
type ListingStatus = "draft" | "published" | "archived";
type PropertyCategory = "residential" | "commercial" | "land";
type PropertyType =
  | "apartment"
  | "duplex"
  | "detached_house"
  | "semi_detached_house"
  | "terrace"
  | "bungalow"
  | "penthouse"
  | "land"
  | "office"
  | "shop"
  | "warehouse";
type RentPeriod = "year" | "month";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: OrganizationType;
          about: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type: OrganizationType;
          about?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      districts: {
        Row: { id: number; name: string; slug: string };
        Insert: { name: string; slug: string };
        Update: { name?: string; slug?: string };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          organization_id: string;
          district_id: number;
          slug: string;
          title: string;
          description: string | null;
          listing_type: ListingType;
          category: PropertyCategory;
          property_type: PropertyType;
          status: ListingStatus;
          price: number;
          rent_period: RentPeriod | null;
          address: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          area_sqm: number | null;
          is_furnished: boolean;
          is_featured: boolean;
          features: string[];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          district_id: number;
          slug: string;
          title: string;
          description?: string | null;
          listing_type: ListingType;
          category: PropertyCategory;
          property_type: PropertyType;
          status?: ListingStatus;
          price: number;
          rent_period?: RentPeriod | null;
          address?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqm?: number | null;
          is_furnished?: boolean;
          is_featured?: boolean;
          features?: string[];
          published_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
        ];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          storage_path: string | null;
          alt: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          storage_path?: string | null;
          alt?: string | null;
          position?: number;
        };
        Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      enquiries: {
        Row: {
          id: string;
          property_id: string;
          organization_id: string;
          sender_user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          created_at: string;
        };
        /** organization_id and sender_user_id are filled by a database trigger. */
        Insert: {
          property_id: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
        };
        // No UPDATE policy exists; the type is kept permissive only to satisfy the client's generics.
        Update: Partial<Database["public"]["Tables"]["enquiries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "enquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_properties: {
        Row: { user_id: string; property_id: string; created_at: string };
        Insert: { property_id: string; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["saved_properties"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      district_listing_counts: {
        Row: { id: number; name: string; slug: string; listing_count: number };
        Relationships: [];
      };
      /** Business phone numbers only; null for private landlords. */
      organization_contacts: {
        Row: { id: string; phone: string | null };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      organization_type: OrganizationType;
      listing_type: ListingType;
      listing_status: ListingStatus;
      property_category: PropertyCategory;
      property_type: PropertyType;
      rent_period: RentPeriod;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
export type Views<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T]["Row"];
