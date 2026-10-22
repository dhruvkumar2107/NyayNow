/**
 * SafeRender Component
 * Prevents "Objects are not valid as a React child" (Error #31)
 * Usage: <SafeRender data={user.address} fallback="N/A" />
 */
const SafeRender = ({ data, fallback = "" }) => {
    if (data === null || data === undefined) return fallback;

    if (typeof data === "object") {
        // If it's an object, try to render a known display property
        // or stringify it for debugging only in dev
        return data.name || data.title || data.label || JSON.stringify(data);
    }

    return data;
};

export default SafeRender;
