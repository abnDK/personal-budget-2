/*
before writing to this,

split the interfaces file into a IBudget file, ICategory file and a IBudget file or something the makes equivalent meaning

create ITransactions file for Transactions class and Transaction interface and TransactionRow class

remember to import it to budget.js or somehow

file structure
- transactions.ts
  - ITransactions.ts
  - ITransaction.ts
  - ITransactionRow.ts
  - transactionsQueries.ts
  - transactionDOMTools.ts
  - errorHandling.ts
*/
// event handlers
document.querySelectorAll('.transaction-row').forEach(row => row.addEventListener('click', (e) => { console.log(e.currentTarget); }));
console.log('do we get loaded in??????');
export {};
// error handling
