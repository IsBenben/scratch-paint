const clamp = value => Math.max(0, Math.min(100, value));
const snap = value => Math.round(value / 5) * 5;

// A one-dimensional control accepts either scroll axis without double-stepping.
export const getWheelDelta = event => (Math.abs(event.deltaX || 0) > Math.abs(event.deltaY || 0) ?
    event.deltaX : event.deltaY || 0);

// Use percentage units for every channel, including Blockly's different raw ranges.
export const getWheelValue = (value, deltaY, ctrl) => {
    if (!deltaY) return value;
    const direction = deltaY < 0 ? 1 : -1;
    if (!ctrl) return clamp(value + direction);
    const scaled = value / 5;
    return clamp((direction > 0 ? Math.floor(scaled + 1e-10) + 1 : Math.ceil(scaled - 1e-10) - 1) * 5);
};

export const getWheelShadePosition = (event, current, ctrl) => {
    const x = event.deltaX || 0;
    const y = event.deltaY || 0;
    // Keep Shift + vertical wheel as a saturation shortcut for a mouse wheel.
    if (event.shiftKey && !x) {
        return {saturation: getWheelValue(current.saturation, y, ctrl), brightness: current.brightness};
    }
    return {
        saturation: getWheelValue(current.saturation, -x, ctrl),
        brightness: getWheelValue(current.brightness, y, ctrl)
    };
};

export const getShadePosition = (event, bounds, origin, shift, ctrl) => {
    let saturation = clamp(100 * (event.clientX - bounds.left) / bounds.width);
    let brightness = clamp(100 * (1 - ((event.clientY - bounds.top) / bounds.height)));
    let axis = 'both';
    if (shift) {
        if (Math.abs(saturation - origin.saturation) > Math.abs(brightness - origin.brightness)) {
            brightness = origin.brightness;
            axis = 'x';
        } else {
            saturation = origin.saturation;
            axis = 'y';
        }
    }
    if (ctrl) {
        if (axis !== 'y') saturation = snap(saturation);
        if (axis !== 'x') brightness = snap(brightness);
    }
    return {saturation, brightness, axis};
};

export const getSliderPosition = (x, bounds, offset, ctrl) => {
    const value = clamp(100 * (x - bounds.left - offset) / (bounds.width - 26));
    return ctrl ? snap(value) : value;
};
