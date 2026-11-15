/** @jest-environment jsdom */
/* eslint-env jest, browser */
import React from 'react'; // eslint-disable-line no-unused-vars
import {mount, shallow} from 'enzyme';
import ShadePicker from '../../src/components/color-picker/shade-picker.jsx';
import Slider from '../../src/components/forms/slider.jsx';
import TWColorReadout from '../../src/components/tw-color-readout/tw-color-readout.jsx';
import ColorPickerView from '../../src/components/color-picker/color-picker.jsx'; // eslint-disable-line no-unused-vars
import {ColorPicker} from '../../src/containers/color-picker.jsx'; // eslint-disable-line no-unused-vars
import {getShadePosition, getWheelValue, getWheelShadePosition, getWheelDelta}
    from '../../src/lib/color-picker-position';
import {IntlProvider} from 'react-intl'; // eslint-disable-line no-unused-vars

jest.mock('@turbowarp/paper', () => ({}));
jest.mock('../../src/helper/style-path', () => ({MIXED: 'mixed'}));
jest.unmock('react-intl');

const pointer = (x, y, extra = {}) => ({
    clientX: x,
    clientY: y,
    pointerId: 1,
    button: 0,
    shiftKey: false,
    ctrlKey: false,
    preventDefault: jest.fn(),
    ...extra
});
const fire = (type, values = {}) => {
    const event = new Event(type, {cancelable: true});
    Object.assign(event, values);
    window.dispatchEvent(event);
};
const bounds = {left: 100, top: 200, width: 150, height: 150};
const makeShade = () => {
    const onChange = jest.fn();
    const wrapper = shallow(<ShadePicker
        hue={25} saturation={50} brightness={50} betterColorPicker label="Shade"
        onChange={onChange} onSaturationChange={jest.fn()} onBrightnessChange={jest.fn()}
    />);
    onChange.mockImplementation((saturation, brightness) => wrapper.setProps({saturation, brightness}));
    wrapper.instance().setArea({getBoundingClientRect: () => bounds,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()});
    return {wrapper, picker: wrapper.instance(), onChange};
};

test('2D drag preserves decimals, updates immediately, and Ctrl snaps only active axes', () => {
    const {wrapper, picker, onChange} = makeShade();
    picker.handlePointerDown(pointer(219, 276, {shiftKey: true}));
    expect(onChange).toHaveBeenLastCalledWith(100 * 119 / 150, 50);
    expect(picker.state.axis).toBe('x');
    fire('pointermove', pointer(219, 326, {shiftKey: true, ctrlKey: true}));
    expect(onChange).toHaveBeenLastCalledWith(50, 15);
    expect(picker.state.axis).toBe('y');
    fire('keyup', {key: 'Shift', shiftKey: false, ctrlKey: false});
    expect(onChange).toHaveBeenLastCalledWith(100 * 119 / 150, 100 * (1 - (126 / 150)));
    expect(picker.state.axis).toBe('both');
    fire('pointerup', pointer(219, 326));
    const count = onChange.mock.calls.length;
    fire('pointermove', pointer(100, 200));
    expect(onChange).toHaveBeenCalledTimes(count);
    wrapper.unmount();
});

test('2D Shift hover and cancellation reset listeners and modifier cursors', () => {
    const {wrapper, picker, onChange} = makeShade();
    picker.handlePointerMove(pointer(220, 280));
    fire('keydown', {key: 'Shift', shiftKey: true});
    expect(picker.state.axis).toBe('x');
    picker.handlePointerMove(pointer(180, 340, {shiftKey: true}));
    expect(picker.state.axis).toBe('y');
    expect(onChange).not.toHaveBeenCalled();
    picker.handlePointerLeave();
    expect(picker.state.axis).toBe('both');
    picker.handlePointerDown(pointer(220, 280, {shiftKey: true}));
    fire('pointercancel', pointer(220, 280));
    const count = onChange.mock.calls.length;
    fire('pointermove', pointer(100, 200));
    expect(onChange).toHaveBeenCalledTimes(count);
    picker.handlePointerDown(pointer(220, 280));
    fire('blur');
    expect(picker.state.axis).toBe('both');
    wrapper.unmount();
});

