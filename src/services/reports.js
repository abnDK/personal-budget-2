// bussiness logic for calculating monthly reports on expenses vs. budget

const pool = require('../configs/queries')


const getReportByEnvelopeId = async (req, res) => {
    const envelope_id = parseInt(req.params.id)

    const { rows: envelope } = await pool.query('SELECT * FROM envelope WHERE id = $1', [envelope_id])

    if (envelope.length == 0) {
        res.status(400).json({"message": "Envelope id unknown"})
        return
    }

    const { rows: expenses } = await pool.query('SELECT * FROM expense WHERE envelope_id = $1', [envelope_id])
    console.log(expenses)
    let expense_sum = 0;

    for (let expense of expenses) {
        expense_sum += expense.amount
    }

    let available_amount = envelope[0].amount - expense_sum;

    console.log('REPORT:')
    console.log(`Envelope: ${envelope[0].name}`)
    console.log(`Envelope amount: ${envelope[0].amount}`)
    console.log(`Total expenses: ${expense_sum}`)
    console.log(`Available amount: ${available_amount}`)
    res.render('report', {
        "envelope_id": envelope_id,
        "envelope_name": envelope[0].name,
        "envelope_amount": envelope[0].amount,
        "total_expenses": expense_sum,
        "available_amount": available_amount,
        "expenses": expenses
    })
    /*
    res.status(200).json({
        "envelope_name": envelope[0].name,
        "envelope_amount": envelope[0].amount,
        "total_expenses": expense_sum,
        "available_amount": available_amount
    })
    */

}

const reportTest = (req, res) => {
    console.log(__dirname)
    res.render('index', { title: "hello there", message: "we're live!" })
}

module.exports = {
    getReportByEnvelopeId,
    reportTest
}