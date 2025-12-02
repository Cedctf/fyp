import { validateApiKey } from "@/lib/api-keys";

export default async function handler(req, res) {
    // 1. Check for API key in headers
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: "Missing API key" });
    }

    // 2. Validate API key
    const keyRecord = await validateApiKey(apiKey);

    if (!keyRecord) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    // 3. Return realistic mock data
    // In a real app, you might use keyRecord.userId to fetch user-specific data from the DB
    return res.status(200).json({
        message: "Success! Data retrieved via Public API.",
        meta: {
            timestamp: new Date().toISOString(),
            request_id: Math.random().toString(36).substring(7),
            user_id: keyRecord.userId,
        },
        data: {
            profile: {
                username: "PlayerOne",
                level: 42,
                reputation: "Elite"
            },
            gaming_stats: {
                game: "Tetris",
                high_score: 15420,
                total_lines_cleared: 1250,
                games_played: 87,
                win_rate: "N/A"
            },
            staking_portfolio: {
                currency: "LINERA",
                total_staked: 500.00,
                rewards_earned: 12.50,
                active_validators: 3,
                positions: [
                    { validator: "Validator A", amount: 200.00, apy: "5.2%" },
                    { validator: "Validator B", amount: 300.00, apy: "4.8%" }
                ]
            },
            recent_activity: [
                { type: "GAME_PLAYED", score: 4500, date: new Date(Date.now() - 86400000).toISOString() },
                { type: "STAKE_REWARD", amount: 0.5, date: new Date(Date.now() - 172800000).toISOString() },
                { type: "GAME_PLAYED", score: 3200, date: new Date(Date.now() - 259200000).toISOString() }
            ]
        }
    });
}
