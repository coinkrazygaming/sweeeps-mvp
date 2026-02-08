const API_BASE_URL = "/api";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function apiCall<T>(
  method: string,
  endpoint: string,
  body?: any,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "API request failed");
  }

  return data;
}

// Auth API
export const authAPI = {
  signup: (email: string, password: string, username: string) =>
    apiCall("POST", "/auth/signup", { email, password, username }),
  login: (email: string, password: string) =>
    apiCall("POST", "/auth/login", { email, password }),
  refresh: (refreshToken: string) =>
    apiCall("POST", "/auth/refresh", { refreshToken }),
};

// Users API
export const usersAPI = {
  getProfile: (token: string) =>
    apiCall<any>("GET", "/users/profile", undefined, token),
  getBalance: (token: string) =>
    apiCall<any>("GET", "/users/balance", undefined, token),
  getTransactionHistory: (token: string, limit = 20, offset = 0) =>
    apiCall<{ transactions: any[] }>(
      "GET",
      `/users/transactions?limit=${limit}&offset=${offset}`,
      undefined,
      token,
    ),
  getGameHistory: (token: string, limit = 20, offset = 0) =>
    apiCall<{ games: any[] }>(
      "GET",
      `/users/games?limit=${limit}&offset=${offset}`,
      undefined,
      token,
    ),
  addDailyBonus: (token: string) =>
    apiCall<any>("POST", "/users/daily-bonus", {}, token),
};

// Games API
export const gamesAPI = {
  listGames: () => apiCall<{ games: any[] }>("GET", "/games", undefined),
  getGameDetails: (gameId: string) =>
    apiCall<any>("GET", `/games/${gameId}`, undefined),
  playGame: (
    token: string,
    gameId: string,
    betAmount: number,
    currencyType: "GC" | "SC",
    gameData?: any,
  ) =>
    apiCall<any>(
      "POST",
      "/games/play",
      { gameId, betAmount, currencyType, gameData },
      token,
    ),
};

// Store API
export const storeAPI = {
  listPackages: () =>
    apiCall<{ packages: any[] }>("GET", "/store/packages", undefined),
  createCheckoutSession: (
    token: string,
    packageId: string,
    promoCode?: string,
  ) => apiCall<any>("POST", "/store/checkout", { packageId, promoCode }, token),
  completePurchase: (
    token: string,
    packageId: string,
    stripeTransactionId: string,
    promoCode?: string,
  ) =>
    apiCall<any>(
      "POST",
      "/store/purchase",
      { packageId, stripeTransactionId, promoCode },
      token,
    ),
  validatePromoCode: (code: string) =>
    apiCall<any>("POST", "/store/validate-promo", { code }),
};

// Redemptions API
export const redemptionsAPI = {
  createRedemptionRequest: (
    token: string,
    sweepstakesCoins: number,
    prizeDescription?: string,
  ) =>
    apiCall(
      "POST",
      "/redemptions",
      { sweepstakesCoins, prizeDescription },
      token,
    ),
  getRedemptionStatus: (token: string, redemptionId: string) =>
    apiCall("GET", `/redemptions/${redemptionId}`, undefined, token),
  getUserRedemptions: (
    token: string,
    status?: string,
    limit = 20,
    offset = 0,
  ) => {
    let url = `/redemptions?limit=${limit}&offset=${offset}`;
    if (status) url += `&status=${status}`;
    return apiCall("GET", url, undefined, token);
  },
  cancelRedemption: (token: string, redemptionId: string) =>
    apiCall("DELETE", `/redemptions/${redemptionId}`, undefined, token),
};

// Admin API
export const adminAPI = {
  searchUsers: (token: string, query?: string, limit = 50, offset = 0) =>
    apiCall<{ users: any[] }>(
      "GET",
      `/admin/users/search?query=${query || ""}&limit=${limit}&offset=${offset}`,
      undefined,
      token,
    ),
  adjustBalance: (
    token: string,
    targetUserId: string,
    currencyType: "GC" | "SC",
    amount: number,
    reason?: string,
  ) =>
    apiCall<any>(
      "POST",
      "/admin/users/balance",
      { targetUserId, currencyType, amount, reason },
      token,
    ),
  freezeAccount: (token: string, targetUserId: string, freeze: boolean) =>
    apiCall<any>(
      "POST",
      "/admin/users/freeze",
      { targetUserId, freeze },
      token,
    ),
  listRedemptions: (
    token: string,
    status = "pending",
    limit = 50,
    offset = 0,
  ) =>
    apiCall<{ redemptions: any[] }>(
      "GET",
      `/admin/redemptions?status=${status}&limit=${limit}&offset=${offset}`,
      undefined,
      token,
    ),
  approveRedemption: (token: string, redemptionId: string, notes?: string) =>
    apiCall<any>(
      "POST",
      "/admin/redemptions/approve",
      { redemptionId, notes },
      token,
    ),
  rejectRedemption: (token: string, redemptionId: string, notes?: string) =>
    apiCall<any>(
      "POST",
      "/admin/redemptions/reject",
      { redemptionId, notes },
      token,
    ),
  getAnalytics: (token: string) =>
    apiCall<any>("GET", "/admin/analytics", undefined, token),
};