test('native shade readouts submit fractional numbers without Ctrl snapping', () => {
    const {wrapper} = makeShade();
    const inputs = wrapper.find(TWColorReadout);
    expect(inputs).toHaveLength(2);
    const input = shallow(<TWColorReadout {...inputs.at(0).props()} />);
    input.instance().handleSubmit('63.275');
    expect(inputs.at(0).prop('onChange')).toHaveBeenCalledWith(63.275);
    expect(input.find('BufferedInput').prop('step')).toBe('any');
    input.instance().handleSubmit('120');
    expect(inputs.at(0).prop('onChange')).toHaveBeenLastCalledWith(100);
    wrapper.unmount();
    input.unmount();
});

test('horizontal track starts dragging on press and Ctrl uses 5 percent units', () => {
    const onChange = jest.fn();
    const wrapper = shallow(<Slider value={50} betterColorPicker onChange={onChange} />);
    const slider = wrapper.instance();
    const background = {getBoundingClientRect: () => ({left: 100, width: 150}),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()};
    slider.setBackground(background);
    slider.setHandle({getBoundingClientRect: () => ({left: 162})});
    slider.handleMouseDown(pointer(192, 0, {target: background}));
    expect(onChange).toHaveBeenLastCalledWith(100 * 79 / 124);
    const event = new MouseEvent('mousemove', {clientX: 192, ctrlKey: true, cancelable: true});
    document.dispatchEvent(event);
    expect(onChange).toHaveBeenLastCalledWith(65);
    wrapper.setProps({betterColorPicker: false});
    document.dispatchEvent(event);
    expect(onChange).toHaveBeenLastCalledWith(100 * 79 / 124);
    slider.handleMouseUp();
    const count = onChange.mock.calls.length;
    document.dispatchEvent(event);
    expect(onChange).toHaveBeenCalledTimes(count);
    wrapper.unmount();
});

test.each([true, false])('track DOM events update before release with Better enabled=%s', betterColorPicker => {
    const onChange = jest.fn();
    const host = document.createElement('div');
    document.body.appendChild(host);
    const wrapper = mount(<Slider value={50} betterColorPicker={betterColorPicker} onChange={onChange} />,
        {attachTo: host});
    onChange.mockImplementation(value => wrapper.setProps({value}));
    const track = wrapper.getDOMNode();
    const handle = track.firstChild;
    track.getBoundingClientRect = () => ({left: 100, width: 150});
    handle.getBoundingClientRect = () => ({left: 162});
    try {
        track.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, clientX: 192, cancelable: true}));
        expect(onChange).toHaveBeenLastCalledWith(100 * 79 / 124);
        expect(parseFloat(handle.style.left)).toBeCloseTo(79);
        document.dispatchEvent(new MouseEvent('mousemove', {clientX: 215, cancelable: true}));
        expect(onChange).toHaveBeenLastCalledWith(100 * 102 / 124);
        expect(parseFloat(handle.style.left)).toBeCloseTo(102);
        window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Control', ctrlKey: true}));
        expect(onChange).toHaveBeenLastCalledWith(betterColorPicker ? 80 : 100 * 102 / 124);
        window.dispatchEvent(new KeyboardEvent('keyup', {key: 'Control', ctrlKey: false}));
        expect(onChange).toHaveBeenLastCalledWith(100 * 102 / 124);
        document.dispatchEvent(new MouseEvent('mousemove', {clientX: 205, ctrlKey: true, cancelable: true}));
        expect(onChange).toHaveBeenLastCalledWith(betterColorPicker ? 75 : 100 * 92 / 124);
        document.dispatchEvent(new MouseEvent('mouseup'));
        const count = onChange.mock.calls.length;
        track.dispatchEvent(new MouseEvent('click', {bubbles: true, clientX: 100}));
        document.dispatchEvent(new MouseEvent('mousemove', {clientX: 100}));
        window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Control', ctrlKey: true}));
        expect(onChange).toHaveBeenCalledTimes(count);
    } finally {
        wrapper.unmount();
        host.remove();
    }
});

