CREATE OR REPLACE FUNCTION stack.select_value_by_house_and_month(
    IN house_number INT,
    IN input_month DATE
)
RETURNS TABLE (
    acc INT,
    name TEXT,
    value BIGINT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.number,
    c.name,
    COALESCE((
      SELECT mp.value
      FROM stack.Meter_Pok mp
      WHERE mp.month = date_trunc('month', input_month)
        AND mp.counter_id = c.row_id
        AND mp.acc_id = a.row_id
      ORDER BY mp.date DESC
      LIMIT 1
    ), 0) AS last_value
  FROM stack.Accounts AS h
  JOIN stack.Accounts AS a ON h.row_id = a.parent_id
  JOIN stack.Counters AS c ON a.row_id = c.acc_id
  WHERE h.type = 1
    AND h.number = house_number
    AND a.type = 3;
END;
$$ LANGUAGE plpgsql;