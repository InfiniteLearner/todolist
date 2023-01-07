 const getDate = () => {
    const today = new Date();

    const options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    };

    return today.toLocaleDateString("fr-FR", options);
}

const getDay = () => {
    const today = new Date();

    const options = {
        weekday : "long",
    };

    return today.toLocaleDateString("fr-FR", options);
}

export {getDate, getDay};