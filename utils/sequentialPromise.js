const Promise = require("bluebird");

/**
 * @param {!Array.<function.Promise.<Any>>} promiseArray.
 * @returns {!Promise.<Array.<Any>>} The results of the promises passed to the function.
 */
module.exports = function sequentialPromise(promiseArray) {
    const result = promiseArray.reduce(
        (reduced, promise, index) => {
            reduced.results.push(undefined);
            return {
                chain: reduced.chain
                    .then(() => promise())
                    .then(result => reduced.results[ index ] = result),
                results: reduced.results
            };
        },
        {
            chain: Promise.resolve(),
            results: []
        });
    return result.chain.then(() => result.results);
};