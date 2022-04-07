export const constant = Object.freeze({
    authController: {
        loginCookieTime: 1000 * 60 * 60 * 24 * 30,
        registerCookieTime: 1000 * 60 * 60 * 24 * 30,
        googleUserCookieTime: 1000 * 60 * 60 * 24 * 30,
        facebookUserCookieTime: 1000 * 60 * 60 * 24 * 30,
    },
    default: {
        currentPage: 0,
        pageSize: 12,
        pageSizeMd: 24,
        pageSizeLg: 48,
    },
});
