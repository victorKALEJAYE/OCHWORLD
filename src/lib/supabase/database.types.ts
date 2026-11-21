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
type OrgRole = "owner" | "admin" | "agent";
type EnquiryStatus = "new" | "responded" | "closed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
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
          created_by: string | null;
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
      organization_members: {
        Row: { organization_id: string; user_id: string; role: OrgRole; created_at: string };
        Insert: { organization_id: string; user_id: string; role?: OrgRole };
        Update: { role?: OrgRole };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_admins: {
        Row: { user_id: string; note: string | null; created_at: string };
        Insert: { user_id: string; note?: string | null };
        Update: { note?: string | null };
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
          status: EnquiryStatus;
          created_at: string;
          updated_at: string;
        };
        /** organization_id and sender_user_id are filled by a database trigger. */
        Insert: {
          property_id: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
        };
        /** Only `status` is updatable (column privilege), and only by the organization. */
        Update: { status?: EnquiryStatus };
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
      organization_invitations: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          role: OrgRole;
          token: string;
          invited_by: string | null;
          created_at: string;
          expires_at: string;
          accepted_at: string | null;
          accepted_by: string | null;
        };
        /** Only these columns are insertable; the token is generated by the database. */
        Insert: { organization_id: string; email: string; role?: OrgRole };
        Update: Record<string, never>;
        Relationships: [];
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
    Functions: {
      complete_onboarding: {
        Args: { account_type: string; organization_name?: string; organization_phone?: string };
        Returns: string | null;
      };
      my_organizations: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          name: string;
          slug: string;
          type: OrganizationType;
          phone: string | null;
          email: string | null;
          role: OrgRole;
        }[];
      };
      is_platform_admin: { Args: Record<string, never>; Returns: boolean };
      invitation_preview: {
        Args: { invite_token: string };
        Returns: { organization_name: string; role: OrgRole; email: string; expired: boolean; accepted: boolean }[];
      };
      accept_invitation: { Args: { invite_token: string }; Returns: string };
      organization_team: {
        Args: { org: string };
        Returns: { user_id: string; full_name: string | null; email: string | null; role: OrgRole; joined_at: string }[];
      };
    };
    Enums: {
      organization_type: OrganizationType;
      listing_type: ListingType;
      listing_status: ListingStatus;
      property_category: PropertyCategory;
      property_type: PropertyType;
      rent_period: RentPeriod;
      org_role: OrgRole;
      enquiry_status: EnquiryStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
export type Views<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T]["Row"];
