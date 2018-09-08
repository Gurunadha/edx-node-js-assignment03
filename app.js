const mongodb = require('mongodb')
const customers = require('./m3-customer-data.json')
const customersAddress = require('./m3-customer-address-data.json')
const async = require('async')

const url = 'mongodb://localhost:27017'

let tasks = []
let limit = parseInt(process.argv[2], 10) || customers.length

mongodb.MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
    if (error)
        process.exit(1)
    const db = client.db('edx-course')
    customers.forEach((customer, index, list) => {
        customers[index] = Object.assign(customer, customersAddress[index])
        if (index % limit === 0) {
            let start = index
            let end = (start + limit) > customers.length ? customers.length : start + limit
            console.log(`launching customers of ${start}-${end} out of ${customers.length} records`)
            tasks.push((demand) => {
                db.collection('customers').insert(customers.slice(start, end), (error, results) => {
                    demand(error, results)
                })
            })
        }
    })
    let startTime = Date.now()
    console.log(`processing of multiple functions to process ${customers.length} records`)
    async.parallel(tasks, (error, results) => {
        if (error)
            return console.error(error)
        let endTime = Date.now()
        console.log(`Execution time ${endTime-startTime}`)
    })
    client.close()
})