const fs = require('fs')
const axios = require('axios')
const config = require('./test_config.json')

// var Transaction_Queue = []

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function GetLocalTransactions() {
    if(fs.existsSync('test_db.json')) {
        var local_tx_list = []
        var tx_list = JSON.parse(await fs.promises.readFile('test_db.json', { encoding: 'utf-8' }))
        for(var i=0;i<tx_list.length;i++) {
            if(tx_list[i].direction == "incoming") local_tx_list.push(tx_list[i])
        }
        return local_tx_list
    } else {
        return []
    }
}

async function SaveLocalTransactions(tx_list) {
    await fs.promises.writeFile('test_db.json', JSON.stringify(tx_list))
}

async function markAsSent(txid) {
    var db = await GetLocalTransactions()

    for(var i=0;i<db.length;i++) {
        if(db[i].id == txid) {
            db[i].status = 1
            await SaveLocalTransactions(db)
        }
    }
    
}

async function GetNewTransactionsFromWallet() {
    var data = []
    var yesterday = new Date(new Date().getTime() - (5 * 60 * 60 * 1000));
    // console.log(yesterday.toISOString())
    try {
        await axios.get('http://localhost:8190/v2/wallets/'+config.walletid+'/transactions?start='+yesterday.toISOString())
        .then( r => {
            for(var i=0;i<r.data.length;i++) {
                if(r.data[i].direction == "incoming") data.push(r.data[i])
            }
        })
    } catch(err) {
        console.log(err)
    }
    

    return data
}

async function ProcessFunds() {
    try {
        var has_new = await CheckForNewTransactions()
        if(has_new) {
            await ProcessQueue()
            ProcessFunds()
        } else {
            await ProcessQueue()
            setTimeout( () => { ProcessFunds() }, 10000)
        }
    } catch(err) {
        console.log(err)
    }
    
}

async function CheckForNewTransactions() {
    var has_new_transactions = false
    // Get Existing Transactions
    var db = await GetLocalTransactions()

    // Get Wallet Transactions
    var wallet_tx = await GetNewTransactionsFromWallet()

    // Create List of New Transactions
    var db_tx_list = []
    for(var i=0;i<db.length;i++) {
        db_tx_list.push(db[i].id)
    }

    for(var i=0;i<wallet_tx.length;i++) {
        if(!db_tx_list.includes(wallet_tx[i].id)) {
            has_new_transactions = true
            var tx = wallet_tx[i]

            var sender_address = ""
            for(var j=0;j<tx.outputs.length;j++) {
                
                var output = tx.outputs[j]
                
                if(output.amount.unit == "lovelace" && output.amount.quantity != tx.amount.quantity) {
                    sender_address = output.address
                }
            }

            var new_tx_data = {
                "id": tx.id,
                "amount": tx.amount.quantity,
                "direction": tx.direction,
                "sender": sender_address,
                "status": 0
            }

            // Transaction_Queue.push(new_tx_data)
            db.push(new_tx_data)
        }
    }

    // Save New Transactions
    await SaveLocalTransactions(db)

    return has_new_transactions
}

async function HasPendingTransactions() {
    // Verify No Pending Transactions In Wallet
    var wallet_tx = await GetNewTransactionsFromWallet()
    var pending = false
    for(var i=0;i<wallet_tx.length;i++) {
        if(wallet_tx[i].status == "pending") pending = true
        break
    }
    // console.log(pending)
    return pending
}

async function ProcessQueue() {

    // STARTUP CHECK FOR PENDING ( This is incase the system crashes and a pending tx is there )
    // Process Queue, but do not let it continue until all transactions
    // are no longer pending. Then we can start processing
    
    while(await HasPendingTransactions()) {
        await sleep(10000)
    }

    var new_tx_list = []
    var db = await GetLocalTransactions()
    for(var i=0;i<db.length;i++) {
        var tx = db[i]

        if(tx.status == 0 ) {
            if(tx.direction == "incoming") {
                console.log('New Tx: ' + tx.amount)
                new_tx_list.push(tx)
            }
            
        }
    }

    for(var i=0;i<new_tx_list.length;i++) {
        var tx = new_tx_list[i]
        
        var txBodyJson = await fs.promises.readFile('tx_template.json', {encoding: 'utf-8'})
        var tokenTemplate = JSON.parse(txBodyJson)

        var adaSent = tx.amount / 1000000
        var adaLessFees = adaSent - config.fee
        if(adaLessFees > config.max_ada) {
            adaLessFees = config.max_ada
        }

        if(adaLessFees < config.min_ada) {
            await markAsSent(tx.id)
            return;
        }

        var token_to_send = Math.floor(adaLessFees / parseFloat(config.token_value_per_ada))

        tokenTemplate.payments[0].address = tx.sender 
        tokenTemplate.payments[0].assets[0].quantity = token_to_send
        
        try {
            await axios.post('http://localhost:8190/v2/wallets/'+config.walletid+'/transactions', {
                passphrase: config.spending_phrase,
                payments: tokenTemplate.payments,
                headers: {
                    'Content-Type':'application/json'
                }
            }).then( r => {
                
                console.log("Sent [ "+token_to_send+" ] Token to [ "+tx.sender+" ]")
            })
            await markAsSent(tx.id)
        } catch(e) {
            if(e.code == 'not_enough_money') {

            } else {
                //console.log(e)
            }
            
        }

    }

}
console.log("Starting Up")
ProcessFunds()
