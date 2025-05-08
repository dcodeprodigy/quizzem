const Wait = async (ms = 2500) => {
    return await new Promise (resolve => setTimeout(resolve, 2500));
}

export default Wait;