const Wait = async (ms = 2500) => {
    await new Promise (resolve => setTimeout(resolve, 2500));
}

export default Wait;