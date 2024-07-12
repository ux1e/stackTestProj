CREATE OR REPLACE FUNCTION stack.select_value_by_house_and_month(
    house_number INT,
    input_month DATE
)
RETURNS TABLE (
    acc INT,
    name TEXT,
    value INT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.number AS acc,
    c.name,
    COALESCE(
      (SELECT mp.value
       FROM stack.Meter_Pok mp
       WHERE 
         mp.month = date_trunc('month', input_month)
         AND mp.acc_id = a.row_id
         AND mp.counter_id = c.row_id
       ORDER BY mp.date DESC
       LIMIT 1), 
    0) AS value
  FROM stack.Accounts a
  JOIN stack.Counters c ON a.row_id = c.acc_id
  WHERE 
    a.type = 3  -- Лицевые счета
    AND a.parent_id = (SELECT row_id FROM stack.Accounts WHERE number = house_number AND type = 1);
END;
$$ LANGUAGE plpgsql;