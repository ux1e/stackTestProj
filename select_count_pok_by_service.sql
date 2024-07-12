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
    c.service,
    COUNT(mp.row_id)
  FROM stack.Accounts AS a
  JOIN stack.Counters AS c
    ON a.row_id = c.acc_id
  LEFT JOIN stack.Meter_Pok AS mp
    ON c.row_id = mp.counter_id AND mp.date = input_date
  WHERE
    a.type = 3
    AND c.service IN (SELECT UNNEST(string_to_array(service_numbers, ','))INT)
  GROUP BY
    a.number,
    c.service;
END;
$$ LANGUAGE plpgsql;