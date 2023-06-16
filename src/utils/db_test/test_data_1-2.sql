-- insert 3 envelopes

INSERT INTO envelope ("name", "amount") VALUES
('test_envelope_1', 100),
('test_envelope_2', 200),
('test_envelope_3', 300);

-- insert 10 expenses with envelope 1

INSERT INTO expense ("name", "amount", "date", "envelope_id", "recipient", "comment") 
VALUES 
('test_expense_1', 1, '01-01-2000', 1, 'banken', 'gebyrer'),
('test_expense_2', 2, '01-02-2000', 1, 'tankstation', 'cola'),
('test_expense_3', 3, '01-03-2000', 1, 'bibliotek', 'bøde'),
('test_expense_4', 4, '01-04-2000', 1, 'supermarked', 'mælk'),
('test_expense_5', 5, '01-05-2000', 1, 'bageren', 'brød'),
('test_expense_6', 6, '01-06-2000', 1, 'cykelhandler', 'reparation'),
('test_expense_7', 7,'01-07-2000', 1, 'H&M', 'Nyt tøj'),
('test_expense_8', 8, '01-08-2000', 1, 'DSB', 'Pendlerkort'),
('test_expense_9', 9, '01-09-2000', 1, 'Apotek', 'Piller'),
('test_expense_10', 10, '01-10-2000', 1, 'BR', 'Legetøj');




-- insert 10 expenses with envelope 2
INSERT INTO expense ("name", "amount", "date", "envelope_id", "recipient", "comment") 
VALUES 
('test_expense_11', 11, '01-11-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_12', 12, '01-12-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_13', 13, '01-13-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_14', 14, '01-14-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_15', 15, '01-15-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_16', 16, '01-16-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_17', 17, '01-17-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_18', 18, '01-18-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_19', 19, '01-19-2000', 2, 'test_modtager', 'test_comment'),
('test_expense_20', 20, '01-20-2000', 2, 'test_modtager', 'test_comment');
