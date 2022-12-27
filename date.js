exports.getDate = () => {
    const today = new Date();

    const options = {
        weekday : "long",
        day : "numeric",
        month : "long"
    };

    return today.toLocaleDateString("fr-FR", options);
}

exports.getDay = () => {
    const today = new Date();

    const options = {
        weekday : "long",
    };

    return today.toLocaleDateString("fr-FR", options);
}