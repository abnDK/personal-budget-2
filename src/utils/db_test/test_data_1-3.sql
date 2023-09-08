-- insert budgets

INSERT INTO budget ("name","date_start", "date_end")
VALUES
('Test_budget', '2000-01-01', '2100-12-31'),
('Mad', '2023-01-01', '2023-12-31'),
('Hus', '2023-01-01', '2023-12-31'),
('Transport', '2023-01-01', '2023-12-31');

-- insert categories

INSERT INTO category ("name", "amount", "budget_id", "parent_id") VALUES
('test_a', 0, 1, null),
('test_b', 0, 1, null),
('root', 0, 4, null),
('Bilka', 100, 2, null),
('Vand', 200, 3, null),
('Varme', 500, 3, null),
('Forsikring', 900, 3, null),
('Offentlig transport', 300, 4, 3),        -- id 8
('Egen kørsel', 350, 4, 3),                -- id 9
('Flyvende transport', 400, 4, 3);         -- id 10

-- insert children categories

INSERT INTO category ("name", "amount", "budget_id", "parent_id") VALUES
('Bus', 400, 4, 8),                     -- id 11
('Tog', 250, 4, 8),                     -- id 12
('Arriva', 250, 4, 11),                 -- id 13
('DSB', 1400, 4, 12),                   -- id 14
('Deutsche Bahn', 220, 4, 12),          -- id 15
('2_DSB', 1400, 4, 12),                 -- id 16
('2_Deutsche Bahn', 220, 4, 12);        -- id 17

-- insert transactions without category
INSERT INTO transaction ("name", "amount", "date")
VALUES
('test_trans_month1_none_1', 1, '2000-01-15'),
('test_trans_month2_none_1', 1, '2000-02-14');

-- insert transactions with category "Arriva", "DSB" and "Deutsche Bahn"
INSERT INTO transaction ("name", "amount", "date", "category_id") 
VALUES 
('Herning - Ikast', 150, '2000-02-01', 13),
('Silkeborg - Ikast', 200, '2015-02-01', 13),
('København - Odense', 350, '2004-02-01', 13),
('Farum - Hjørring', 400, '2000-03-01', 14),
('Jyllinge - Sdr. Omme', 199, '1999-03-01', 14),
('Berlin - Sidney', 20, '1999-03-01', 15),
('London - Liverpool', 75, '1999-03-01', 15),
('2_Farum - Hjørring', 400, '2000-03-01', 16),
('2_Jyllinge - Sdr. Omme', 199, '1999-03-01', 16),
('2_Berlin - Sidney', 20, '1999-03-01', 17),
('2_London - Liverpool', 75, '1999-03-01', 17),
('Baikur - ISS', 100000, '1999-03-01', 15);



