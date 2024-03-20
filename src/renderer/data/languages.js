export const languages = ['en', 'es', 'jp', 'fr', 'br', 'ch', 'de', 'ru'];

export const createLocalizationBlock = (initialValue) => {
    let obj = {};
    languages.forEach((language) => {
        if (initialValue instanceof Function) {
            obj[language] = initialValue();
        } else {
            obj[language] = initialValue;
        }
    });
    return obj;
}