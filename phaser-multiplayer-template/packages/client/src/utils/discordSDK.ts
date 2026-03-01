import { CommandResponse, DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";
type Auth = CommandResponse<"authenticate">;
let auth: Auth;

const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get("frame_id") != null;

let discordSdk: DiscordSDK | DiscordSDKMock;

const initiateDiscordSDK = async () => {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing VITE_CLIENT_ID. Add it to phaser-multiplayer-template/.env");
  }

  if (isEmbedded) {
    discordSdk = new DiscordSDK(clientId);
    await discordSdk.ready();
  } else {
    // We're using session storage for user_id, guild_id, and channel_id
    // This way the user/guild/channel will be maintained until the tab is closed, even if you refresh
    // Session storage will generate new unique mocks for each tab you open
    // Any of these values can be overridden via query parameters
    // i.e. if you set https://my-tunnel-url.com/?user_id=test_user_id
    // this will override this will override the session user_id value
    const mockUserId = getOverrideOrRandomSessionValue("user_id");
    const mockGuildId = getOverrideOrRandomSessionValue("guild_id");
    const mockChannelId = getOverrideOrRandomSessionValue("channel_id");
    const mockLocationId = getOverrideOrRandomSessionValue("location_id");

    discordSdk = new DiscordSDKMock(clientId, mockGuildId, mockChannelId, mockLocationId);
    const discriminator = String(mockUserId.charCodeAt(0) % 5);

    discordSdk._updateCommandMocks({
      authenticate: async () => {
        return await {
          access_token: "mock_token",
          user: {
            username: mockUserId,
            discriminator,
            id: mockUserId,
            avatar: null,
            public_flags: 1,
          },
          scopes: [],
          expires: new Date(2112, 1, 1).toString(),
          application: {
            description: "mock_app_description",
            icon: "mock_app_icon",
            id: "mock_app_id",
            name: "mock_app_name",
          },
        };
      },
    });
  }
};

// Pop open the OAuth permission modal and request for access to scopes listed in scope array below
const authorizeDiscordUser = async () => {
  if (!isEmbedded) {
    return;
  }
  if (!discordSdk) {
    throw new Error("Discord SDK is not initialized.");
  }

  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: ["identify", "applications.commands"],
  });

  // Match the original template path and log it so we can confirm the live bundle in Discord.
  const tokenPath = "/.proxy/api/token";
  console.log("Discord auth requesting token from:", tokenPath);

  const response = await fetch(tokenPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token endpoint ${tokenPath} returned ${response.status}`);
  }

  const { access_token } = (await response.json()) as { access_token: string };

  // Authenticate with Discord client (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token,
  });
};

const getUserName = () => {
  if (!auth) {
    return "User";
  }

  return auth.user.username;
};

enum SessionStorageQueryParam {
  user_id = "user_id",
  guild_id = "guild_id",
  channel_id = "channel_id",
  location_id = "location_id",
}

function getOverrideOrRandomSessionValue(queryParam: `${SessionStorageQueryParam}`) {
  const overrideValue = queryParams.get(queryParam);
  if (overrideValue != null) {
    return overrideValue;
  }

  const currentStoredValue = sessionStorage.getItem(queryParam);
  if (currentStoredValue != null) {
    return currentStoredValue;
  }

  // Set queryParam to a random 8-character string
  const randomString = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem(queryParam, randomString);
  return randomString;
}

export { discordSdk, initiateDiscordSDK, authorizeDiscordUser, getUserName };
