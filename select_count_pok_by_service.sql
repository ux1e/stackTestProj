CREATE OR REPLACE FUNCTION stack.select_count_pok_by_service(
    IN service_numbers TEXT,
    IN input_date DATE
)
RETURNS TABLE (
    acc INT,
    serv INT,
    count BIGINT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.number,
    s.service::int AS service,
    SUM(CASE WHEN EXISTS (SELECT 1 
                         FROM stack.Meter_Pok mp 
                         WHERE mp.acc_id = a.row_id 
                           AND mp.counter_id = c.row_id 
                           AND mp.date = input_date) THEN 1 ELSE 0 END) AS count
  FROM stack.Accounts a
  JOIN stack.Counters c ON a.row_id = c.acc_id
  JOIN unnest(string_to_array(service_numbers, ',')) AS s(service) ON c.service = s.service::int 
  WHERE a.type = 3
  GROUP BY a.number, s.service;
END;
$$ LANGUAGE plpgsql;