test('2D view replaces saturation and brightness rows, and marks every horizontal slider', () => {
    const props = {
        hue: 25,
        saturation: 50,
        brightness: 50,
        alpha: 100,
        colorIndex: 0,
        color: '#80ff80',
        gradientType: 'SOLID',
        rtl: false,
        isEyeDropping: false,
        shouldShowGradientTools: false,
        betterColorPicker: true,
        twoDimensional: true,
        shadeLabel: 'Shade',
        intl: {}
    };
    for (const name of ['Alpha', 'Hue', 'Saturation', 'Brightness', 'Shade', 'HexColor']) {
        props[`on${name}Change`] = jest.fn();
    }
    for (const name of ['onActivateEyeDropper', 'onChangeGradientTypeHorizontal', 'onChangeGradientTypeRadial',
        'onChangeGradientTypeSolid', 'onChangeGradientTypeVertical', 'onSelectColor',
        'onSelectColor2', 'onTransparent']) {
        props[name] = jest.fn();
    }
    for (const name of ['formatDate', 'formatTime', 'formatRelative', 'formatNumber', 'formatPlural',
        'formatMessage', 'formatHTMLMessage', 'now']) props.intl[name] = () => 'Swap';
    const wrapper = shallow(<ColorPickerView.WrappedComponent {...props} />);
    expect(wrapper.find(ShadePicker)).toHaveLength(1);
    expect(wrapper.find(Slider)).toHaveLength(2);
    wrapper.find(Slider).forEach(slider => expect(slider.prop('betterColorPicker')).toBe(true));
    wrapper.find(TWColorReadout).forEach(input => expect(input.prop('betterColorPicker')).toBe(true));
    wrapper.setProps({twoDimensional: false});
    expect(wrapper.find(ShadePicker)).toHaveLength(0);
    expect(wrapper.find(Slider)).toHaveLength(4);
    wrapper.find(Slider).forEach(slider => expect(slider.prop('betterColorPicker')).toBe(true));
    wrapper.find(TWColorReadout).forEach(input => expect(input.prop('betterColorPicker')).toBe(true));
    wrapper.unmount();
});

test('popup config is independent and black RGB feedback preserves native HSV', () => {
    const onChangeColor = jest.fn();
    const wrapper = shallow(<ColorPicker
        color="#80ff80" color2="#ff0000" colorIndex={0} gradientType="SOLID"
        isEyeDropping={false} rtl={false} shouldShowGradientTools={false}
        onChangeColor={onChangeColor} onSelectColor={jest.fn()} onSelectColor2={jest.fn()}
        onActivateEyeDropper={jest.fn()}
    />);
    const picker = wrapper.instance();
    const root = document.createElement('div');
    const swatch = document.createElement('div');
    root.appendChild(swatch);
    picker.setPickerElement(root);
    const configure = detail => swatch.dispatchEvent(new CustomEvent('sa-color-picker-config', {
        bubbles: true, detail
    }));
    configure({twoDimensional: true, shadeLabel: '阴影'});
    configure({betterColorPicker: true});
    expect(picker.state).toMatchObject({twoDimensional: true, betterColorPicker: true, shadeLabel: '阴影'});
    picker.handleHueChange(37.125);
    picker.handleShadeChange(62.75, 0);
    expect(onChangeColor).toHaveBeenLastCalledWith('#000000');
    wrapper.setProps({color: '#000000'});
    expect(picker.state).toMatchObject({hue: 37.125, saturation: 62.75, brightness: 0});
    configure({twoDimensional: false});
    expect(picker.state).toMatchObject({hue: 37.125, saturation: 62.75, betterColorPicker: true});
    picker.handleBrightnessChange(80.5);
    expect(onChangeColor.mock.calls.at(-1)[0]).not.toBe('#000000');
    wrapper.unmount();
});

