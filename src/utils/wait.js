const Wait = async (ms = 2500) => {
    await new Promise (resolve => setTimeout(resolve, ms));
    return
}

export default Wait;