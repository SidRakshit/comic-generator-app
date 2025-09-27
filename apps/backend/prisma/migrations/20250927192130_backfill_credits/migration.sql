INSERT INTO user_credits (user_id, panel_balance)
SELECT user_id, 10
FROM users
WHERE user_id NOT IN (SELECT user_id FROM user_credits);