test('Ctrl leaves the locked fractional axis unchanged and disabling Better restores decimals', () => {
    const origin = {saturation: 47.25, brightness: 51.625};
    expect(getShadePosition(pointer(225, 280), bounds, origin, true, true))
        .toEqual({saturation: 85, brightness: 51.625, axis: 'x'});
    const {wrapper, picker, onChange} = makeShade();
    wrapper.setProps({betterColorPicker: false});
    picker.handlePointerDown(pointer(219, 276, {ctrlKey: true}));
    expect(onChange).toHaveBeenLastCalledWith(100 * 119 / 150, 100 * (1 - (76 / 150)));
    wrapper.unmount();
});

test('native readiness config enables Ctrl for mounted horizontal and 2D controls and survives reattachment', () => {
    const host = document.createElement('div');
    host.className = 'Popover-body';
    document.body.appendChild(host);
    let betterColorPicker = true;
    const ready = jest.fn(event => {
        if (!event.target.matches('[data-sa-color-picker]')) return;
        event.target.dispatchEvent(new CustomEvent('sa-color-picker-config', {
            bubbles: true, detail: {betterColorPicker, twoDimensional: true, shadeLabel: 'Shade'}
        }));
    });
    document.addEventListener('sa-color-picker-ready', ready);
    const onChangeColor = jest.fn();
    const wrapper = mount(<IntlProvider locale="en"><ColorPicker
        color="#80ff80" color2="#ff0000" colorIndex={0} gradientType="SOLID"
        isEyeDropping={false} rtl={false} shouldShowGradientTools={false}
        onChangeColor={onChangeColor} onSelectColor={jest.fn()} onSelectColor2={jest.fn()}
        onActivateEyeDropper={jest.fn()}
    /></IntlProvider>, {attachTo: host});
    try {
        const picker = wrapper.find(ColorPicker).instance();
        expect(ready).toHaveBeenCalledTimes(1);
        expect(picker.state.betterColorPicker).toBe(true);
        expect(wrapper.find(ShadePicker)).toHaveLength(1);
        const slider = wrapper.find(Slider).first();
        const track = slider.getDOMNode();
        track.getBoundingClientRect = () => ({left: 100, width: 150});
        track.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, clientX: 192, ctrlKey: true}));
        expect(picker.state.hue).toBe(65);
        document.dispatchEvent(new MouseEvent('mousemove', {clientX: 205, ctrlKey: true}));
        expect(picker.state.hue).toBe(75);
        document.dispatchEvent(new MouseEvent('mouseup'));
        const shade = wrapper.find(ShadePicker).getDOMNode().lastChild;
        shade.getBoundingClientRect = () => bounds;
        const down = new Event('pointerdown', {bubbles: true, cancelable: true});
        Object.assign(down, pointer(219, 276, {ctrlKey: true}));
        shade.dispatchEvent(down);
        expect(picker.state).toMatchObject({saturation: 80, brightness: 50});
        fire('pointermove', pointer(231, 311, {ctrlKey: true}));
        expect(picker.state).toMatchObject({saturation: 85, brightness: 25});
        fire('pointerup', pointer(231, 311, {ctrlKey: true}));
        expect(onChangeColor).toHaveBeenCalled();
        const root = host.querySelector('[data-sa-color-picker]');
        picker.setPickerElement(null);
        picker.setPickerElement(root);
        expect(ready).toHaveBeenCalledTimes(2);
        expect(picker.state.betterColorPicker).toBe(true);
        betterColorPicker = false;
        picker.setPickerElement(null);
        picker.setPickerElement(root);
        track.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, clientX: 192, ctrlKey: true}));
        expect(picker.state.hue).toBe(100 * 79 / 124);
        document.dispatchEvent(new MouseEvent('mouseup'));
    } finally {
        document.removeEventListener('sa-color-picker-ready', ready);
        wrapper.unmount();
        host.remove();
    }
});


