/**
 * 
 * @returns `true` if to refresh dashboard data
 * @description Below code is needed to avoid fetching too much dashboardData
    Essentially, it checks if user is refreshing the page or is coming from directly typed link without a document.referrer attribute.
    If the user is coming from a link that is not the current page or login page, we do not fetch fresh data.
 */
export const refreshDCache = () => {
    if (document.referrer === `${window.location}` || !document.referrer || document.referrer === `${APP_URL}/login`) {
        return true
    } else {
        return false
    }
}

/**
 * 
 * @returns `true` or `false`
 * @description This function does not allow new fetches when the quiz page is refreshed. There is really no need fetching new dashboardData here
 */
export const refreshQuizDCache = () => {
    if (document.referrer !== `${window.location}` || !document.referrer || document.referrer === `${APP_URL}/login`) {
        return true
    } else {
        return false
    }
}

