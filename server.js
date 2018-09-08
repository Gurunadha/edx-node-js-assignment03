const async = require('async')
const mongodb = require('mongodb')
const fs = require('fs')
const http = require('http')

const url = 'mongodb://localhost:27017'

const mongoclient = mongodb.MongoClient
    // var data = ''
    // fs.readFile('./m3-customer-data.json', 'utf-8', (err, chunk) => {
    //     if (err)
    //         return console.log(err)
    //     data += chunk
    //     console.log(data)
    // })

mongoclient.connect(url, { useNewUrlParser: true }, (error, client) => {
    if (error)
        process.exit(1)
    const srcdb = client.db('adress')
    const destdb = client.db('data')
    const customerAddress = srcdb.collection('customer-address')
    const customerData = destdb.collection('customer-data')
    let data = ''
    fs.readFile('./m3-customer-data.json', { encoding: "utf-8" }, (err, chunk) => {
        if (err)
            return console.log(err)
        customerData.deleteMany({}, (error, results) => {
            if (error)
                process.exit(1)
                //console.log('deldata:', results)
            customerData.insertMany(JSON.parse(chunk), (error, results) => {
                if (error)
                    process.exit(1)
                console.log(results.result.n)
                console.log(`data: ${results}`)
                fs.readFile('./m3-customer-address-data.json', { encoding: "utf-8" }, (err, chunk) => {
                    if (err)
                        return console.log(err)
                    let addresses = JSON.parse(chunk);
                    customerAddress.deleteMany({}, (error, results) => {
                        if (error)
                            process.exit(1)
                            //console.log('deletedadd:', results)
                        customerAddress.insertMany(JSON.parse(chunk), (error, results) => {
                            if (error)
                                process.exit(1)
                            console.log(results.result.n)
                            console.log(`address: ${results}`)
                            customerAddress.find({}).toArray((error, results) => {
                                if (error)
                                    return console.log(error)
                                        //console.log('addins:', results)
                                var customerAddressRows = results
                                customerData.find({}).toArray((error, results) => {
                                    if (error)
                                        return console.log(error)
                                            //console.log('datains:', results)
                                    var customerDataRows = results

                                    for (let i = 0; i < addresses.length; i++) {
                                        //console.log(addresses[i])
                                        customerData.update({ id: (i + 1).toString() }, { $set: addresses[i] }, (error, results) => {
                                            if (error)
                                                return console.log(error)
                                            customerData.find({ id: (i + 1).toString() }).toArray((error, result) => {
                                                if (error)
                                                    return console.log(error)
                                                console.log(result)
                                            })
                                        })
                                    }
                                })

                            })
                        })
                    })
                })
            })
        })
    })


})