test('wheel percentages preserve fractions, snap directionally to five, and clamp', () => {
    expect(getWheelValue(63.275, -100, false)).toBe(64.275);
    expect(getWheelValue(63.275, -100, true)).toBe(65);
    expect(getWheelValue(63.275, 100, true)).toBe(60);
    expect(getWheelValue(65, -1, true)).toBe(70);
    expect(getWheelValue(65, 1, true)).toBe(60);
    expect(getWheelValue(99, -1, true)).toBe(100);
    expect(getWheelValue(1, 1, true)).toBe(0);
    expect(getWheelValue(63.275, 0, true)).toBe(63.275);
    expect(getWheelDelta({deltaX: -100, deltaY: 0})).toBe(-100);
    expect(getWheelDelta({deltaX: -100, deltaY: -100})).toBe(-100);
    expect(getWheelShadePosition({deltaX: 100, deltaY: -100},
        {saturation: 63.275, brightness: 51.625}, true)).toEqual({saturation: 65, brightness: 55});
    expect(getWheelShadePosition({deltaX: -100, deltaY: 100},
        {saturation: 63.275, brightness: 51.625}, false)).toEqual({saturation: 62.275, brightness: 50.625});
});

test('mounted horizontal, shade and readout wheels update immediately and respect toggles', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const onChange = jest.fn();
    const slider = mount(<Slider value={63.275} betterColorPicker onChange={onChange} />, {attachTo: host});
    const wheel = (element, options = {}) => {
        const event = new WheelEvent('wheel', {bubbles: true, cancelable: true, deltaY: -100, ...options});
        element.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    };
    try {
        wheel(slider.getDOMNode().firstChild, {ctrlKey: true});
        expect(onChange).toHaveBeenLastCalledWith(65);
        wheel(slider.getDOMNode(), {ctrlKey: true, deltaX: -100, deltaY: 0});
        expect(onChange).toHaveBeenLastCalledWith(65);
        slider.setProps({betterColorPicker: false});
        wheel(slider.getDOMNode(), {ctrlKey: true});
        expect(onChange).toHaveBeenLastCalledWith(64.275);
    } finally {
        slider.unmount();
    }
    const shade = mount(<ShadePicker hue={25} saturation={63.275} brightness={51.625}
        betterColorPicker label="Shade" onChange={onChange}
        onSaturationChange={jest.fn()} onBrightnessChange={jest.fn()} />, {attachTo: host});
    try {
        wheel(shade.getDOMNode().lastChild, {ctrlKey: true, shiftKey: true});
        expect(onChange).toHaveBeenLastCalledWith(65, 51.625);
        wheel(shade.getDOMNode().lastChild, {ctrlKey: true, deltaY: 100});
        expect(onChange).toHaveBeenLastCalledWith(63.275, 50);
        wheel(shade.getDOMNode().lastChild, {ctrlKey: true, deltaX: 100, deltaY: -100});
        expect(onChange).toHaveBeenLastCalledWith(65, 55);
    } finally {
        shade.unmount();
    }
    const readout = mount(<TWColorReadout value={63.275} betterColorPicker onChange={onChange} />,
        {attachTo: host});
    try {
        const input = readout.getDOMNode().querySelector('input');
        input.value = '63.275';
        wheel(input, {ctrlKey: true});
        expect(onChange).toHaveBeenLastCalledWith(65);
        readout.setProps({betterColorPicker: false});
        input.value = '63.275';
        wheel(input, {ctrlKey: true});
        expect(onChange).toHaveBeenLastCalledWith(64.275);
    } finally {
        readout.unmount(); host.remove();
    }
});
