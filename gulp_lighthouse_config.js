module.exports = {
    extends: 'lighthouse:default',
    output: 'html',
    settings: {
        onlyAudits: [
            'first-meaningful-paint',
            'speed-index',
            'first-cpu-idle',
            'interactive',
        ],
    },
};