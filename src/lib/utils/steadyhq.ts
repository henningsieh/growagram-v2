/**
 * THIS FILE IS FOR DEMONSTRATION AND TESTING PURPOSES ONLY,
 * IT IS NOT USED IN THE APP AS IT IS
 */
import axios from "axios";

// import { updateUserSubscriptionInDB } from './database';

interface TokenResponse {
  access_token: string;
}

// Subscription states based on Steady documentation
type SubscriptionState = "guest" | "in_trial" | "active" | "not_renewing";
type SubscriptionPeriod = "monthly" | "annual";
type Currency = "EUR" | "USD" | "SEK";

// Create an enum for plan states
type PlanState = "published" | "unpublished" | "archived"; // Add any other known states

// Plan type matching included data
interface Plan {
  type: "plan";
  id: string;
  attributes: {
    state: PlanState;
    name: string;
    currency: Currency;
    "monthly-amount": number;
    "monthly-amount-in-cents"?: number; // Deprecated
    "annual-amount"?: number;
    "annual-amount-in-cents"?: number;
    benefits?: string;
    "ask-for-shiping-address"?: boolean;
    "goal-enabled"?: boolean;
    "subscriptions-goal"?: number | null;
    "countdown-enabled"?: boolean;
    "countdown-ends-at"?: string | null;
    hidden?: boolean;
    "image-url"?: string;
    "inserted-at"?: string;
    "updated-at"?: string;
  };
}

// User type matching included data
interface User {
  type: "user";
  id: string;
  attributes: {
    email: string;
    "first-name"?: string;
    "last-name"?: string;
    "avatar-url"?: string;
  };
}

// Main Subscription interface
interface SubscriptionResponse {
  data: Array<{
    type: "subscription";
    id: string;
    attributes: {
      state: SubscriptionState;
      period: SubscriptionPeriod;
      currency: Currency;
      "monthly-amount": number;
      "monthly-amount-in-cents"?: number; // Deprecated
      "inserted-at": string;
      "updated-at": string;
      "cancelled-at": string | null;
      "trial-ends-at": string | null;
      "active-from": string | null;
      "expires-at": string | null;
      "rss-feed-url"?: string;
      "is-gift"?: boolean;
    };
    relationships: {
      plan: {
        data: {
          type: "plan";
          id: string;
        };
      };
      subscriber: {
        data: {
          type: "user";
          id: string;
        };
      };
      gifter?: {
        data: {
          type: "user";
          id: string;
        };
      };
    };
  }>;
  included: Array<Plan | User>;
}

export async function syncSteadySubscription(code: string) {
  // Exchange code for access token
  const tokenResponse = await axios.post<TokenResponse>(
    "https://steadyhq.com/api/v1/oauth/token",
    {
      client_id: process.env.STEADYHQ_CLIENT_ID,
      client_secret: process.env.STEADYHQ_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/steadyhq/callback`,
    },
  );

  const { access_token: accessToken } = tokenResponse.data;

  // Fetch subscription data
  const subscriptionResponse = await axios.get<SubscriptionResponse>(
    "https://steadyhq.com/api/v1/subscriptions",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.api+json",
      },
    },
  );

  const subscription = subscriptionResponse.data;

  // Sync subscription to your database
  // await updateUserSubscriptionInDB(subscription);

  return { accessToken, subscription };
}
