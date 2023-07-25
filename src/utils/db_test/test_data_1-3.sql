-- insert 3 budgets

INSERT INTO budget ("name","date_start", "date_end")
VALUES
('Test_budget', '2000-01-01', '2100-12-31'),
('Mad', '2023-01-01', '2023-12-31'),
('Hus', '2023-01-01', '2023-12-31'),
('Transport', '2023-01-01', '2023-12-31');

-- insert 3 envelopes

INSERT INTO category ("name", "amount", "budget_id") VALUES
('test_a', 0, 1),
('test_b', 0, 1),
('Fakta', 300, 2),
('Bilka', 100, 2),
('Vand', 200, 3),
('Varme', 500, 3),
('Forsikring', 900, 3),
('Rejsekort', 300, 4),
('Benzin', 350, 4),
('Færge', 400, 4);

-- insert transactions with category "test_a"

INSERT INTO transaction ("name", "amount", "date", "category_id") 
VALUES 
('test_trans_month1_a_1', 1, '2000-01-01', 1),
('test_trans_month1_a_2', 1, '2000-01-31', 1),
('test_trans_month2_a_1', 1, '2000-02-01', 1),
('test_trans_month2_a_2', 1, '2000-02-28', 1);

-- insert transactions with cateogry "test_b"
INSERT INTO transaction ("name", "amount", "date", "category_id") 
VALUES 
('test_trans_month2_b_1', 1, '2000-02-01', 2),
('test_trans_month3_b_1', 1, '2000-03-01', 2);

-- insert transactions without category
INSERT INTO transaction ("name", "amount", "date")
VALUES
('test_trans_month1_none_1', 1, '2000-01-15'),
('test_trans_month2_none_1', 1, '2000-02-14');



