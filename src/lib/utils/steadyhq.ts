/**
 * THIS FILE IS FOR DEMONSTRATION AND TESTING PURPOSES ONLY,
 * IT IS NOT USED IN THE APP AS IT IS
 */
import axios from "axios";

// import { updateUserSubscriptionInDB } from './database';

export async function syncSteadySubscription(code: string) {
  // Exchange code for access token
  const tokenResponse = await axios.post(
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
  const subscriptionResponse = await axios.get(
    "https://steadyhq.com/api/v1/subscription",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  const subscription = subscriptionResponse.data;

  // Sync subscription to your database
  // await updateUserSubscriptionInDB(subscription);

  return { accessToken, subscription };
}
