function supportWorkerType() {
    let supports = false

    const test = {
        get type() { supports = true }
    }

    try {
        new Worker('blob://', test).terminate()
    } finally {
        return supports
    }
}

function prepareRunChecker({ timerDelay }) {
    let lastEvent = Date.now()

    return{
        shouldRun() {
            const result = (Date.now() - lastEvent) > timerDelay
            if(result) lastEvent = Date.now()

            return result
        }
    }
}

export { 
    supportWorkerType,
    prepareRunChecker
}