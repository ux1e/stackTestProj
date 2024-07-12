CREATE OR REPLACE FUNCTION stack.select_last_pok_by_acc(
    IN account_number INT
)
RETURNS TABLE (
    acc INT,
    serv INT,
    date DATE,
    tarif INT,
    value INT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (s.service, s.tarif)
    a.number,
    s.service,
    FIRST_VALUE(mp.date) OVER (PARTITION BY s.service, s.tarif ORDER BY mp.date DESC NULLS LAST) AS last_date,
    s.tarif,
    FIRST_VALUE(mp.value) OVER (PARTITION BY s.service, s.tarif ORDER BY mp.date DESC NULLS LAST) AS last_value 
  FROM stack.Accounts AS a
  JOIN stack.Counters AS s
    ON a.row_id = s.acc_id
  LEFT JOIN stack.Meter_pok AS mp
    ON s.row_id = mp.counter_id
  WHERE
    a.number = account_number
  ORDER BY
    s.service, s.tarif, last_date DESC NULLS LAST; -- Добавлено NULLS LAST
END;
$$ LANGUAGE plpgsql;